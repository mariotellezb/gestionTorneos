from rest_framework import serializers
from .models import Tournament, Team, Match, CustomUser, TournamentRequest

# El serializador toma tu modelo de la base de datos y lo convierte en un JSON 
# idéntico al que tenías en tu LocalStorage.

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__' # Esto incluirá id, name, description, startDate, etc.

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        # Opción A: Usar '__all__'
        fields = '__all__' 
        
        # Opción B (Si tienes una lista manual, asegúrate de agregar 'members'):
        # fields = ['id', 'name', 'description', 'captain', 'members', 'registeredDate', 'createdAt']

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'

# No olvides importar el modelo arriba: from .models import Tournament, Team, Match, TournamentRequest

class TournamentRequestSerializer(serializers.ModelSerializer):
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)
    user_name = serializers.CharField(source='user.first_name', read_only=True)

    class Meta:
        model = TournamentRequest
        fields = '__all__'