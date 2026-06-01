import os
import django
import uuid
from datetime import date

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from documents.models import Document, DocumentMetadata
from users.models import CustomUser
from rest_framework.exceptions import ValidationError
from documents.serializers import DocumentSerializer
from rest_framework import serializers

def run_test():
    print("Starting Travel Duplication Logic Audit...")
    
    # 1. Create a test user
    uid = uuid.uuid4().hex[:6]
    email = f"test_travel_{uid}@example.com"
    user = CustomUser.objects.create_user(username=email, email=email, password="password123")
    print(f"Created Test User: {email}")

    # 2. Mock a request context for the serializer
    class MockRequest:
        def __init__(self, user):
            self.user = user

    context = {'request': MockRequest(user)}

    # 3. Create a valid travel request
    print("Submitting First Mission Request (2026-05-01 to 2026-05-10)...")
    data1 = {
        'title': 'Diplomatic Summit A',
        'metadata': {
            'department': 'Ministry of State',
            'doc_type': 'Travel Authorization',
            'priority': 'Urgent',
            'destination': 'Brussels, Belgium',
            'start_date': '2026-05-01',
            'end_date': '2026-05-10',
            'purpose': 'International Trade Negotiations'
        }
    }
    
    # We need a dummy file for the serializer to work if required, but models.FileField can be blank=True if not required.
    # Actually, Document model has file = models.FileField(upload_to=...) which is required.
    # I'll create a dummy file on disk.
    with open('/tmp/dummy.pdf', 'w') as f:
        f.write('dummy content')
    
    from django.core.files.uploadedfile import SimpleUploadedFile
    dummy_file = SimpleUploadedFile("dummy.pdf", b"file_content", content_type="application/pdf")
    data1['file'] = dummy_file

    serializer1 = DocumentSerializer(data=data1, context=context)
    if serializer1.is_valid():
        doc1 = serializer1.save(created_by=user)
        print(f"Mission A Registered: {doc1.id}")
    else:
        print("FAILED to register Mission A:", serializer1.errors)
        return

    # 4. Try to submit an overlapping mission
    print("\nAttempting to Submit Overlapping Mission (2026-05-05 to 2026-05-15)...")
    data2 = {
        'title': 'Infrastructure Inspection',
        'metadata': {
            'department': 'Public Works',
            'doc_type': 'Travel Authorization',
            'priority': 'Medium',
            'destination': 'Monrovia, Liberia',
            'start_date': '2026-05-05',
            'end_date': '2026-05-15',
            'purpose': 'Building Safety Audit'
        },
        'file': dummy_file
    }
    
    serializer2 = DocumentSerializer(data=data2, context=context)
    try:
        if serializer2.is_valid():
            print("ERROR: Overlapping mission was incorrectly accepted!")
        else:
            print("SUCCESS: Overlapping mission was BLOCKED as expected.")
            print("Error Details:", serializer2.errors.get('metadata', {}).get('overlapping'))
    except Exception as e:
        print("Caught unexpected exception during validation:", e)

    # 5. Try to submit a duplicate mission (same destination, same start date)
    print("\nAttempting to Submit Redundant Mission (Same Destination & Date)...")
    data3 = {
        'title': 'Duplicate Summit Request',
        'metadata': {
            'department': 'Ministry of State',
            'doc_type': 'Travel Authorization',
            'priority': 'Low',
            'destination': 'Brussels, Belgium',
            'start_date': '2026-05-01',
            'end_date': '2026-05-10',
            'purpose': 'Negotiations Round 2'
        },
        'file': dummy_file
    }
    
    serializer3 = DocumentSerializer(data=data3, context=context)
    if not serializer3.is_valid():
        print("SUCCESS: Redundant mission was BLOCKED as expected.")
        print("Error Details:", serializer3.errors.get('metadata', {}).get('duplicate'))
    else:
        print("ERROR: Redundant mission was incorrectly accepted!")

    print("\nTravel Duplication Audit Complete.")

if __name__ == "__main__":
    run_test()
