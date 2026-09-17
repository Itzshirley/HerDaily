from django.db import models


class Profile(models.Model):

    THEME_CHOICES = [
        ("pink", "Blossom Pink"),
        ("lavender", "Lavender Dream"),
        ("peach", "Peach Sorbet"),
        ("mint", "Mint Bloom"),
    ]

    display_name = models.CharField(max_length=100, default="Shirley")
    theme = models.CharField(max_length=20, choices=THEME_CHOICES, default="pink")
    default_water_goal = models.PositiveIntegerField(default=8)
    notifications_enabled = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
