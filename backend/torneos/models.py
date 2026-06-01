from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser

# 1. USUARIOS (Sustituye a tu localStorage 'users')
class CustomUser(AbstractUser):
    # Heredamos de AbstractUser para aprovechar el sistema de login de Django
    # Django ya incluye username, first_name, last_name, email y password
    ROLE_CHOICES = (
        ('administrador', 'Administrador'),
        ('organizador', 'Organizador'),
        ('usuario', 'Usuario'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='usuario')
    # createdAt ya lo maneja Django por defecto al crear el usuario

    def __str__(self):
        return self.username

# 2. EQUIPOS (Sustituye a tu localStorage 'teams')
class Team(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    captain = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='captain_of')
    members = models.ManyToManyField(CustomUser, related_name='teams_joined')
    registeredDate = models.DateTimeField(auto_now_add=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# 3. TORNEOS (Sustituye a tu localStorage 'tournaments')
class Tournament(models.Model):
    STATUS_CHOICES = (
        ('active', 'Activo'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    )
    name = models.CharField(max_length=200)
    description = models.TextField()
    sport = models.CharField(max_length=100)
    startDate = models.DateField()
    endDate = models.DateField()
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    organizer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='organized_tournaments')
    maxTeams = models.IntegerField()
    teams = models.ManyToManyField(Team, related_name='tournaments_joined', blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

# 4. PARTIDOS (Sustituye a tu localStorage 'matches')
class Match(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Programado'),
        ('in_progress', 'En Curso'),
        ('finished', 'Finalizado'),
    )
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    homeTeam = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='home_matches')
    awayTeam = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='away_matches')
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    homeScore = models.IntegerField(null=True, blank=True)
    awayScore = models.IntegerField(null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.homeTeam} vs {self.awayTeam} - {self.tournament}"

# 5. NOTIFICACIONES
class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('join_request', 'Solicitud de Ingreso'),
        ('request_accepted', 'Solicitud Aceptada'),
        ('request_rejected', 'Solicitud Rechazada'),
        ('tournament_update', 'Actualización de Torneo'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=100)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='tournament_update')
    is_read = models.BooleanField(default=False)
    tournamentId = models.IntegerField(null=True, blank=True) # Para saber a dónde redirigir
    requestId = models.IntegerField(null=True, blank=True)    # Si aplica a una solicitud
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
class TournamentRequest(models.Model):
    # 1. Las opciones deben ir PRIMERO, adentro de la clase
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('accepted', 'Aceptado'),
        ('rejected', 'Rechazado'),
    ]

    # 2. Los campos van DESPUÉS, con la misma alineación
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='requests')
    team_name = models.CharField(max_length=100)
    captain_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    notes = models.TextField(blank=True, null=True)
    
    # Aquí es donde usa STATUS_CHOICES de manera segura
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.team_name} -> {self.tournament.name} ({self.status})"