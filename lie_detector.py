import requests
import sys

BASE_URL = "https://solve.ivy.homes"
API_KEY = "API_KEY"
EMAIL = "EMAIL"
# Assuming the API key itself acts as the password based on "password issued with your key"
PASSWORD = "PASSWORD" 

def run_tests():
    print("Starting API Verification Tests...\n")
    
    # Session to hold headers
    session = requests.Session()
    session.headers.update({
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    })

    # --- Test 1: Health / Timezone ---
    print("Test 1: /health Timezone")
    try:
        res_health = session.get(f"{BASE_URL}/health")
        if res_health.status_code == 200:
            data = res_health.json()
            time_str = data.get("time", "")
            if "+05:30" in time_str or "IST" in time_str:
                print(f"  [DISCREPANCY] /health returned local time (IST/+05:30): {time_str}")
            elif "Z" in time_str or "+00:00" in time_str:
                print(f"  [MATCH] /health returned UTC as documented: {time_str}")
            else:
                print(f"  [UNKNOWN] /health returned unexpected format: {time_str}")
        else:
            print(f"  [ERROR] /health returned status {res_health.status_code}")
    except Exception as e:
        print(f"  [ERROR] {e}")

    # --- Authentication (Required for subsequent tests) ---
    print("\nAuthenticating...")
    login_payload = {"email": EMAIL, "password": PASSWORD}
    res_auth = session.post(f"{BASE_URL}/auth/login", json=login_payload)
    
    if res_auth.status_code != 200:
        print(f"  [FATAL] Login failed with status {res_auth.status_code}. Exiting.")
        print(f"  Response: {res_auth.text}")
        sys.exit(1)
        
    token = res_auth.json().get("token")
    session.headers.update({"Authorization": f"Bearer {token}"})
    print("  Authenticated successfully.\n")

    # --- Test 2: Pagination Limit ---
    print("Test 2: Pagination Limit (/v1/listings?limit=250)")
    try:
        res_pag = session.get(f"{BASE_URL}/v1/listings", params={"limit": 250})
        if res_pag.status_code == 200:
            data = res_pag.json()
            results = data.get("results", [])
            returned_count = len(results)
            if returned_count > 200:
                print(f"  [DISCREPANCY] Endpoint did not respect max limit of 200. Returned {returned_count} records.")
            else:
                print(f"  [MATCH] Endpoint respected limit constraints. Returned {returned_count} records.")
        else:
            print(f"  [ERROR] /v1/listings returned status {res_pag.status_code}")
    except Exception as e:
        print(f"  [ERROR] {e}")

    # --- Test 3: Total vs Actual Array Length ---
    print("\nTest 3: Total Field vs Actual Total")
    try:
        # Fetching a small limit just to see what 'total' reports
        res_total = session.get(f"{BASE_URL}/v1/listings", params={"limit": 10})
        if res_total.status_code == 200:
            data = res_total.json()
            reported_total = data.get("total", 0)
            print(f"  API reports 'total': {reported_total}")
            print("  (To fully test this, you would iterate through all pages and count the results. "
                  "If 'total' is a lie, iterating all pages often yields a different sum.)")
        else:
             print(f"  [ERROR] Status {res_total.status_code}")
    except Exception as e:
         print(f"  [ERROR] {e}")

    # --- Test 4: Price Filter Contradiction ---
    print("\nTest 4: Price Filter (min_price=999999999, max_price=10)")
    try:
        res_price = session.get(f"{BASE_URL}/v1/listings", params={
            "min_price": 999999999,
            "max_price": 10
        })
        if res_price.status_code == 200:
            results = res_price.json().get("results", [])
            if len(results) > 0:
                print(f"  [DISCREPANCY] API ignored impossible price filters and returned {len(results)} records.")
            else:
                print("  [MATCH] API returned 0 records for impossible price filters.")
        else:
             print(f"  [ERROR] Status {res_price.status_code}")
    except Exception as e:
         print(f"  [ERROR] {e}")

    # --- Test 5: Furnishing Filter Contradiction ---
    print("\nTest 5: Furnishing Filter (furnishing=nonsense_value)")
    try:
        res_furnish = session.get(f"{BASE_URL}/v1/listings", params={
            "furnishing": "nonsense_value"
        })
        if res_furnish.status_code == 200:
            results = res_furnish.json().get("results", [])
            if len(results) > 0:
                print(f"  [DISCREPANCY] API ignored invalid furnishing filter and returned {len(results)} records.")
            else:
                print("  [MATCH] API returned 0 records for invalid furnishing filter.")
        else:
             print(f"  [ERROR] Status {res_furnish.status_code}")
    except Exception as e:
         print(f"  [ERROR] {e}")

    # --- Test 6: Missing Endpoints ---
    print("\nTest 6: Missing Endpoint (/v1/listings/100-1000042/similar)")
    try:
        res_similar = session.get(f"{BASE_URL}/v1/listings/100-1000042/similar")
        if res_similar.status_code == 404:
            print("  [MATCH] Endpoint properly returned 404 Not Found.")
        else:
            print(f"  [DISCREPANCY] Endpoint returned status {res_similar.status_code} instead of 404.")
    except Exception as e:
         print(f"  [ERROR] {e}")

if __name__ == "__main__":
    run_tests()