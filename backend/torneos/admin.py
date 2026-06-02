from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
# Importamos TODOS tus modelos aquí:
from .models import CustomUser, Team, Tournament, Match, TournamentRequest

# 1. Creamos la configuración especial para el panel del Usuario
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Información Adicional', {'fields': ('role',)}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')

# 2. Registramos el modelo de Usuario con su nueva configuración
admin.site.register(CustomUser, CustomUserAdmin)

# 3. 🔥 ¡REGISTRAMOS EL RESTO DE TUS TABLAS PARA QUE APAREZCAN! 🔥
admin.site.register(Team)
admin.site.register(Tournament)
admin.site.register(Match)