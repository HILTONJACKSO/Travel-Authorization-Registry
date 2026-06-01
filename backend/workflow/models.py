from django.db import models
from django.conf import settings
from documents.models import Document
from users.models import Role
import uuid

class WorkflowStep(models.Model):
    step_order = models.PositiveIntegerField(unique=True)
    role_required = models.ForeignKey(Role, on_delete=models.CASCADE)

    class Meta:
        ordering = ['step_order']

    def __str__(self):
        return f"Step {self.step_order}: {self.role_required.name}"

class Approval(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='approvals')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=50, choices=(
        ('Approve', 'Approve'),
        ('Reject', 'Reject'),
        ('Request Changes', 'Request Changes'),
        ('Comment', 'Comment')
    ))
    comment = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Digital Signature Fields
    signature_image = models.TextField(blank=True, null=True, help_text="Base64 encoded signature image")
    digital_signature_hash = models.CharField(max_length=255, blank=True, null=True)
    verification_metadata = models.JSONField(default=dict, blank=True)

class Delegation(models.Model):
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='delegations_given', on_delete=models.CASCADE)
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='delegations_received', on_delete=models.CASCADE)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    def __str__(self):
        return f"{self.from_user} -> {self.to_user}"
