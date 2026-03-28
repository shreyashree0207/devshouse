import requests
import json

BASE_URL = "http://localhost:8000"

test_ids = ["shiksha-foundation", "MH/2018/0187432", "non-existent"]

for tid in test_ids:
    print(f"\nTesting ID: {tid}")
    try:
        res = requests.get(f"{BASE_URL}/ngos/{tid}")
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            print(f"Data: {json.dumps(res.json(), indent=2)[:200]}...")
        else:
            print(f"Error: {res.text}")
    except Exception as e:
        print(f"Request failed: {e}")
