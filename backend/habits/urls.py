from rest_framework.routers import DefaultRouter
from .views import HabitViewSet

router = DefaultRouter()
router.register("habits", HabitViewSet)

urlpatterns = router.urls
