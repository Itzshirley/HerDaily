from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by("-created_at")
    serializer_class = TaskSerializer

    @action(detail=True, methods=["patch"])
    def toggle_complete(self, request, pk=None):
        task = self.get_object()

        task.completed = not task.completed
        task.save()

        serializer = self.get_serializer(task)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )