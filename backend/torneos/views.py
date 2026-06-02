from rest_framework import viewsets
from .models import Tournament, Team, Match, TournamentRequest
from .serializers import TournamentSerializer, TeamSerializer, MatchSerializer, TournamentRequestSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
User = get_user_model()

from rest_framework.decorators import action
from rest_framework.response import Response

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    @action(detail=True, methods=['post'], url_path='add-team')
    def add_team(self, request, pk=None):
        try:
            tournament = self.get_object()
            team_name = request.data.get('team_name')
            user_id = request.data.get('user_id')
            
            # 1. Buscamos al usuario que será el primer miembro (el creador)
            user = User.objects.get(id=user_id) if user_id else None
            
            # 2. Creamos el equipo limpio (sin capitán)
            team = Team.objects.create(
                name=team_name,
                description=f'Equipo oficial para {tournament.name}'
            )
            
            # 3. Metemos al usuario explícitamente en la lista de jugadores
            if user:
                team.members.add(user)
                
            # 4. Vinculamos el equipo al torneo
            tournament.teams.add(team)
            
            return Response({'success': True, 'message': 'Equipo creado e integrante agregado exitosamente'})
            
        except Exception as e:
            print(f"Error fatal en add_team: {str(e)}")
            return Response({'error': str(e)}, status=400)
        

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    @action(detail=True, methods=['post'], url_path='join')
    def join(self, request, pk=None):
        try:
            team = self.get_object()
            user_id = request.data.get('user_id')
            
            user = User.objects.get(id=user_id) if user_id else request.user
            
            if user in team.members.all():
                return Response({'error': 'Ya eres parte de este equipo'}, status=400)
                
            team.members.add(user)
            team.save()
            return Response({'success': True, 'message': 'Te has unido al equipo'})
            
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=True, methods=['post'], url_path='leave')
    def leave(self, request, pk=None):
        try:
            team = self.get_object()
            user_id = request.data.get('user_id')
            
            user = User.objects.get(id=user_id) if user_id else request.user
                
            if user in team.members.all():
                team.members.remove(user)
                team.save()
                return Response({'success': True, 'message': 'Has salido del equipo exitosamente'})
            else:
                return Response({'error': 'No eres miembro de este equipo'}, status=400)
                
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    
    def perform_create(self, serializer):
        # Guardamos el partido de manera simple, ya no hay capitán que agregar.
        serializer.save()


from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import CustomUser

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        user_obj = CustomUser.objects.get(email=email)
        user = authenticate(username=user_obj.username, password=password)
    except CustomUser.DoesNotExist:
        user = None
        
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'name': user.first_name or user.username,
                'email': user.email,
                'role': getattr(user, 'role', 'usuario')
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        })
    return Response({'success': False, 'message': 'Correo o contraseña incorrectos'}, status=401)


@api_view(['POST'])
def register_view(request):
    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')
    
    if CustomUser.objects.filter(email=email).exists():
        return Response({'success': False, 'message': 'Este correo ya está registrado'}, status=400)
        
    user = CustomUser.objects.create(
        username=email,
        email=email,
        first_name=name,
        password=make_password(password),
        role='usuario'
    )
    return Response({'success': True, 'message': 'Usuario registrado exitosamente'})


class TournamentRequestViewSet(viewsets.ModelViewSet):
    queryset = TournamentRequest.objects.all()
    serializer_class = TournamentRequestSerializer