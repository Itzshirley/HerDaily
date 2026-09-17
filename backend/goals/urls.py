from rest_framework.routers import DefaultRouter
from .views import GoalViewSet

router = DefaultRouter()
router.register("goals", GoalViewSet)

urlpatterns = router.urls
