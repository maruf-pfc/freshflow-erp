from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenBlacklistView,
    TokenObtainPairView,
    TokenRefreshView,
)


def health_check(request):
    return JsonResponse({"status": "ok", "service": "freshflow-backend"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),

    # JWT Authentication Endpoints (SimpleJWT with Token Blacklisting)
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/token/blacklist/", TokenBlacklistView.as_view(), name="token_blacklist"),

    # FreshFlow Domain Module Routes
    path("api/auth/", include("apps.authentication.urls")),
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/crm/", include("apps.crm.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/wastage/", include("apps.wastage.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
    path("api/employees/", include("apps.employees.urls")),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
