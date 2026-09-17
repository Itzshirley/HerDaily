from django.db import models
from django.utils import timezone


class WaterLog(models.Model):

    date = models.DateField(
        unique=True,
        default=timezone.localdate
    )

    glasses = models.PositiveIntegerField(
        default=0
    )

    goal = models.PositiveIntegerField(
        default=8
    )

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.date}: {self.glasses}/{self.goal} glasses"
