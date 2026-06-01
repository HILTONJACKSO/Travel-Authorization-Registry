import os
import django
import hashlib
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from workflow.models import Approval
from django.contrib.auth import get_user_model

def verify_signatures():
    print("--- Digital Signature Cryptographic Verification ---")
    User = get_user_model()
    
    approvals = Approval.objects.exclude(digital_signature_hash__isnull=True).exclude(digital_signature_hash='')
    
    if not approvals.exists():
        print("[!] No signed approvals found in the ledger. Please perform an approval in the frontend first.")
        return
        
    print(f"Found {approvals.count()} signed approvals to verify.")
    valid_count = 0
    invalid_count = 0
    
    salt = "MINSTRY_OF_STATE_OFFICIAL_SECRET_KEY"
    
    for approval in approvals:
        doc_id = approval.document.id
        user_id = approval.user.id
        
        # We need the exact timestamp used during creation which is stored in verification_metadata
        verified_at = approval.verification_metadata.get('verified_at')
        
        if not verified_at:
            print(f"[X] Invalid Signature Block for Approval ID {approval.id}: Missing verification timestamp.")
            invalid_count += 1
            continue
            
        payload = f"{doc_id}-{user_id}-{verified_at}-{salt}"
        expected_hash = hashlib.sha256(payload.encode()).hexdigest()
        
        if expected_hash == approval.digital_signature_hash:
            print(f"[✓] Signature verified for Document {doc_id} by User {user_id}. Hash: {expected_hash[:16]}...")
            valid_count += 1
        else:
            print(f"[X] FORGERY DETECTED for Approval ID {approval.id}! Expected {expected_hash}, got {approval.digital_signature_hash}")
            invalid_count += 1
            
    print("--------------------------------------------------")
    print(f"Total Verified: {valid_count} | Total Invalid: {invalid_count}")
    
if __name__ == '__main__':
    verify_signatures()
