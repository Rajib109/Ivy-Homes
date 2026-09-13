import requests
import sys

BASE_URL = "https://solve.ivy.homes"
API_KEY = "API_KEY"
EMAIL = "EMAIL"
PASSWORD = "PASSWORD" 

def run_tests():
    print("Starting API Verification Tests (V2 Probe)...\n")
    
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
            print(f"  [DEBUG] /health raw response: {data}")
            
            # Check common time keys
            time_str = data.get("time", data.get("timestamp", ""))
            
            if "+05:30" in str(time_str) or "IST" in str(time_str):
                print(f"  [DISCREPANCY] /health returned local time: {time_str}")
            elif "Z" in str(time_str) or "+00:00" in str(time_str):
                print(f"  [MATCH] /health returned UTC: {time_str}")
            else:
                print(f"  [UNKNOWN] Format: {time_str}")
        else:
            print(f"  [ERROR] /health returned status {res_health.status_code} | {res_health.text}")
    except Exception as e:
        print(f"  [ERROR] {e}")

    # --- Authentication ---
    print("\nAuthenticating...")
    login_payload = {"email": EMAIL, "password": PASSWORD}
    res_auth = session.post(f"{BASE_URL}/auth/login", json=login_payload)
    
    if res_auth.status_code != 200:
        print(f"  [FATAL] Login failed with status {res_auth.status_code}")
        print(f"  [DEBUG] Response: {res_auth.text}")
        sys.exit(1)
        
    auth_data = res_auth.json()
    print(f"  [DEBUG] Auth raw response keys: {list(auth_data.keys())}")
    
    # Grab the token safely, checking both documented and common undocumented keys
    token = auth_data.get("token") or auth_data.get("access_token")
    
    if not token:
        print(f"  [FATAL] Could not find a token string in the response. Raw body: {auth_data}")
        sys.exit(1)

    session.headers.update({"Authorization": f"Bearer {token}"})
    print("  Authenticated successfully. Token attached.\n")

    # --- Test 2: Pagination Limit ---
    print("Test 2: Pagination Limit (/v1/listings?limit=250)")
    res_pag = session.get(f"{BASE_URL}/v1/listings", params={"limit": 250})
    if res_pag.status_code == 200:
        results = res_pag.json().get("results", [])
        print(f"  [RESULT] Returned {len(results)} records.")
    else:
        print(f"  [ERROR] Status {res_pag.status_code} | {res_pag.text}")

    # --- Test 3: Total Field vs Actual Total ---
    print("\nTest 3: Total Field (/v1/listings?limit=10)")
    res_total = session.get(f"{BASE_URL}/v1/listings", params={"limit": 10})
    if res_total.status_code == 200:
        print(f"  [RESULT] API reports 'total': {res_total.json().get('total')}")
    else:
        print(f"  [ERROR] Status {res_total.status_code} | {res_total.text}")

    # --- Test 4: Price Filter Contradiction ---
    print("\nTest 4: Price Filter (min_price=999999999, max_price=10)")
    res_price = session.get(f"{BASE_URL}/v1/listings", params={"min_price": 999999999, "max_price": 10})
    if res_price.status_code == 200:
        print(f"  [RESULT] Returned {len(res_price.json().get('results', []))} records.")
    else:
        print(f"  [ERROR] Status {res_price.status_code} | {res_price.text}")

    # --- Test 5: Furnishing Filter Contradiction ---
    print("\nTest 5: Furnishing Filter (furnishing=nonsense_value)")
    res_furnish = session.get(f"{BASE_URL}/v1/listings", params={"furnishing": "nonsense_value"})
    if res_furnish.status_code == 200:
        print(f"  [RESULT] Returned {len(res_furnish.json().get('results', []))} records.")
    else:
        print(f"  [ERROR] Status {res_furnish.status_code} | {res_furnish.text}")

    # --- Test 6: Missing Endpoints ---
    print("\nTest 6: Missing Endpoint (/v1/listings/100-1000042/similar)")
    res_similar = session.get(f"{BASE_URL}/v1/listings/100-1000042/similar")
    print(f"  [RESULT] Status {res_similar.status_code} | {res_similar.text}")

if __name__ == "__main__":
    run_tests()