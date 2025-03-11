from rest_framework import serializers
from core.models.driver import Driver
from django.conf import settings
from django.shortcuts import get_object_or_404
import jwt
import bcrypt


class VerifyTokenSerializer(serializers.Serializer):
    token = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Custom validation to verify JWT token and driver status.
        """
        token = data.get("token")

        if not token:
            raise serializers.ValidationError({"error": "Unauthorized"})

        secret_key = settings.SECRET_KEY
        try:
            decoded = jwt.decode(token, secret_key, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise serializers.ValidationError({"error": "Token expired"})
        except jwt.InvalidTokenError:
            raise serializers.ValidationError({"error": "Invalid token"})

        email = decoded.get("email")
        if not email:
            raise serializers.ValidationError({"error": "Invalid token payload"})

        driver = get_object_or_404(Driver, email=email)

        if driver.isDeleted:
            raise serializers.ValidationError({"error": "User not found"})
        if not driver.isActive:
            raise serializers.ValidationError({"error": "User account is inactive"})

        data["driver"] = driver
        return data


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = [
            'uniqueId', 'fullName', 'username', 'email', 
            'password', 'phone', 'isActive', 'isDeleted', 
            'createdDate', 'accountNumber'
        ]
        extra_kwargs = {
            'uniqueId': {'read_only': True}, 
            'accountNumber': {'read_only': True},  
            'password': {'write_only': True} 
        }

    def create(self, validated_data):
        last_driver = Driver.objects.order_by('-accountNumber').first()
        validated_data['accountNumber'] = (last_driver.accountNumber + 1) if last_driver else 1

        return super().create(validated_data)



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Custom validation to check driver credentials.
        """
        email = data.get("email")
        password = data.get("password")

        try:
            driver = Driver.objects.get(email=email)
        except Driver.DoesNotExist:
            raise serializers.ValidationError({"error": "User not found"})

        if driver.isDeleted:
            raise serializers.ValidationError({"error": "User not found"})
        if not driver.isActive:
            raise serializers.ValidationError({"error": "User account is inactive"})

        if not bcrypt.checkpw(password.encode('utf-8'), driver.password.encode('utf-8')):
            raise serializers.ValidationError({"error": "Invalid password"})

        data["driver"] = driver
        return data
