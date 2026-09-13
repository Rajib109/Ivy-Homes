import requests
import sys

BASE_URL = "https://solve.ivy.homes"
API_KEY = "API_KEY"
EMAIL = "EMAIL"
PASSWORD = "PASSWORD"

def run_deep_tests():
    print("Starting API Verification Tests (Phase 3)...\n")
    session = requests.Session()
    session.headers.update({"X-API-Key": API_KEY, "Content-Type": "application/json"})

    # --- Auth Setup ---
    res_auth = session.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
    if res_auth.status_code != 200:
        print("  [FATAL] Login failed.")
        sys.exit(1)
    
    token = res_auth.json().get("access_token")
    session.headers.update({"Authorization": f"Bearer {token}"})

    # --- Test 7: Pagination Envelope Keys ---
    print("Test 7: Pagination Envelope Structure")
    res_pag = session.get(f"{BASE_URL}/v1/listings", params={"limit": 2})
    if res_pag.status_code == 200:
        keys = list(res_pag.json().keys())
        print(f"  [DEBUG] Envelope keys returned: {keys}")
        if "page" not in keys or "page_size" not in keys:
            print("  [DISCREPANCY] Documented keys 'page' and/or 'page_size' are missing from the response.")
    else:
        print(f"  [ERROR] Status {res_pag.status_code}")

    # --- Test 8: Sorting Functionality ---
    print("\nTest 8: Sorting (sort_by=price&order=desc)")
    res_sort = session.get(f"{BASE_URL}/v1/listings", params={"sort_by": "price", "order": "desc", "limit": 2})
    if res_sort.status_code == 200:
        results = res_sort.json().get("results", [])
        if len(results) >= 2:
            price_1 = results[0].get("price", 0)
            price_2 = results[1].get("price", 0)
            print(f"  [DEBUG] Price 1: {price_1}, Price 2: {price_2}")
            if price_1 < price_2:
                print("  [DISCREPANCY] API ignored 'desc' order! Results are ascending or random.")
            else:
                print("  [MATCH] Sorting appears to be working correctly.")
    else:
        print(f"  [ERROR] Status {res_sort.status_code}")

    # --- Test 9: Ghost Endpoints ---
    print("\nTest 9: Checking for Ghost Endpoints")
    endpoints = ["/v1/rentals", "/v1/projects", "/v1/analytics/summary"]
    for ep in endpoints:
        res_ep = session.get(f"{BASE_URL}{ep}")
        print(f"  [DEBUG] GET {ep} -> Status {res_ep.status_code}")
        if res_ep.status_code == 404:
            print(f"    [DISCREPANCY] {ep} is a ghost endpoint (404).")

    # --- Test 10: The Logout / Stateless Lie ---
    print("\nTest 10: Server-Side Logout Invalidation")
    res_logout = session.post(f"{BASE_URL}/auth/logout")
    print(f"  [DEBUG] Logout response status: {res_logout.status_code}")
    
    # Try using the same token again
    res_after_logout = session.get(f"{BASE_URL}/v1/listings", params={"limit": 1})
    if res_after_logout.status_code == 200:
        print("  [DISCREPANCY] Token is STILL VALID after /auth/logout! The API is completely stateless.")
    elif res_after_logout.status_code == 401:
        print("  [MATCH] Token was successfully invalidated on the server.")
    else:
        print(f"  [UNKNOWN] Unexpected status after logout: {res_after_logout.status_code}")

if __name__ == "__main__":
    run_deep_tests()