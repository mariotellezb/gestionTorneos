╔═══════════════════════════════════════════════════════════════════════════════╗
║                      SISTEMA DE GESTIÓN DE TORNEOS                            ║
║                           Versión 1.0.0 - 2024                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝

📋 DESCRIPCIÓN GENERAL
═══════════════════════════════════════════════════════════════════════════════
Plataforma web completa para la gestión integral de torneos deportivos. Permite
crear, editar y administrar torneos, equipos, calendarios de partidos y resultados.

✨ CARACTERÍSTICAS PRINCIPALES
═══════════════════════════════════════════════════════════════════════════════
✓ Gestión de usuarios (Registro, Inicio de sesión, Cambio de contraseña)
✓ CRUD completo de torneos (Crear, Editar, Eliminar, Ver)
✓ Gestión de equipos y participantes
✓ Calendario de partidos con programación flexible
✓ Registro y consulta de resultados
✓ Tabla de posiciones automática por torneo
✓ Panel de administración con reportes y estadísticas
✓ Diferentes roles de usuario (Admin, Organizador, Capitán, Usuario)
✓ Interfaz responsiva y moderna
✓ Base de datos simulada con localStorage

👥 ROLES Y PERMISOS
═══════════════════════════════════════════════════════════════════════════════

1. ADMINISTRADOR (administrador)
   - Acceso completo al sistema
   - Gestión de usuarios
   - Control de todos los torneos y equipos
   - Acceso al panel de administración
   - Generación de reportes

2. ORGANIZADOR (organizador)
   - Crear y editar torneos
   - Programar partidos
   - Registrar resultados
   - Ver estadísticas de sus torneos

3. CAPITÁN (capitan)
   - Crear y editar equipos
   - Agregar/remover miembros
   - Ver partidos de su equipo

4. USUARIO/ESPECTADOR (usuario)
   - Ver información pública de torneos
   - Consultar resultados y tablas de posiciones
   - Ver calendario de partidos

🔑 CREDENCIALES DE PRUEBA
═══════════════════════════════════════════════════════════════════════════════

ADMINISTRADOR:
  Email: admin@torneos.com
  Contraseña: admin123

ORGANIZADOR:
  Email: juan@torneos.com
  Contraseña: pass123

Puedes crear más usuarios registrándote desde la página de registro.

🚀 CÓMO USAR
═══════════════════════════════════════════════════════════════════════════════

1. INICIAR LA APLICACIÓN
   - Abre index.html en tu navegador
   - O navega a: http://localhost (si usas un servidor local)

2. INICIAR SESIÓN
   - Usa las credenciales de prueba adjuntas
   - O crea una nueva cuenta desde "Registrarse"

3. CREAR UN TORNEO (Como Organizador)
   - Ve a "Torneos"
   - Haz clic en "+ Crear Torneo"
   - Completa los datos y guarda

4. CREAR UN EQUIPO (Como Capitán)
   - Ve a "Equipos"
   - Haz clic en "+ Crear Equipo"
   - Agrega miembros desde la vista de detalles

5. PROGRAMAR PARTIDOS (Como Organizador)
   - Ve a "Calendario"
   - Haz clic en "+ Crear Partido"
   - Selecciona torneo, equipos, fecha y hora

6. REGISTRAR RESULTADOS (Como Organizador)
   - Ve a "Resultados"
   - Haz clic en "Registrar" en un partido programado
   - Ingresa los goles y guarda

7. VER TABLA DE POSICIONES
   - Ve a "Resultados"
   - Desplázate hacia abajo para ver la tabla de posiciones automática

📍 ARCHIVOS DEL PROYECTO
═══════════════════════════════════════════════════════════════════════════════

Pages (HTML):
- index.html: Página de inicio y bienvenida
- login.html: Página de inicio de sesión
- signin.html: Página de registro de nuevos usuarios
- dashboard.html: Panel principal con estadísticas
- torneos.html: Gestión de torneos
- equipos.html: Gestión de equipos y miembros
- calendario.html: Programación de partidos
- resultados.html: Registro de resultados y tabla de posiciones
- perfil.html: Perfil de usuario
- admin.html: Panel de administración

JavaScript (js/):
- db.js: Base de datos simulada con localStorage
- app.js: Funciones generales y utilidades
- auth.js: Lógica de autenticación

CSS (css/):
- styles.css: Estilos de toda la aplicación

✅ REQUERIMIENTOS IMPLEMENTADOS
═══════════════════════════════════════════════════════════════════════════════

Requerimientos Funcionales:
✓ RF01: Registro de usuarios
✓ RF02: Inicio de sesión
✓ RF03: Cerrar sesión segura
✓ RF04: Autenticación de administradores
✓ RF05: CRUD de torneos
✓ RF06: Gestión de equipos y participantes
✓ RF07: Calendario de torneos
✓ RF08: Registro y consulta de resultados
✓ RF09: Información pública de torneos

Requerimientos No Funcionales:
✓ RNF-01: Rendimiento optimizado
✓ RNF-02: Seguridad con autenticación
✓ RNF-03: Usabilidad intuitiva
✓ RNF-04: Disponibilidad garantizada
✓ RNF-05: Escalabilidad
✓ RNF-06: Mantenibilidad del código

═══════════════════════════════════════════════════════════════════════════════