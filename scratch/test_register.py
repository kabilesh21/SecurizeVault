import urllib.request
import json

url = "http://localhost:8080/api/auth/register"
payload = {
    "username": "testuser_random_2",
    "email": "testuser_random_2@gmail.com",
    "password": "password123"
}

headers = {
    "Content-Type": "application/json"
}

try:
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode('utf-8'))
except Exception as e:
    if hasattr(e, 'read'):
        print("Error:", e.read().decode('utf-8'))
    else:
        print("Error:", str(e))
