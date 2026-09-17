from rest_framework.routers import DefaultRouter
from .views import WaterLogViewSet

router = DefaultRouter()
router.register("water", WaterLogViewSet)

urlpatterns = router.urls
