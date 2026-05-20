from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from torneos.views import TournamentViewSet, TeamViewSet, MatchViewSet, login_view, register_view

# Creamos el enrutador automático de nuestra API
router = DefaultRouter()
router.register(r'tournaments', TournamentViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'matches', MatchViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    # Agregamos las dos nuevas rutas de autenticación:
    path('api/login/', login_view, name='api_login'),
    path('api/register/', register_view, name='api_register'),
]