from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, VerifyOTPView, UserViewSet, RoleViewSet, MinistryViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'ministries', MinistryViewSet, basename='ministry')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('admin/', include(router.urls)),
]
