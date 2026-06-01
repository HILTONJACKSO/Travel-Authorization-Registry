from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.contrib.auth import authenticate
from .models import CustomUser, Role, Ministry
from .serializers import UserSerializer, RoleSerializer, MinistrySerializer

from django.core.cache import cache

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ip = request.META.get('REMOTE_ADDR')
        cache_key = f"login_attempts_{ip}"
        attempts = cache.get(cache_key, 0)
        
        if attempts >= 5:
            print(f"[AUTH] Rate limit exceeded for IP: {ip}")
            return Response({'error': 'Too many failed login attempts. Please try again in 5 minutes.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        email = request.data.get('email')
        password = request.data.get('password')
        print(f"[AUTH] Attempting login for: {email} from IP: {ip}")
        user = authenticate(username=email, password=password)
        if user:
            cache.delete(cache_key)
            print(f"[AUTH] Success: {user.email}")
            if user.is_2fa_enabled:
                print(f"[AUTH] 2FA Required for: {user.email}")
                return Response({'message': 'OTP sent', 'requires_otp': True}, status=status.HTTP_200_OK)
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role.name if user.role else 'None',
                'profile_picture': user.profile_picture.url if user.profile_picture else None
            })
        
        cache.set(cache_key, attempts + 1, 300) # Lockout for 5 minutes (300 seconds)
        print(f"[AUTH] Failed: {email} from IP: {ip} (Attempt {attempts + 1}/5)")
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        print(f"[AUTH] Verifying OTP for: {email}")
        # Simulate OTP verification (hardcoded for MVP)
        if otp == '123456':
            try:
                user = CustomUser.objects.get(email=email)
                print(f"[AUTH] OTP Success: {user.email}")
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role.name if user.role else 'None',
                    'profile_picture': user.profile_picture.url if user.profile_picture else None
                })
            except CustomUser.DoesNotExist:
                print(f"[AUTH] OTP Failed (User not found): {email}")
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        print(f"[AUTH] OTP Invalid: {email}")
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]

class MinistryViewSet(viewsets.ModelViewSet):
    queryset = Ministry.objects.all()
    serializer_class = MinistrySerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]

from rest_framework.decorators import action

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    @action(detail=False, methods=['GET', 'PATCH'], permission_classes=[IsAuthenticated])
    def me(self, request):
        user = request.user
        if request.method == 'PATCH':
            serializer = self.get_serializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        
        serializer = self.get_serializer(user)
        return Response(serializer.data)
