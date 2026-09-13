import requests
import sqlite3
import math
import time
import json

# Configuration
API_KEY = "IVY26-XXXXXXXXXXXX"  # Replace with your actual API key
BASE_URL = "https://solve.ivy.homes"
DB_NAME = "ivy_homes_raw.db"
MAX_LIMIT = 200

def setup_database(cursor):
    """Creates tables with a simple schema: ID and the raw JSON payload."""
    tables = ["listings", "rentals", "projects"]
    for table in tables:
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {table} (
                id TEXT PRIMARY KEY,
                raw_data JSON
            )
        """)

def save_records(table_name, records, cursor, conn):
    """Upserts records into the SQLite database."""
    if not records:
        return
        
    id_key = "project_id" if table_name == "projects" else "listing_id"
    
    rows = []
    for record in records:
        record_id = str(record.get(id_key))
        rows.append((record_id, json.dumps(record)))
        
    cursor.executemany(
        f"INSERT OR REPLACE INTO {table_name} (id, raw_data) VALUES (?, ?)", 
        rows
    )
    conn.commit()

def extract_endpoint(endpoint_path, table_name, cursor, conn):
    url = f"{BASE_URL}{endpoint_path}"
    params = {
        "api_key": API_KEY,
        "page": 1,
        "limit": MAX_LIMIT
    }
    
    # 1. Fetch Page 1 to determine total records
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    
    total_records = data.get("total", 0)
    total_pages = math.ceil(total_records / MAX_LIMIT)
    
    print(f"[{table_name.upper()}] Found {total_records} records across {total_pages} pages.")
    
    # Save the first page
    save_records(table_name, data.get("results", []), cursor, conn)
    
    # 2. Loop through remaining pages
    for page in range(2, total_pages + 1):
        params["page"] = page
        
        # Throttle to stay safely under 1200 req/min (0.05s = 20 req/sec)
        time.sleep(0.055)
        
        res = requests.get(url, params=params)
        
        # Handle potential rate limits gracefully
        if res.status_code == 429:
            print("Rate limit hit (HTTP 429). Backing off for 5 seconds...")
            time.sleep(5)
            res = requests.get(url, params=params)
            
        res.raise_for_status()
        page_data = res.json()
        
        save_records(table_name, page_data.get("results", []), cursor, conn)
        
        if page % 10 == 0 or page == total_pages:
            print(f"[{table_name.upper()}] Progress: {page}/{total_pages} pages fetched.")

if __name__ == "__main__":
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    setup_database(cursor)
    
    # Map endpoints to their respective SQLite tables
    target_endpoints = {
        "/v1/listings": "listings",
        "/v1/rentals": "rentals",
        "/v1/projects": "projects"
    }
    
    for endpoint, table in target_endpoints.items():
        extract_endpoint(endpoint, table, cursor, conn)
        
    conn.close()
    print("Sweep complete. Data stored in", DB_NAME)