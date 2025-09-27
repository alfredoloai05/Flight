from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .auth_views import MeView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth (JWT)
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', MeView.as_view(), name='auth_me'),

    # APIs
    path('api/', include('destinations.urls')),
    path('api/', include('flights.urls')),
]
