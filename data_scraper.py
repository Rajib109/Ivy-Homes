import sqlite3
import requests
import math
import time
import json
import logging
from typing import Any, Dict, List

# Configuration
API_KEY = "API_KEY"  # Replace with your actual API key
EMAIL = "email"
PASSWORD = "Password"  # Usually the password issued with your API key
BASE_URL = "https://solve.ivy.homes"
DB_NAME = "ivy_homes.db"
LIMIT = 200
REQUESTS_PER_MINUTE_LIMIT = 1200
SLEEP_INTERVAL = 60.0 / REQUESTS_PER_MINUTE_LIMIT # ~0.05 seconds

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def init_db() -> sqlite3.Connection:
    """Initializes the database and creates the necessary tables."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS listings (
        listing_id TEXT PRIMARY KEY, listing_url TEXT, website TEXT, city_id INTEGER,
        apartment_name TEXT, locality TEXT, property_type TEXT, bedroom INTEGER, 
        bathroom INTEGER, balcony INTEGER, floor INTEGER, total_floors INTEGER, 
        furnishing TEXT, facing_direction TEXT, covered_parking INTEGER, price INTEGER,
        carpet_area INTEGER, super_built_up_area INTEGER, latitude REAL, longitude REAL, 
        posted_by TEXT, posted_by_name TEXT, posted_by_contact TEXT, project_id TEXT, 
        description TEXT, posted_at TEXT, is_verified BOOLEAN,
        is_live BOOLEAN -- Added missing undocumented field
    )""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rentals (
        listing_id TEXT PRIMARY KEY, listing_url TEXT, website TEXT, city_id INTEGER, 
        title TEXT, apartment_name TEXT, locality TEXT, property_type TEXT, bedroom INTEGER, 
        bathroom INTEGER, floor INTEGER, total_floors INTEGER, furnishing TEXT, 
        facing_direction TEXT, price INTEGER, deposit INTEGER, maintenance INTEGER,
        carpet_area INTEGER, super_builtup_area INTEGER, latitude REAL, longitude REAL, 
        posted_by TEXT, posted_by_name TEXT, posted_by_contact TEXT, description TEXT, 
        posted_at TEXT,
        is_live BOOLEAN -- Added missing undocumented field
    )""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        project_id TEXT PRIMARY KEY, project_url TEXT, city_id INTEGER, apartment_name TEXT,
        developer_name TEXT, locality TEXT, project_status TEXT, total_units INTEGER, 
        total_towers INTEGER, total_floors INTEGER, launch_date TEXT, possession_date TEXT, 
        rera_number TEXT, min_area_sqft INTEGER, max_area_sqft INTEGER, total_listings INTEGER,
        price_min INTEGER, price_max INTEGER, amenities TEXT, latitude REAL, longitude REAL
    )""")

    conn.commit()
    return conn

def login() -> str:
    """Authenticates the user and returns the Bearer token."""
    logging.info(f"Logging in as {EMAIL}...")
    url = f"{BASE_URL}/auth/login"
    
    # We still need the API key to reach the auth endpoint based on your Postman tests
    headers = {"X-API-Key": API_KEY}
    payload = {"email": EMAIL, "password": PASSWORD}
    
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    response.raise_for_status()
    
    data = response.json()
    logging.info("Successfully logged in.")
    return data["access_token"]

def fetch_page(endpoint: str, page: int, token: str) -> Dict[str, Any]:
    """Fetches a single page from the API with rate limit handling and auth headers."""
    url = f"{BASE_URL}{endpoint}"
    
    # Include BOTH the API Key and the Bearer Token
    headers = {
        "X-API-Key": API_KEY,
        "Authorization": f"Bearer {token}"
    }
    params = {"page": page, "limit": LIMIT}
    
    while True:
        try:
            time.sleep(SLEEP_INTERVAL)
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 429:
                logging.warning("Rate limit hit (429). Backing off for 5 seconds...")
                time.sleep(5)
                continue
                
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed to fetch {endpoint} page {page}: {e}")
            logging.info("Retrying in 5 seconds...")
            time.sleep(5)

def insert_data(conn: sqlite3.Connection, table_name: str, records: List[Dict[str, Any]]):
    """Inserts a batch of records into the specified table."""
    if not records:
        return

    cursor = conn.cursor()
    columns = list(records[0].keys())
    
    processed_records = []
    for record in records:
        row = []
        for col in columns:
            val = record.get(col)
            # Handle nested structures (like amenities array)
            if isinstance(val, (list, dict)):
                row.append(json.dumps(val))
            else:
                row.append(val)
        processed_records.append(tuple(row))

    placeholders = ",".join(["?"] * len(columns))
    col_names = ",".join(columns)
    
    query = f"INSERT OR REPLACE INTO {table_name} ({col_names}) VALUES ({placeholders})"
    
    try:
        cursor.executemany(query, processed_records)
        conn.commit()
    except sqlite3.Error as e:
        logging.error(f"Database insertion error for {table_name}: {e}")
        conn.rollback()

def scrape_endpoint(conn: sqlite3.Connection, endpoint: str, table_name: str, token: str):
    """Orchestrates pagination and ingestion for a specific endpoint."""
    logging.info(f"Starting ingestion for {endpoint} -> table '{table_name}'")
    
    first_page = fetch_page(endpoint, 1, token)
    total_records = first_page.get("total", 0)
    
    if total_records == 0:
        logging.info(f"No records found for {endpoint}.")
        return

    total_pages = math.ceil(total_records / LIMIT)
    logging.info(f"Found {total_records} records across {total_pages} pages.")
    
    insert_data(conn, table_name, first_page.get("results", []))
    logging.info(f"[{table_name}] Progress: Page 1/{total_pages} inserted.")
    
    for page in range(2, total_pages + 1):
        data = fetch_page(endpoint, page, token)
        insert_data(conn, table_name, data.get("results", []))
        logging.info(f"[{table_name}] Progress: Page {page}/{total_pages} inserted.")
        
    logging.info(f"Successfully finished ingestion for {table_name}.\n")

def main():
    if API_KEY == "INSERT_YOUR_API_KEY_HERE" or PASSWORD == "INSERT_YOUR_PASSWORD_HERE":
        logging.error("Please update the API_KEY and PASSWORD variables before running.")
        return

    # 1. Authenticate and get token
    try:
        token = login()
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to log in. Check credentials or API key: {e}")
        return

    # 2. Connect to DB
    conn = init_db()
    
    endpoints_to_scrape = [
        ("/v1/listings", "listings"),
        ("/v1/rentals", "rentals"),
        ("/v1/projects", "projects")
    ]
    
    # 3. Scrape passing the token
    try:
        for endpoint, table in endpoints_to_scrape:
            scrape_endpoint(conn, endpoint, table, token)
    finally:
        conn.close()
        logging.info("Database connection closed. Scraping complete.")
        # Note: According to your Postman findings, tokens are stateless client-side. 
        # No need to hit the `/auth/logout` endpoint, just let it expire.

if __name__ == "__main__":
    main()