# eld-server/eldproject/core/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core.views.authViews import ProtectedView
from core.views.driverViews import RegisterDriverAPIView, LoginAPIView, VerifyTokenDriverAPIView, LogoutAPIView
from core.views.tripViews import CreateTripAPIView, GetDriverTripsAPIView, GetTripByIdAPIView, AddLogSheetsAPIView, UpdateLogSheetsAPIView, DeleteTripAPIView


urlpatterns = [

    path('verify-token/', VerifyTokenDriverAPIView.as_view(), name="verify-token"),
    path('protected/', ProtectedView.as_view(), name="protected"),
    path('register/', RegisterDriverAPIView.as_view(), name="register-driver"),
    path('login/', LoginAPIView.as_view(), name="login-driver"),
    path('logout/', LogoutAPIView.as_view(), name="logout-driver"),

    path('create-trip/', CreateTripAPIView.as_view(), name='create-trip'),
    path('get-driver-trips/', GetDriverTripsAPIView.as_view(), name='get-driver-trips'),
    path('get-trip-byid/', GetTripByIdAPIView.as_view(), name='get-trip-by-id'),

    path('add-log-sheets/', AddLogSheetsAPIView.as_view(), name='add-log-sheets'),
    path('update-log-sheets/', UpdateLogSheetsAPIView.as_view(), name='update-log-sheets'),
    path('delete-trip/', DeleteTripAPIView.as_view(), name='delete-trip'),

]

