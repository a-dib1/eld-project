from django.contrib import admin
from core.models import Driver, Trip, LogSheet


@admin.register(Driver)
class Driver(admin.ModelAdmin):
    list_display = ('fullName', 'username', 'uniqueId', 'createdDate', 'accountNumber')
    fields = (
        'fullName',
        'username',
        'email',
        'phone',
        'isActive',
        'isDeleted',
        'createdDate',
        'accountNumber',
    )
    readonly_fields = ('createdDate',)

@admin.register(Trip)
class Trip(admin.ModelAdmin):
    list_display = ('driverId', 'tripTitle', 'uniqueId', 'pickup', 'dropoff', 'createdDate', 'tripNumber')
    fields = (
        'driverId',
        'tripTitle',
        'pickup',
        'dropoff',
        'cycleUsed',
        'instructions',
        'createdDate',
        'tripNumber',
    )
    readonly_fields = ('createdDate',)



@admin.register(LogSheet)
class LogSheet(admin.ModelAdmin):
    list_display = ('tripId', 'currentLocation', 'uniqueId', 'pickup', 'dropoff', 'createdDate', 'logNumber')
    fields = (
        'tripId',
        'currentLocation',
        'pickup',
        'dropoff',
        'currentCycleUsed',
        'createdDate',
        'logNumber',
    )
    readonly_fields = ('createdDate',)