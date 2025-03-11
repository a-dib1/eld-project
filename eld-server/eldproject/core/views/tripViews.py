# core/views/tripViews.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models.trip import Trip
from core.models.driver import Driver
from core.models.logSheet import LogSheet
from core.serializers.tripSerializers import TripSerializer, GetDriverTripsSerializer, GetTripDataSerializer, LogSheetSerializer
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync
from eldproject.asgi import sio 
from core.middleware.referer_middleware import referer_check


class CreateTripAPIView(APIView):
    def post(self, request):
        try:
            email = request.data.get("email")
            if not email:
                return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

            serializer = TripSerializer(data=request.data, context={"email": email})
            if serializer.is_valid():
                trip = serializer.save()

                trip_data = {
                    "uniqueId": str(trip.uniqueId),
                    "tripTitle": trip.tripTitle,
                    "pickup": trip.pickup,
                    "dropoff": trip.dropoff or None, 
                    "cycleUsed": trip.cycleUsed, 
                    "instructions": trip.instructions or None, 
                    "createdDate": trip.createdDate.isoformat(),
                    "tripNumber": trip.tripNumber, 
                }

                room_name = f"user_{email}"

                async_to_sync(sio.emit)("trip_created", trip_data, room=room_name)
                print(f"📡 Emitted trip_created event to {room_name}: {trip_data}")

                return Response(
                    {
                        "message": "Trip created successfully",
                        "tripId": str(trip.uniqueId),
                        "tripTitle": trip.tripTitle,
                    },
                    status=status.HTTP_201_CREATED,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GetDriverTripsAPIView(APIView):
    @referer_check
    def get(self, request):
        try:
            email = request.query_params.get('email')
            if not email:
                return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            driver = get_object_or_404(Driver, email=email)
            trips = Trip.objects.filter(driverId=driver)
            
            serializer = GetDriverTripsSerializer(trips, many=True)
            return Response({'trips': serializer.data}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GetTripByIdAPIView(APIView):
    def get(self, request):
        try:
            trip_id = request.query_params.get('tripId')
            if not trip_id:
                return Response({'error': 'Trip ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            trip = get_object_or_404(Trip.objects.prefetch_related('logSheets'), uniqueId=trip_id)
            serializer = GetTripDataSerializer(trip)
            return Response({'trip': serializer.data}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AddLogSheetsAPIView(APIView):
    def post(self, request):
        try:
            trip_id = request.data.get('tripId')
            log_sheets_data = request.data.get('logSheets', [])
            
            if not trip_id:
                return Response({'error': 'Trip ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not log_sheets_data:
                return Response({'error': 'Log sheets data is required'}, status=status.HTTP_400_BAD_REQUEST)

            trip = get_object_or_404(Trip, uniqueId=trip_id)
            
            created_log_sheets = []
            for log_sheet_data in log_sheets_data:
                serializer = LogSheetSerializer(data=log_sheet_data)
                if serializer.is_valid():
                    log_sheet = serializer.save(tripId=trip)
                    created_log_sheets.append(serializer.data)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'message': 'Log sheets added successfully',
                'logSheets': created_log_sheets
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UpdateLogSheetsAPIView(APIView):
    def patch(self, request):
        try:
            trip_id = request.data.get('tripId')
            log_sheets_data = request.data.get('logSheets', [])
            
            if not trip_id:
                return Response({'error': 'Trip ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not log_sheets_data:
                return Response({'error': 'Log sheets data is required'}, status=status.HTTP_400_BAD_REQUEST)

            trip = get_object_or_404(Trip, uniqueId=trip_id)
            updated_log_sheets = []

            for log_sheet_data in log_sheets_data:
                log_sheet_id = log_sheet_data.get('uniqueId')
                if not log_sheet_id:
                    return Response({'error': 'Log sheet uniqueId is required'}, status=status.HTTP_400_BAD_REQUEST)
                
                log_sheet = get_object_or_404(LogSheet, uniqueId=log_sheet_id, tripId=trip)
                serializer = LogSheetSerializer(log_sheet, data=log_sheet_data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    updated_log_sheets.append(serializer.data)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'message': 'Log sheets updated successfully',
                'logSheets': updated_log_sheets
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DeleteTripAPIView(APIView):
    def delete(self, request):
        try:
            trip_id = request.query_params.get('tripId')
            if not trip_id:
                return Response({'error': 'Trip ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            trip = get_object_or_404(Trip, uniqueId=trip_id)
            trip.delete() 
            return Response({'message': 'Trip deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

