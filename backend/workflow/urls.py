from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApprovalViewSet, WorkflowStepViewSet, DelegationViewSet

router = DefaultRouter()
router.register(r'approvals', ApprovalViewSet, basename='approval')
router.register(r'steps', WorkflowStepViewSet, basename='workflowstep')
router.register(r'delegations', DelegationViewSet, basename='delegation')

urlpatterns = [
    path('', include(router.urls)),
]
