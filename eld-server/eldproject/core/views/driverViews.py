from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import jwt
from datetime import datetime, timedelta
from django.utils import timezone
from core.models import Driver
from core.serializers.driverSerializers import VerifyTokenSerializer, DriverSerializer, LoginSerializer




class VerifyTokenDriverAPIView(APIView):
    def post(self, request):
        try:
            serializer = VerifyTokenSerializer(data={"token": request.COOKIES.get("token")})
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

            driver = serializer.validated_data["driver"]

            driver_serializer = DriverSerializer(driver)
            return Response({"driver": driver_serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)




class RegisterDriverAPIView(APIView):
    def post(self, request):
        try:
            required_fields = ["fullName", "username", "email", "password"]
            if not all(field in request.data for field in required_fields):
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            if Driver.objects.filter(email=request.data["email"]).exists():
                return Response({"error": "Email is already in use"}, status=status.HTTP_400_BAD_REQUEST)
            if Driver.objects.filter(username=request.data["username"]).exists():
                return Response({"error": "Username is already taken"}, status=status.HTTP_400_BAD_REQUEST)

            serializer = DriverSerializer(data=request.data)
            if serializer.is_valid():
                driver = serializer.save()

                return Response({
                    "message": "Driver registered successfully",
                    "username": driver.username,
                    "uniqueId": str(driver.uniqueId),
                    "accountNumber": driver.accountNumber,
                }, status=status.HTTP_201_CREATED)

            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)




class LoginAPIView(APIView):
    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            driver = serializer.validated_data["driver"]

            driver_serializer = DriverSerializer(driver)
            driver_data = driver_serializer.data

            secret_key = settings.SECRET_KEY
            token_payload = {
                "uniqueId": str(driver.uniqueId), 
                "email": driver.email,
                "exp": (timezone.now() + timedelta(days=15)).timestamp()
            }
            token = jwt.encode(token_payload, secret_key, algorithm="HS256")

            response = Response({
                "message": "Login successful",
                "driver": driver_data,
            }, status=status.HTTP_200_OK)

            response.set_cookie(
                key="token",
                value=token,
                httponly=True,
                secure=False, 
                samesite='None',
                max_age=86400 * 15 
            )

            return response

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LogoutAPIView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie('token')
        return response



