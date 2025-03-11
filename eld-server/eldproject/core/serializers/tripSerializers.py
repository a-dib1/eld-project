from rest_framework import serializers
from core.models.trip import Trip
from core.models.logSheet import LogSheet
from core.models.driver import Driver
from django.shortcuts import get_object_or_404

class LogSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogSheet
        fields = ['uniqueId', 'tripId', 'currentLocation', 'pickup', 'dropoff', 'currentCycleUsed', 'createdDate', 'logNumber']
        extra_kwargs = {
            'uniqueId': {'read_only': True},
            'tripId': {'read_only': True},
            'logNumber': {'read_only': True},
        }

    def create(self, validated_data):
        # Auto-generate logNumber
        last_log = LogSheet.objects.order_by('-logNumber').first()
        validated_data['logNumber'] = (last_log.logNumber + 1) if last_log else 1
        
        return super().create(validated_data)


class TripSerializer(serializers.ModelSerializer):
    logSheets = LogSheetSerializer(many=True)

    class Meta:
        model = Trip
        fields = ['uniqueId', 'driverId', 'tripTitle', 'pickup', 'dropoff', 'cycleUsed', 'instructions', 'createdDate', 'tripNumber', 'logSheets']
        extra_kwargs = {
            'uniqueId': {'read_only': True},
            'driverId': {'read_only': True},
            'tripNumber': {'read_only': True},
        }

    def create(self, validated_data):
        log_sheets_data = validated_data.pop('logSheets', [])
        email = self.context['email']
        driver = get_object_or_404(Driver, email=email)
        validated_data['driverId'] = driver
        
        last_trip = Trip.objects.order_by('-tripNumber').first()
        validated_data['tripNumber'] = (last_trip.tripNumber + 1) if last_trip else 1
        
        trip = super().create(validated_data)
        
        for log_sheet_data in log_sheets_data:
            log_sheet_serializer = LogSheetSerializer(data=log_sheet_data)
            if log_sheet_serializer.is_valid():
                log_sheet_serializer.save(tripId=trip)
            else:
                raise serializers.ValidationError(log_sheet_serializer.errors)
        
        return trip


class GetDriverTripsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ['uniqueId', 'tripTitle', 'pickup', 'dropoff', 'cycleUsed', 'instructions', 'createdDate', 'tripNumber']
        extra_kwargs = {
            'uniqueId': {'read_only': True},
            'tripNumber': {'read_only': True},
        }


class GetLogSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogSheet
        fields = ['uniqueId', 'currentLocation', 'pickup', 'dropoff', 'currentCycleUsed', 'createdDate', 'logNumber']
        extra_kwargs = {
            'uniqueId': {'read_only': True},
            'logNumber': {'read_only': True},
        }

class GetTripDataSerializer(serializers.ModelSerializer):
    logSheets = GetLogSheetSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = ['uniqueId', 'tripTitle', 'pickup', 'dropoff', 'cycleUsed', 'instructions', 'createdDate', 'tripNumber', 'logSheets']
        extra_kwargs = {
            'uniqueId': {'read_only': True},
            'tripNumber': {'read_only': True},
        }