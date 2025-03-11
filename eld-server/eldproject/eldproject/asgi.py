"""
ASGI config for eldproject project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

# eldproject/asgi.py
import os
import django
from django.core.asgi import get_asgi_application
import socketio

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eldproject.settings')
django.setup()

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="http://localhost:3000")

django_asgi_app = get_asgi_application()

application = socketio.ASGIApp(sio, django_asgi_app)

from core.sockets.handlers import register_socket_events
register_socket_events(sio)
