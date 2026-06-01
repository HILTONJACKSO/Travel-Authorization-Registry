import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import CustomUser, Role
from documents.models import Document, DocumentMetadata
from audit.models import AuditLog, Notification
from workflow.models import WorkflowStep

def clear_data():
    print("--- Initiating System Data Purge ---")
    
    # 1. Clear Documents
    doc_count = Document.objects.count()
    Document.objects.all().delete()
    DocumentMetadata.objects.all().delete()
    print(f"Purged {doc_count} Documents and associated metadata.")
    
    # 2. Clear Audit and Notifications
    audit_count = AuditLog.objects.count()
    notification_count = Notification.objects.count()
    AuditLog.objects.all().delete()
    Notification.objects.all().delete()
    print(f"Purged {audit_count} Audit Logs and {notification_count} Notifications.")
    
    # 3. Clear Non-Essential Users
    # We keep 'admin@ministry.gov' and 'staff@ministry.gov' for testing
    essential_emails = ['admin@ministry.gov', 'staff@ministry.gov']
    users_to_delete = CustomUser.objects.exclude(email__in=essential_emails).exclude(is_superuser=True)
    user_count = users_to_delete.count()
    users_to_delete.delete()
    print(f"Purged {user_count} Non-Essential User accounts.")
    
    print("--- System Cleaned for Testing ---")

if __name__ == '__main__':
    clear_data()
