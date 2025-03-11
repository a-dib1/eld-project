from django.http import HttpResponseForbidden
from django.conf import settings

def referer_check(view_func):
    def wrapper(self, request, *args, **kwargs):
        allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
        referer = request.META.get('HTTP_REFERER', '')
        if referer and any(referer.startswith(origin) for origin in allowed_origins):
            return view_func(self, request, *args, **kwargs)
        return HttpResponseForbidden("Forbidden")
    return wrapper

class RefererCheckMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])

    def __call__(self, request):
        referer = request.META.get('HTTP_REFERER', '')
        if referer and any(referer.startswith(origin) for origin in self.allowed_origins):
            return self.get_response(request)
        return HttpResponseForbidden("Forbidden")