from rest_framework import serializers
from .models import CustomUser, Role, Ministry

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class MinistrySerializer(serializers.ModelSerializer):
    personnel_count = serializers.IntegerField(source='personnel.count', read_only=True)

    class Meta:
        model = Ministry
        fields = ['id', 'name', 'code', 'personnel_count']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    role_details = RoleSerializer(source='role', read_only=True)
    ministry_details = MinistrySerializer(source='ministry', read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'role_details', 'ministry', 'ministry_details', 'is_2fa_enabled', 'password', 'profile_picture']

    def create(self, validated_data):
        email = validated_data.get('email')
        if email and 'username' not in validated_data:
            validated_data['username'] = email
            
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
