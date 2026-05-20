from rest_framework import viewsets
from .models import Tournament, Team, Match
from .serializers import TournamentSerializer, TeamSerializer, MatchSerializer

# Los ViewSets de Django REST Framework crean automáticamente todas las 
# operaciones CRUD (Crear, Leer, Actualizar, Borrar) para tus modelos.

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    # Al exponer este ViewSet, Django creará automáticamente las rutas para:
    # GET /api/tournaments/ (Obtener todos)
    # POST /api/tournaments/ (Crear uno nuevo)
    # PUT /api/tournaments/1/ (Actualizar el ID 1)
    # DELETE /api/tournaments/1/ (Borrar el ID 1)

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

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
        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'name': user.first_name or user.username,
                'email': user.email,
                'role': getattr(user, 'role', 'usuario')
            }
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