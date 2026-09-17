from rest_framework import serializers
from .models import PeriodLog, CycleSettings


class PeriodLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodLog
        fields = "__all__"


class CycleSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycleSettings
        fields = ["average_cycle_length", "average_period_length"]
