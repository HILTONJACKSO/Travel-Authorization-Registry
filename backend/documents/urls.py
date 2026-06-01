from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, ReportAnalyticsView, DashboardStatsView

router = DefaultRouter()
router.register(r'', DocumentViewSet, basename='document')

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('reports/', ReportAnalyticsView.as_view(), name='reports-analytics'),
    path('', include(router.urls)),
]
