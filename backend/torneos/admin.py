from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Tournament, Team, Match

# 1. Registramos nuestro Usuario Personalizado usando la vista por defecto de Django
admin.site.register(CustomUser, UserAdmin)

# 2. Registramos los modelos de tu app de forma sencilla
admin.site.register(Tournament)
admin.site.register(Team)
admin.site.register(Match)