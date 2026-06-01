from django.db import models
from django.conf import settings
import uuid

class DocumentMetadata(models.Model):
    department = models.CharField(max_length=255)
    doc_type = models.CharField(max_length=100)
    priority = models.CharField(max_length=50, choices=(
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('Urgent', 'Urgent')
    ))
    destination = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    purpose = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True)
    
    ROI_CHOICES = (
        ('Negligible Impact', 'Negligible Impact'),
        ('Low Impact', 'Low Impact'),
        ('Moderate Benefit', 'Moderate Benefit'),
        ('High Strategic Impact', 'High Strategic Impact'),
        ('Critical National Benefit', 'Critical National Benefit')
    )
    travel_roi_rating = models.CharField(max_length=50, choices=ROI_CHOICES, blank=True, null=True)
    travel_outcome_report = models.TextField(blank=True, null=True)

from django.core.validators import FileExtensionValidator

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    file = models.FileField(
        upload_to='documents/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'png', 'jpg', 'jpeg'])]
    )
    status = models.CharField(max_length=50, default='Pending', choices=(
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Under Review', 'Under Review')
    ))
    current_step = models.PositiveIntegerField(default=1)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_documents')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    metadata = models.OneToOneField(DocumentMetadata, on_delete=models.CASCADE, related_name='document', null=True)

    def __str__(self):
        return self.title
