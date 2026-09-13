import requests

API_KEY = "IVY26-0F408E87FC93"
PASSWORD = "97351bcad1"
LOGIN_URL = f"https://solve.ivy.homes/auth/login?api_key={API_KEY}"

print("--- Testing Health ---")
health = requests.get("https://solve.ivy.homes/health")
print(f"Health Status: {health.status_code}\n")

print("--- Test 1: JSON payload (What the docs said) ---")
r1 = requests.post(LOGIN_URL, json={"email": "demo1@ivy.homes", "password": PASSWORD})
print(f"Status: {r1.status_code}")
print(f"Response: {r1.text}\n")

print("--- Test 2: JSON payload with 'username' ---")
r2 = requests.post(LOGIN_URL, json={"username": "demo1@ivy.homes", "password": PASSWORD})
print(f"Status: {r2.status_code}")
print(f"Response: {r2.text}\n")

print("--- Test 3: Form Data (Standard OAuth2) ---")
r3 = requests.post(LOGIN_URL, data={"username": "demo1@ivy.homes", "password": PASSWORD})
print(f"Status: {r3.status_code}")
print(f"Response: {r3.text}\n")

print("--- Test 4: Basic Auth directly on endpoint ---")
r4 = requests.get(f"https://solve.ivy.homes/v1/listings?api_key={API_KEY}", auth=("demo1@ivy.homes", PASSWORD))
print(f"Status: {r4.status_code}")
print(f"Response: {r4.text[:50]}\n")