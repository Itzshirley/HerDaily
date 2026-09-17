from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Habit, HabitCompletion
from .serializers import HabitSerializer


class HabitViewSet(viewsets.ModelViewSet):
    queryset = Habit.objects.filter(active=True)
    serializer_class = HabitSerializer

    def perform_destroy(self, instance):
        # Soft-delete so historical completions/streaks stay intact.
        instance.active = False
        instance.save()

    @action(detail=True, methods=["post"])
    def toggle_today(self, request, pk=None):
        habit = self.get_object()
        today = timezone.localdate()

        completion, created = HabitCompletion.objects.get_or_create(
            habit=habit, date=today
        )
        if not created:
            completion.delete()

        serializer = self.get_serializer(habit)
        return Response(serializer.data)
