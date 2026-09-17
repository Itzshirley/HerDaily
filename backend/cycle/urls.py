from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import PeriodLogViewSet, CycleSettingsView, CyclePredictionView

router = DefaultRouter()
router.register("cycle-logs", PeriodLogViewSet)

urlpatterns = router.urls + [
    path("cycle-settings/", CycleSettingsView.as_view()),
    path("cycle-predict/", CyclePredictionView.as_view()),
]
