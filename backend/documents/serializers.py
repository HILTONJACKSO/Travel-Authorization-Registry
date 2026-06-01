from rest_framework import serializers
from .models import Document, DocumentMetadata
from workflow.serializers import ApprovalSerializer

class DocumentMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentMetadata
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    metadata = DocumentMetadataSerializer(required=False)
    approvals = ApprovalSerializer(many=True, read_only=True)
    created_by_email = serializers.ReadOnlyField(source='created_by.email')
    current_step_role = serializers.SerializerMethodField()
    can_approve = serializers.SerializerMethodField()

    target_role = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['created_by', 'status']

    def get_can_approve(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
            
        user = request.user
        required_role = self.get_current_step_role(obj)
        
        if not required_role:
            return False
            
        if user.role and user.role.name == required_role:
            return True
            
        # Check for active delegations
        from django.utils import timezone
        from workflow.models import Delegation
        now = timezone.now()
        
        # Is there any active delegation given TO this user FROM someone with the required role?
        active_delegations = Delegation.objects.filter(
            to_user=user,
            start_date__lte=now,
            end_date__gte=now,
            from_user__role__name=required_role
        ).exists()
        
        return active_delegations

    def validate_file(self, value):
        import os
        ext = os.path.splitext(value.name)[1].lower()
        valid_extensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg']
        
        if ext not in valid_extensions:
            raise serializers.ValidationError(
                f"Unsupported file extension. Allowed extensions are: {', '.join(valid_extensions)}"
            )

        # Cap file size at 10MB
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size exceeds the 10MB limit.")

        return value

    def validate(self, data):
        metadata_data = data.get('metadata')
        if not metadata_data:
            return data

        start_date = metadata_data.get('start_date')
        end_date = metadata_data.get('end_date')
        destination = metadata_data.get('destination')
        user = self.context['request'].user

        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError({"metadata": {"end_date": "Return date must be after departure date. "}})

            # Check for overlapping approved/pending trips for this user
            overlapping = Document.objects.filter(
                created_by=user,
                status__in=['Pending', 'Under Review', 'Approved'],
                metadata__start_date__lte=end_date,
                metadata__end_date__gte=start_date
            )
            if self.instance: # If updating
                overlapping = overlapping.exclude(id=self.instance.id)

            if overlapping.exists():
                trip = overlapping.first()
                raise serializers.ValidationError({
                    "metadata": {
                        "overlapping": f"Official conflict detected: You already have a travel request ('{trip.title}') scheduled during this period ({trip.metadata.start_date} to {trip.metadata.end_date})."
                    }
                })

        is_admin = user.is_staff or (user.role and user.role.name == 'Admin')

        if not is_admin:
            from django.utils import timezone
            from datetime import timedelta
            
            # Check 1: Destination Redundancy (30 days)
            if destination:
                thirty_days_ago = timezone.now() - timedelta(days=30)
                redundant = Document.objects.filter(
                    created_by=user,
                    created_at__gte=thirty_days_ago,
                    metadata__destination__iexact=destination
                ).exclude(status='Rejected')
                
                if self.instance:
                    redundant = redundant.exclude(id=self.instance.id)
                    
                if redundant.exists():
                    raise serializers.ValidationError({
                        "metadata": {
                            "duplicate": f"Duplicate Detection: A travel request to '{destination}' was submitted within the last 30 days. To prevent exploitation of resources, this request requires Admin override."
                        }
                    })

            # Check 2: Title Redundancy (7 days)
            if data.get('title'):
                seven_days_ago = timezone.now() - timedelta(days=7)
                redundant_title = Document.objects.filter(
                    created_by=user,
                    created_at__gte=seven_days_ago,
                    title__iexact=data.get('title')
                ).exclude(status='Rejected')
                
                if self.instance:
                    redundant_title = redundant_title.exclude(id=self.instance.id)
                    
                if redundant_title.exists():
                    raise serializers.ValidationError({
                        "title": "Duplicate Detection: A document with this exact title was submitted within the last 7 days. Duplicate records are restricted."
                    })

        return data

    def get_current_step_role(self, obj):
        from workflow.models import WorkflowStep
        try:
            step = WorkflowStep.objects.get(step_order=obj.current_step)
            return step.role_required.name
        except WorkflowStep.DoesNotExist:
            return None

    def create(self, validated_data):
        metadata_data = validated_data.pop('metadata', None)
        target_role_id = validated_data.pop('target_role', None)
        
        if target_role_id:
            from workflow.models import WorkflowStep
            try:
                # Find the step that corresponds to the target role
                step = WorkflowStep.objects.filter(role_required_id=target_role_id).first()
                if step:
                    validated_data['current_step'] = step.step_order
                    # If we're starting at any step other than the first, status becomes Under Review
                    if step.step_order > 1:
                        validated_data['status'] = 'Under Review'
            except Exception:
                pass

        document = Document.objects.create(**validated_data)
        if metadata_data:
            metadata = DocumentMetadata.objects.create(**metadata_data)
            document.metadata = metadata
            document.save()
        return document

