from rest_framework import serializers
from .models import Approval, WorkflowStep, Delegation

class ApprovalSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    user_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Approval
        fields = '__all__'
        read_only_fields = ['user']

class WorkflowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = '__all__'

class DelegationSerializer(serializers.ModelSerializer):
    to_user_email = serializers.ReadOnlyField(source='to_user.email')
    to_user_name = serializers.ReadOnlyField(source='to_user.username')
    from_user_email = serializers.ReadOnlyField(source='from_user.email')

    class Meta:
        model = Delegation
        fields = '__all__'
        read_only_fields = ['from_user']
