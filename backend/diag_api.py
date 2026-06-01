import requests
import json

# Get Token
token_script = """
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import CustomUser
u = CustomUser.objects.filter(email='amin@ministry.gov').first()
print(RefreshToken.for_user(u).access_token)
"""
import subprocess
token = subprocess.check_output(['python', 'manage.py', 'shell', '-c', token_script], text=True).strip()

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

response = requests.get('http://localhost:8000/api/documents/reports/', headers=headers)
print(f"Status Code: {response.status_code}")
print("Response Body:")
print(json.dumps(response.json(), indent=4))
