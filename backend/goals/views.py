from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Goal
from .serializers import GoalSerializer


class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer

    @action(detail=True, methods=["patch"])
    def set_progress(self, request, pk=None):
        goal = self.get_object()
        try:
            progress = int(request.data.get("progress", goal.progress))
        except (TypeError, ValueError):
            progress = goal.progress

        goal.progress = progress
        goal.save()

        serializer = self.get_serializer(goal)
        return Response(serializer.data)
