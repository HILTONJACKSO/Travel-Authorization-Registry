import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import authenticate
from users.models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken

def test_login_logic():
    email = 'admin@ministry.gov'
    password = 'Password@pos1' # From seed_db.py
    
    print(f"Attempting login for {email}...")
    user = authenticate(username=email, password=password)
    
    if user:
        print(f"SUCCESS: User {user.email} authenticated.")
        refresh = RefreshToken.for_user(user)
        response_data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'role': user.role.name if user.role else 'None'
        }
        print(f"Response Data: {json.dumps(response_data, indent=2)}")
    else:
        print("FAILURE: Invalid credentials or authentication configuration error.")
        # Try without 'username' keyword if it's the issue
        user_alt = authenticate(email=email, password=password)
        if user_alt:
            print("SUCCESS (Alt): Authenticated using 'email' keyword instead of 'username'.")
        else:
            print("FAILURE (Alt): Still failed using 'email' keyword.")

if __name__ == '__main__':
    test_login_logic()
