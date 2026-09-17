from django.db import models
from django.utils import timezone


class Habit(models.Model):

    name = models.CharField(max_length=100)
    emoji = models.CharField(max_length=8, default="🌙")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.emoji} {self.name}"


class HabitCompletion(models.Model):

    habit = models.ForeignKey(
        Habit,
        related_name="completions",
        on_delete=models.CASCADE
    )

    date = models.DateField(default=timezone.localdate)

    class Meta:
        unique_together = ("habit", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.habit.name} — {self.date}"
