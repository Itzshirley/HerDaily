from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile
from .serializers import ProfileSerializer


class ProfileView(APIView):

    def get(self, request):
        serializer = ProfileSerializer(Profile.load())
        return Response(serializer.data)

    def patch(self, request):
        instance = Profile.load()
        serializer = ProfileSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
