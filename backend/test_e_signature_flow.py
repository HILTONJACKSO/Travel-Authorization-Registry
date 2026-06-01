import os
import django
import hashlib
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from documents.models import Document
from workflow.models import Approval
from workflow.serializers import ApprovalSerializer
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request
from workflow.views import ApprovalViewSet

def test_signature_flow():
    print("--- Testing End-to-End Signature Flow ---")
    User = get_user_model()
    
    # Create or get a test user
    from users.models import Role
    user = User.objects.filter(username="admin").first()
    if not user:
        role, _ = Role.objects.get_or_create(name="Admin")
        user, _ = User.objects.get_or_create(email="admin@state.gov", defaults={"username": "admin", "role": role})
    
    # Create a test document
    doc = Document.objects.create(
        title="Test Executive Order 2026",
        created_by=user,
        status="Pending"
    )
    print(f"[+] Created test document: {doc.title} (ID: {doc.id})")
    
    # Simulate an approval request
    factory = APIRequestFactory()
    request = factory.post('/api/workflow/approvals/', {
        'document': doc.id,
        'action': 'Approve',
        'comment': 'Authorized by the Minister.',
        'signature_image': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' # 1x1 png
    }, format='json')
    from rest_framework.test import force_authenticate
    request.user = user
    force_authenticate(request, user=user)
    request.META['REMOTE_ADDR'] = '192.168.1.100'
    request.META['HTTP_USER_AGENT'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    
    # We test the view directly
    view = ApprovalViewSet.as_view({'post': 'create'})
    response = view(request)
    
    if response.status_code == 201:
        print("[+] Approval created successfully via API.")
        
        # Now verify the signature
        approval = Approval.objects.get(id=response.data['id'])
        
        verified_at = approval.verification_metadata.get('verified_at')
        salt = "MINSTRY_OF_STATE_OFFICIAL_SECRET_KEY"
        payload = f"{doc.id}-{user.id}-{verified_at}-{salt}"
        expected_hash = hashlib.sha256(payload.encode()).hexdigest()
        
        if expected_hash == approval.digital_signature_hash:
            print(f"[SUCCESS] Signature Hash Validated! ({expected_hash})")
            print(f"[SUCCESS] Image stored: {approval.signature_image[:30]}...")
            print(f"[SUCCESS] Verification Metadata: {approval.verification_metadata}")
            print(f"[SUCCESS] Document updated status: {doc.status}")
        else:
            print("[X] Hash validation failed!")
    else:
        print(f"[X] Failed to create approval. Status: {response.status_code}")
        print(response.data)

if __name__ == '__main__':
    test_signature_flow()
