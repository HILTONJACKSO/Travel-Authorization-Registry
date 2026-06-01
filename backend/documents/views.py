from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Document
from .serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by('-created_at')
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Document.objects.all().order_by('-created_at')
            
        if user.role and user.role.name == 'Admin':
            if getattr(user, 'ministry', None):
                return Document.objects.filter(created_by__ministry=user.ministry).order_by('-created_at')
            return Document.objects.all().order_by('-created_at')
            
        return Document.objects.filter(created_by=user).order_by('-created_at')

    def perform_create(self, serializer):
        document = serializer.save(created_by=self.request.user)
        
        # Notify reviewers of the first step
        try:
            from workflow.models import WorkflowStep
            from audit.models import Notification
            from users.models import CustomUser
            
            first_step = WorkflowStep.objects.get(step_order=1)
            reviewers = CustomUser.objects.filter(role=first_step.role_required)
            for reviewer in reviewers:
                Notification.objects.create(
                    user=reviewer,
                    message=f"New document submitted for review: '{document.title}'",
                    link=f"/documents/{document.id}"
                )
        except Exception as e:
            print(f"Error creating upload notification: {e}")

    @action(detail=False, methods=['get'])
    def pending_my_approval(self, request):
        user = request.user
        if not user.role:
            return Response([])
        
        from workflow.models import WorkflowStep, Delegation
        from django.utils import timezone
        now = timezone.now()
        
        my_steps = list(WorkflowStep.objects.filter(role_required=user.role).values_list('step_order', flat=True))
        
        active_delegators = Delegation.objects.filter(
            to_user=user,
            start_date__lte=now,
            end_date__gte=now
        ).values_list('from_user', flat=True)
        
        if active_delegators:
            from users.models import CustomUser
            delegator_roles = CustomUser.objects.filter(id__in=active_delegators).values_list('role', flat=True)
            delegated_steps = list(WorkflowStep.objects.filter(role_required__in=delegator_roles).values_list('step_order', flat=True))
            my_steps.extend(delegated_steps)
            my_steps = list(set(my_steps))
        
        docs = Document.objects.filter(
            current_step__in=my_steps,
            status__in=['Pending', 'Under Review']
        ).order_by('-created_at')
        
        serializer = self.get_serializer(docs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def calendar_events(self, request):
        user = request.user
        
        if not (user.is_staff or (user.role and user.role.name == 'Admin')):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Travel Calendar is restricted to Administrative clearance.")

        qs = Document.objects.filter(
            status='Approved',
            metadata__destination__isnull=False,
            metadata__start_date__isnull=False
        ).select_related('created_by', 'created_by__role')
        
        if not user.is_staff and getattr(user, 'ministry', None):
            qs = qs.filter(created_by__ministry=user.ministry)

        docs = qs
        
        events = []
        for doc in docs:
            events.append({
                "id": doc.id,
                "title": doc.title,
                "user_name": f"{doc.created_by.first_name} {doc.created_by.last_name}".strip() or doc.created_by.email,
                "user_role": doc.created_by.role.name if doc.created_by.role else "Official",
                "destination": doc.metadata.destination,
                "start_date": doc.metadata.start_date.isoformat() if doc.metadata.start_date else None,
                "end_date": doc.metadata.end_date.isoformat() if doc.metadata.end_date else None,
            })
            
        return Response(events)

    @action(detail=False, methods=['get'])
    def travel_history(self, request):
        user = request.user
        # Get all approved documents created by the user that have travel metadata (destination and dates)
        docs = Document.objects.filter(
            created_by=user,
            status='Approved',
            metadata__destination__isnull=False,
            metadata__start_date__isnull=False
        ).order_by('-metadata__start_date')
        
        serializer = self.get_serializer(docs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit_roi_report(self, request, pk=None):
        document = self.get_object()
        user = request.user
        
        if document.created_by != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the original applicant can submit the Post-Travel ROI report.")
            
        if document.status != 'Approved':
            from rest_framework.exceptions import ValidationError
            raise ValidationError("ROI Debriefs can only be submitted for Approved missions.")
            
        outcome = request.data.get('travel_outcome_report')
        roi_rating = request.data.get('travel_roi_rating')
        
        if not outcome or not roi_rating:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Both Outcome Report and ROI Rating are required.")
            
        if document.metadata:
            document.metadata.travel_outcome_report = outcome
            document.metadata.travel_roi_rating = roi_rating
            document.metadata.save()
            return Response({"message": "Post-Travel ROI Report successfully recorded."})
            
        from rest_framework.exceptions import ValidationError
        raise ValidationError("No travel metadata found for this request.")


from rest_framework.views import APIView
from django.db.models import Count, Avg, F
from django.utils import timezone
from datetime import timedelta

class ReportAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Document.objects.all().select_related('metadata')
        
        if not user.is_staff and getattr(user, 'ministry', None):
            qs = qs.filter(created_by__ministry=user.ministry)

        total = qs.count()
        if total == 0:
            return Response({
                'stats': {
                    'total_documents': 0,
                    'approved_documents': 0,
                    'pending_approvals': 0,
                    'rejected_documents': 0,
                    'avg_approval_time': 0,
                    'compliance_rate': 0
                },
                'departmental_throughput': [],
                'status_breakdown': [],
                'recent_ledger': []
            })

        # Departmental Throughput (More robust aggregation via Python summarization)
        all_docs = qs
        total = all_docs.count()
        
        print(f"[DEBUG] ReportAnalyticsView: Total docs in DB = {total}")

        if total == 0:
            return Response({
                'stats': {
                    'total_documents': 0,
                    'approved_documents': 0,
                    'pending_approvals': 0,
                    'rejected_documents': 0,
                    'avg_approval_time': 0,
                    'compliance_rate': 0
                },
                'departmental_throughput': [],
                'status_breakdown': [],
                'recent_ledger': []
            })
        
        dept_map = {}
        status_map = {}
        total_time = 0
        
        roi_map = {}
        
        for doc in all_docs:
            # Status Stats
            s = doc.status
            status_map[s] = status_map.get(s, 0) + 1
            
            # Dept Stats
            dept = doc.metadata.department if doc.metadata else 'Uncategorized'
            dept_map[dept] = dept_map.get(dept, 0) + 1
            
            # ROI Stats
            if doc.metadata and getattr(doc.metadata, 'travel_roi_rating', None):
                roi = doc.metadata.travel_roi_rating
                roi_map[roi] = roi_map.get(roi, 0) + 1
            
            # Approval Time
            if doc.status == 'Approved':
                total_time += (doc.updated_at - doc.created_at).total_seconds()

        approved = status_map.get('Approved', 0)
        pending = status_map.get('Pending', 0) + status_map.get('Under Review', 0)
        rejected = status_map.get('Rejected', 0)

        avg_time = (total_time / approved / 3600) if approved > 0 else 0
        compliance_rate = (approved / total * 100) if total > 0 else 0
        
        # Recent Ledger
        recent_docs = all_docs.order_by('-updated_at')[:15]
        from .serializers import DocumentSerializer
        ledger_data = DocumentSerializer(recent_docs, many=True).data

        print(f"[DEBUG] ReportAnalyticsView: Approved={approved}, Pending={pending}, Compliance={compliance_rate}%")

        return Response({
            'stats': {
                'total_documents': total,
                'approved_documents': approved,
                'pending_approvals': pending,
                'rejected_documents': rejected,
                'avg_approval_time': round(avg_time, 1),
                'compliance_rate': round(compliance_rate, 1)
            },
            'departmental_throughput': [
                {
                    'name': name,
                    'count': count,
                    'percentage': round(count / total * 100, 1) if total > 0 else 0
                } for name, count in sorted(dept_map.items(), key=lambda x: x[1], reverse=True)
            ],
            'status_breakdown': [
                {
                    'name': name,
                    'count': count,
                    'percentage': round(count / total * 100, 1) if total > 0 else 0
                } for name, count in status_map.items()
            ],
            'roi_breakdown': [
                {
                    'name': name,
                    'count': count,
                    'percentage': round(count / sum(roi_map.values()) * 100, 1) if sum(roi_map.values()) > 0 else 0
                } for name, count in sorted(roi_map.items(), key=lambda x: x[1], reverse=True)
            ],
            'recent_ledger': ledger_data
        })

from audit.models import AuditLog
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Document.objects.all()
        
        if not user.is_staff and getattr(user, 'ministry', None):
            qs = qs.filter(created_by__ministry=user.ministry)

        total = qs.count()
        pending = qs.filter(status__in=['Pending', 'Under Review']).count()
        approved = qs.filter(status='Approved').count()
        rejected = qs.filter(status='Rejected').count()
        
        from .serializers import DocumentSerializer
        recent_docs = qs.order_by('-created_at')[:5]
        docs_data = DocumentSerializer(recent_docs, many=True).data

        return Response({
            'statistics': {
                'total': total,
                'pending': pending,
                'approved': approved,
                'rejected': rejected
            },
            'recent_documents': docs_data
        })
