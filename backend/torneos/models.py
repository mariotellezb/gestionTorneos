from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('administrador', 'Administrador'),
        ('organizador', 'Organizador'),
        ('usuario', 'Usuario'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='usuario')

    def __str__(self):
        return self.username

class Team(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    # 🔥 LÍNEA DE CAPTAIN ELIMINADA 🔥
    members = models.ManyToManyField(CustomUser, related_name='teams_joined')
    registeredDate = models.DateTimeField(auto_now_add=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

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
    
class TournamentRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('accepted', 'Aceptado'),
        ('rejected', 'Rechazado'),
    ]

    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='requests')    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    team_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.team_name} -> {self.tournament.name} ({self.status})"