from django.db import models


class Goal(models.Model):

    CATEGORY_CHOICES = [
        ("Personal", "Personal"),
        ("Health", "Health"),
        ("Career", "Career"),
        ("Finance", "Finance"),
        ("Other", "Other"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="Personal")
    target_date = models.DateField(null=True, blank=True)
    progress = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["completed", "-created_at"]

    def save(self, *args, **kwargs):
        self.progress = max(0, min(100, self.progress))
        self.completed = self.progress >= 100
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
