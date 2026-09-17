from rest_framework.routers import DefaultRouter
from .views import JournalEntryViewSet

router = DefaultRouter()
router.register("journal", JournalEntryViewSet)

urlpatterns = router.urls
