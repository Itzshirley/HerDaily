from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from .models import Habit


class HabitSerializer(serializers.ModelSerializer):

    completed_today = serializers.SerializerMethodField()
    current_streak = serializers.SerializerMethodField()
    last_7_days = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = [
            "id", "name", "emoji", "active", "created_at",
            "completed_today", "current_streak", "last_7_days",
        ]

    def _completion_dates(self, obj):
        if not hasattr(obj, "_cached_dates"):
            obj._cached_dates = set(obj.completions.values_list("date", flat=True))
        return obj._cached_dates

    def get_completed_today(self, obj):
        return timezone.localdate() in self._completion_dates(obj)

    def get_current_streak(self, obj):
        dates = self._completion_dates(obj)
        streak = 0
        day = timezone.localdate()
        while day in dates:
            streak += 1
            day -= timedelta(days=1)
        return streak

    def get_last_7_days(self, obj):
        dates = self._completion_dates(obj)
        today = timezone.localdate()
        return [
            {
                "date": str(today - timedelta(days=i)),
                "completed": (today - timedelta(days=i)) in dates,
            }
            for i in range(6, -1, -1)
        ]
