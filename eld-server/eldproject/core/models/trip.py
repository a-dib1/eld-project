# core/models/trip.py

import uuid
from django.utils.timezone import now
from django.db import models
from core.models.driver import Driver

class Trip(models.Model):

    uniqueId = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )

    driverId = models.ForeignKey(Driver, on_delete=models.CASCADE)
    tripTitle = models.CharField(max_length=255)
    pickup = models.CharField(max_length=150, null=True)
    dropoff = models.CharField(max_length=150, null=True)
    cycleUsed = models.CharField(max_length=150, null=True)
    instructions = models.TextField(blank=True, null=True)

    createdDate = models.DateTimeField(default=now, editable=False)
    tripNumber = models.PositiveIntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.driverId.username} - {self.tripTitle}"


