from rest_framework import serializers
from .models import Tournament, Team, Match, CustomUser

# El serializador toma tu modelo de la base de datos y lo convierte en un JSON 
# idéntico al que tenías en tu LocalStorage.

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__' # Esto incluirá id, name, description, startDate, etc.

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'