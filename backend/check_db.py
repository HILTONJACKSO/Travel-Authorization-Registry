import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from documents.models import Document
from workflow.models import Approval

print(f"Total Documents: {Document.objects.count()}")
for doc in Document.objects.all():
    print(f"Doc ID: {doc.id}, Title: {doc.title}, Status: {doc.status}, Metadata: {doc.metadata}")

print(f"\nTotal Approvals: {Approval.objects.count()}")
for app in Approval.objects.all():
    print(f"Approval ID: {app.id}, Doc: {app.document.title}, Action: {app.action}, User: {app.user.email}")
