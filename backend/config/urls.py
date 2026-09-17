from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('todo.urls')),
    path('api/', include('water.urls')),
    path('api/', include('habits.urls')),
    path('api/', include('goals.urls')),
    path('api/', include('journal.urls')),
    path('api/', include('cycle.urls')),
    path('api/', include('profile.urls')),
]