from rest_framework import viewsets
from .models import Tournament, Team, Match, TournamentRequest
from .serializers import TournamentSerializer, TeamSerializer, MatchSerializer, TournamentRequestSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
User = get_user_model()

# Los ViewSets de Django REST Framework crean automáticamente todas las 
# operaciones CRUD (Crear, Leer, Actualizar, Borrar) para tus modelos.

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
            
            # 1. Buscamos al usuario que mandó la solicitud
            user = User.objects.get(id=user_id) if user_id else None
            
            # 2. Creamos el equipo y le asignamos el capitán
            team, created = Team.objects.get_or_create(
                name=team_name,
                defaults={
                    'description': f'Equipo oficial para {tournament.name}',
                    'captain': user
                }
            )
            
            # 3. Lo metemos a la lista de miembros (jugadores)
            if user:
                team.members.add(user)
                
            # 4. Vinculamos el equipo al torneo
            tournament.teams.add(team)
            
            return Response({'success': True, 'message': 'Equipo inscrito con su capitán'})
            
        except Exception as e:
            print(f"Error fatal: {str(e)}")
            return Response({'error': str(e)}, status=400)
        


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    @action(detail=True, methods=['post'], url_path='join')
    def join(self, request, pk=None):
        try:
            team = self.get_object()
            
            # 1. Atrapamos el ID explícito que mandará el JavaScript
            user_id = request.data.get('user_id')
            
            if user_id:
                user = User.objects.get(id=user_id)
            else:
                user = request.user
            
            print(f"Intentando unir al usuario {user.username} al equipo {team.name}")
            
            # 2. Verificamos si ya es miembro o capitán
            if user in team.members.all() or team.captain == user:
                return Response({'error': 'Ya eres parte de este equipo'}, status=400)
                
            # 3. Lo agregamos a los miembros y GUARDAMOS
            team.members.add(user)
            team.save()
            
            print("¡Usuario unido con éxito!")
            return Response({'success': True, 'message': 'Te has unido al equipo'})
            
        except Exception as e:
            print(f"Error al unirse al equipo: {str(e)}")
            return Response({'error': str(e)}, status=400)
    


class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer



from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import CustomUser

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Intentamos buscar al usuario por su email
    try:
        user_obj = CustomUser.objects.get(email=email)
        # Django autentica internamente usando el 'username'
        user = authenticate(username=user_obj.username, password=password)
    except CustomUser.DoesNotExist:
        user = None
        
    if user:
        # ¡Generamos los tokens para este usuario!
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'name': user.first_name or user.username,
                'email': user.email,
                'role': getattr(user, 'role', 'usuario')
            },
            # Le enviamos las llaves al frontend
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
        
    # Guardamos el usuario nuevo en MySQL
    user = CustomUser.objects.create(
        username=email, # Usamos el correo como nombre de usuario internamente
        email=email,
        first_name=name,
        password=make_password(password), # ¡Contraseña encriptada y segura!
        role='usuario'
    )
    
    return Response({'success': True, 'message': 'Usuario registrado exitosamente'})

# Importa el serializador arriba: from .serializers import ..., TournamentRequestSerializer
# Importa el modelo arriba: from .models import ..., TournamentRequest

class TournamentRequestViewSet(viewsets.ModelViewSet):
    queryset = TournamentRequest.objects.all()
    serializer_class = TournamentRequestSerializer


from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    # Solo te devuelve TUS notificaciones, ordenadas de la más nueva a la más vieja
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-createdAt')

    # Acción especial para el botón "Marcar todas como leídas"
    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        notificaciones = self.get_queryset().filter(is_read=False)
        notificaciones.update(is_read=True)
        return Response({'success': True, 'message': 'Todas marcadas como leídas'})