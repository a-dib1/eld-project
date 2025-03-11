# core/models/driver.py

import bcrypt
import uuid
from django.utils.timezone import now
from django.db import models

class Driver(models.Model):

    uniqueId = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )

    fullName = models.CharField(max_length=255)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True)

    isActive = models.BooleanField(default=True)
    isDeleted = models.BooleanField(default=False)

    createdDate = models.DateTimeField(default=now, editable=False)
    accountNumber = models.PositiveIntegerField(blank=True, null=True)

    def save(self, *args, **kwargs):
        """
        Override the save method to hash the password with bcrypt 
        before saving to the database.
        """

        if not self.password.startswith('$2b$'):
            hashed = bcrypt.hashpw(self.password.encode('utf-8'), bcrypt.gensalt())
            self.password = hashed.decode('utf-8')
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
