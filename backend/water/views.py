from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import WaterLog
from .serializers import WaterLogSerializer


class WaterLogViewSet(viewsets.ModelViewSet):
    queryset = WaterLog.objects.all()
    serializer_class = WaterLogSerializer

    @action(detail=False, methods=["get"])
    def today(self, request):
        log, _ = WaterLog.objects.get_or_create(date=timezone.localdate())

        serializer = self.get_serializer(log)

        return Response(serializer.data)

    @action(detail=True, methods=["patch"])
    def increment(self, request, pk=None):
        log = self.get_object()

        log.glasses += 1
        log.save()

        serializer = self.get_serializer(log)

        return Response(serializer.data)

    @action(detail=True, methods=["patch"])
    def decrement(self, request, pk=None):
        log = self.get_object()

        log.glasses = max(0, log.glasses - 1)
        log.save()

        serializer = self.get_serializer(log)

        return Response(serializer.data)
