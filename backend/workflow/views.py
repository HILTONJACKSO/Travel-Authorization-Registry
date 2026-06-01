from rest_framework import viewsets, status, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import hashlib
import json
from django.utils import timezone
from django.conf import settings
from rest_framework.decorators import action
from .models import Approval, WorkflowStep, Delegation
from .serializers import ApprovalSerializer, WorkflowStepSerializer, DelegationSerializer
from documents.models import Document
from audit.models import AuditLog

class ApprovalViewSet(viewsets.ModelViewSet):
    queryset = Approval.objects.all().order_by('-timestamp')
    serializer_class = ApprovalSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        document = serializer.validated_data['document']
        action = serializer.validated_data['action']
        
        # Check if the user's role matches the required role for the current step
        try:
            current_step_obj = WorkflowStep.objects.get(step_order=document.current_step)
            required_role = current_step_obj.role_required
        except WorkflowStep.DoesNotExist:
            # If no more steps, and it was already approved, do nothing or error
            required_role = None

        if action == 'Approve':
            is_authorized = False
            acting_as_proxy = False
            
            if user.role == required_role:
                is_authorized = True
            elif user.is_staff or (user.role and user.role.name == 'Admin'):
                is_authorized = True
            else:
                from workflow.models import Delegation
                from django.utils import timezone
                now = timezone.now()
                # Check for active delegation
                active = Delegation.objects.filter(
                    to_user=user,
                    start_date__lte=now,
                    end_date__gte=now,
                    from_user__role=required_role
                ).exists()
                if active:
                    is_authorized = True
                    acting_as_proxy = True
            
            if not is_authorized:
                 raise serializers.ValidationError(f"Only {required_role.name} can approve this step.")
            
            # Check if this is the final step
            next_step_exists = WorkflowStep.objects.filter(step_order=document.current_step + 1).exists()
            if next_step_exists:
                document.current_step += 1
                document.status = 'Under Review'
            else:
                document.status = 'Approved'
        elif action == 'Reject':
            document.status = 'Rejected'
        
        document.save()
        
        # Identity and Cryptographic Verification
        timestamp_str = timezone.now().isoformat()
        salt = getattr(settings, 'SIGNATURE_SALT', settings.SECRET_KEY)
        payload = f"{document.id}-{user.id}-{timestamp_str}-{salt}"
        sig_hash = hashlib.sha256(payload.encode()).hexdigest()

        verification_metadata = {
            "ip": self.request.META.get('REMOTE_ADDR'),
            "user_agent": self.request.META.get('HTTP_USER_AGENT'),
            "verified_at": timestamp_str,
            "system_trust_score": 1.0,
            "protocol": "GOV-SIGN-2026-A"
        }
        
        if action == 'Approve' and locals().get('acting_as_proxy'):
            verification_metadata['acting_as_proxy'] = True
            verification_metadata['delegated_role'] = required_role.name

        serializer.save(
            user=user, 
            digital_signature_hash=sig_hash,
            verification_metadata=verification_metadata
        )

        # Notify Document Owner
        from audit.models import Notification
        Notification.objects.create(
            user=document.created_by,
            message=f"Your document '{document.title}' has been {action.lower()}ed by {user.email}.",
            link=f"/documents/{document.id}"
        )

        # If moved to next step, notify reviewers of that step
        if action == 'Approve' and document.status == 'Under Review':
            try:
                next_step_obj = WorkflowStep.objects.get(step_order=document.current_step)
                from users.models import CustomUser
                reviewers = CustomUser.objects.filter(role=next_step_obj.role_required)
                for reviewer in reviewers:
                    Notification.objects.create(
                        user=reviewer,
                        message=f"New document awaiting your review: '{document.title}' (Step {document.current_step})",
                        link=f"/documents/{document.id}"
                    )
            except WorkflowStep.DoesNotExist:
                pass

        AuditLog.objects.create(
            user=user,
            action=f"Document {document.id} - {action} (Step {document.current_step})",
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class WorkflowStepViewSet(viewsets.ModelViewSet):
    queryset = WorkflowStep.objects.all()
    serializer_class = WorkflowStepSerializer
    permission_classes = [IsAuthenticated]

class DelegationViewSet(viewsets.ModelViewSet):
    serializer_class = DelegationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from django.db.models import Q
        return Delegation.objects.filter(Q(from_user=self.request.user) | Q(to_user=self.request.user))
        
    def perform_create(self, serializer):
        serializer.save(from_user=self.request.user)
