from django.db import models


class PeriodLog(models.Model):

    start_date = models.DateField(unique=True)
    end_date = models.DateField(null=True, blank=True)
    symptoms = models.CharField(max_length=255, blank=True)
    mood = models.CharField(max_length=8, blank=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return f"Period starting {self.start_date}"


class CycleSettings(models.Model):

    average_cycle_length = models.PositiveIntegerField(default=28)
    average_period_length = models.PositiveIntegerField(default=5)

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
