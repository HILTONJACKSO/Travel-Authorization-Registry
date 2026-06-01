import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import authenticate
from users.models import CustomUser, Role
from users.serializers import UserSerializer

def test_user_auth():
    print("--- Verifying Authentication Fix ---")
    
    # 1. Ensure Role exists
    role, _ = Role.objects.get_or_create(name='Staff')
    
    # 2. Use Serializer to create user
    test_email = 'auth_fixed_final@ministry.gov'
    test_password = 'SecurityTest@123'
    
    # Clean up old test user if exists
    CustomUser.objects.filter(email=test_email).delete()
    
    data = {
        'email': test_email,
        'password': test_password,
        'role': role.id
    }
    
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        print(f"User {test_email} created via Serializer.")
        
        # 3. Attempt Authentication
        authenticated_user = authenticate(username=test_email, password=test_password)
        if authenticated_user:
            print("SUCCESS: User authenticated successfully!")
        else:
            print("FAILURE: Authentication failed for new user.")
    else:
        print(f"Serializer Error: {serializer.errors}")

if __name__ == '__main__':
    test_user_auth()
