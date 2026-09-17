from datetime import timedelta

from django.utils import timezone
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PeriodLog, CycleSettings
from .serializers import PeriodLogSerializer, CycleSettingsSerializer


class PeriodLogViewSet(viewsets.ModelViewSet):
    queryset = PeriodLog.objects.all()
    serializer_class = PeriodLogSerializer


class CycleSettingsView(APIView):

    def get(self, request):
        serializer = CycleSettingsSerializer(CycleSettings.load())
        return Response(serializer.data)

    def patch(self, request):
        instance = CycleSettings.load()
        serializer = CycleSettingsSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CyclePredictionView(APIView):
    """Derives current cycle day, phase, and predicted dates from the
    most recent logged period plus the user's average cycle/period length."""

    def get(self, request):
        settings_obj = CycleSettings.load()
        last_log = PeriodLog.objects.order_by("-start_date").first()
        today = timezone.localdate()

        if not last_log:
            return Response({"has_data": False})

        cycle_length = settings_obj.average_cycle_length
        period_length = settings_obj.average_period_length

        next_period_date = last_log.start_date + timedelta(days=cycle_length)
        ovulation_date = next_period_date - timedelta(days=14)
        fertile_start = ovulation_date - timedelta(days=5)
        fertile_end = ovulation_date + timedelta(days=1)
        cycle_day = (today - last_log.start_date).days + 1

        if cycle_day < 1:
            cycle_day = 1

        if cycle_day <= period_length:
            phase = "Menstrual"
        elif today < fertile_start:
            phase = "Follicular"
        elif fertile_start <= today <= fertile_end:
            phase = "Ovulation"
        else:
            phase = "Luteal"

        return Response({
            "has_data": True,
            "last_period_start": last_log.start_date,
            "next_period_date": next_period_date,
            "ovulation_date": ovulation_date,
            "fertile_window_start": fertile_start,
            "fertile_window_end": fertile_end,
            "cycle_day": cycle_day,
            "cycle_length": cycle_length,
            "period_length": period_length,
            "phase": phase,
            "days_until_next_period": (next_period_date - today).days,
        })
