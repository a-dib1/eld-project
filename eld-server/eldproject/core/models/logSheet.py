# core/models/logSheet.py

import uuid
from django.utils.timezone import now
from django.db import models
from core.models.trip import Trip

class LogSheet(models.Model):

    uniqueId = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )

    tripId = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='logSheets')
    currentLocation = models.CharField(max_length=255)
    pickup = models.CharField(max_length=150, null=True)
    dropoff = models.CharField(max_length=150, null=True)
    currentCycleUsed = models.CharField(blank=True, null=True)

    createdDate = models.DateTimeField(default=now, editable=False)
    logNumber = models.PositiveIntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.tripId.tripTitle} - {self.currentLocation}"
