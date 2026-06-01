import requests
import subprocess
import json

# Get Token for Administrator
token_script = """
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import CustomUser
# Find user containing "Administrator" or "admin"
u = CustomUser.objects.filter(is_superuser=True).first() or CustomUser.objects.first()
print(u.email)
print(RefreshToken.for_user(u).access_token)
"""

try:
    output = subprocess.check_output(['python', 'manage.py', 'shell', '-c', token_script], text=True).strip().split('\n')
    email = output[0]
    token = output[1]
    print(f"Using token for: {email}")

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    response = requests.get('http://localhost:8000/api/documents/reports/', headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=4))
except Exception as e:
    print(f"Error: {e}")
