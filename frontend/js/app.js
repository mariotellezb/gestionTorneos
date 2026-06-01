// ======================== APPLICATION UTILITIES (CONECTADA A DJANGO) ========================

// URL base de tu API de Django
var API_BASE_URL = 'http://127.0.0.1:8000/api';

class App {
    constructor() {
        this.currentPage = '';
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    // ==========================================
    // CONEXIÓN A LA API CON SEGURIDAD JWT
    // ==========================================
    async fetchAPI(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        // 1. Buscamos la llave en el bolsillo del navegador
        const token = localStorage.getItem("accessToken");

        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        // 2. Si tenemos la llave, se la pegamos a la petición
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // 3. Si el guardia de Django nos dice que la llave caducó (Error 401)
            if (response.status === 401) {
                console.error("La sesión ha expirado o el token es inválido.");
                this.logout(); // Expulsamos al usuario por seguridad
                throw new Error("Sesión expirada");
            }

            // Si es un DELETE que no devuelve contenido (204 No Content), no intentamos leer el JSON
            if (response.status === 204) {
                return null; 
            }

            return await response.json();
            
        } catch (error) {
            console.error(`Error en fetchAPI (${endpoint}):`, error);
            throw error;
        }
    }

    // ==========================================
    // CERRAR SESIÓN (DESTRUIR LLAVES)
    // ==========================================
    logout() {
        // Borramos todo rastro del usuario y sus llaves por seguridad
        localStorage.removeItem("currentUser");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        
        window.location.href = "login.html";
    }

    // ======================== NAVIGATION ========================
    initializeNavigation() {
        const navItems = document.querySelectorAll('.sidebar-nav a');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(item.getAttribute('href'));
            });
        });

        this.updateNavigation();
    }

    navigateTo(page) {
        window.location.href = page;
    }

    updateNavigation() {
        const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';
        const navItems = document.querySelectorAll('.sidebar-nav li');
        navItems.forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('a');
            if (link && link.getAttribute('href').includes(currentFile.replace('.html', ''))) {
                item.classList.add('active');
            }
        });
    }

    // ======================== AUTHENTICATION ========================
    checkAuth() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'login.html';
            return false;
        }
        this.currentUser = currentUser;
        return true;
    }

    logout() {
        if (confirm('¿Deseas cerrar sesión?')) {
            // Limpiamos la sesión local
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'administrador';
    }

    isOrganizer() {
        return this.currentUser && (this.currentUser.role === 'organizador' || this.currentUser.role === 'creador' || this.currentUser.role === 'administrador');
    }
    
    canCreateTournament() {
        return this.currentUser && (this.currentUser.role === 'organizador' || this.currentUser.role === 'creador' || this.currentUser.role === 'administrador');
    }

    isCaptain() {
        return this.currentUser && (this.currentUser.role === 'capitan' || this.currentUser.role === 'administrador');
    }

    // ======================== UI HELPERS ========================
    showAlert(message, type = 'success') {
        const alertDiv = document.getElementById('alert');
        if (alertDiv) {
            alertDiv.textContent = message;
            alertDiv.className = `alert alert-${type} active`;
            setTimeout(() => {
                alertDiv.classList.remove('active');
            }, 3000);
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // ======================== TABLE HELPERS ========================
    createTableRow(data) {
        const tr = document.createElement('tr');
        Object.values(data).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        return tr;
    }

    // ======================== FORMATTING ========================
    formatDate(dateString) {
        if (!dateString) return 'Fecha no disponible';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    formatDateTime(dateString) {
        if (!dateString) return 'Fecha no disponible';
        return this.formatDate(dateString) + ' ' + new Date(dateString).toLocaleTimeString('es-ES');
    }

    // ======================== FORM HELPERS ========================
    getFormData(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        return data;
    }

    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    // ======================== ASYNC DATA HELPERS ========================
    // Nota: Estas funciones ahora son asíncronas porque consultan a Django
    
    async getTournamentName(tournamentId) {
        try {
            const tournament = await this.fetchAPI(`/tournaments/${tournamentId}/`);
            return tournament ? tournament.name : 'Torneo desconocido';
        } catch (error) {
            return 'Torneo desconocido';
        }
    }

    // ======================== TOURNAMENT ACTIONS (CONECTADO A DJANGO) ========================
    async joinTournament() {
        if (!this.currentUser) {
            this.showAlert('Debes iniciar sesión para unirte a un torneo', 'warning');
            return;
        }
        
        try {
            // Pedimos los torneos reales a Django
            const allTournaments = await this.fetchAPI('/tournaments/');
            const tournaments = allTournaments.filter(t => t.status === 'active');
            
            const select = document.getElementById('joinTournamentSelect');
            
            if (select) {
                select.innerHTML = '<option value="">-- Selecciona un torneo --</option>';
                tournaments.forEach(t => {
                    const option = document.createElement('option');
                    option.value = t.id;
                    option.textContent = `${t.name} (${t.sport}) - ${t.location}`;
                    select.appendChild(option);
                });
                
                if (tournaments.length === 0) {
                    select.innerHTML = '<option value="">No hay torneos disponibles</option>';
                    this.showAlert('No hay torneos activos en este momento', 'info');
                    return;
                }
            }
            
            this.showModal('joinTournamentModal');
        } catch (error) {
            this.showAlert('Error al cargar la lista de torneos del servidor', 'danger');
        }
    }
    
    async submitJoinRequest(e) {
        e.preventDefault();
        
        const tournamentId = parseInt(document.getElementById('joinTournamentSelect').value);
        const teamName = document.getElementById('joinTeamName').value;
        const captainName = document.getElementById('joinCaptainName').value;
        const phone = document.getElementById('joinPhone').value;
        const email = document.getElementById('joinEmail').value;
        const notes = document.getElementById('joinNotes').value;
        
        if (!tournamentId || !teamName || !captainName || !phone || !email) {
            this.showAlert('Por favor completa todos los campos requeridos', 'danger');
            return;
        }
        
        try {
            // Simulamos el envío por ahora. 
            // FUTURO: await this.fetchAPI('/requests/', { method: 'POST', body: JSON.stringify({...}) });
            
            // Usamos el fallback local temporalmente para no romper la UI
            const result = db.requestJoinTournamentWithDetails(tournamentId, this.currentUser.id, {
                teamName, captainName, phone, email, notes
            });
            
            if (result.success) {
                this.showAlert('Solicitud enviada al creador del torneo. Te notificaremos cuando sea aprobada.', 'success');
                this.closeModal('joinTournamentModal');
                document.getElementById('joinTournamentForm').reset();
            } else {
                this.showAlert(result.message, 'danger');
            }
        } catch (error) {
            this.showAlert('Error al enviar la solicitud', 'danger');
        }
    }

    createTournament() {
        if (!this.currentUser) {
            this.showAlert('Debes iniciar sesión para crear un torneo', 'warning');
            return;
        }
        
        if (!this.canCreateTournament()) {
            // Actualizamos en local storage por ahora
            this.currentUser.role = 'creador';
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.showAlert('¡Ahora tienes permisos para crear torneos!', 'success');
        }
        
        window.location.href = 'torneos.html?action=create';
    }

    // ======================== NOTIFICATIONS (CONECTADO A DJANGO) ========================
    toggleNotifications() {
        const dropdown = document.getElementById('notificationsDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
            this.loadNotifications();
        }
    }

    async loadNotifications() {
        if (!this.currentUser) return;
        
        try {
            // Descargamos las notificaciones reales de Django
            const notifications = await this.fetchAPI('/notifications/');
            
            const notificationsList = document.getElementById('notificationsList');
            const badge = document.getElementById('notificationBadge');
            
            if (notificationsList) {
                if (notifications.length === 0) {
                    notificationsList.innerHTML = '<p class="no-notifications" style="padding: 15px; text-align: center; color: #94a3b8;">No hay notificaciones</p>';
                } else {
                    notificationsList.innerHTML = notifications.map(n => `
                        <div class="notification-item ${n.is_read ? 'read' : 'unread'}" style="padding: 10px; border-bottom: 1px solid #334155; cursor: pointer; background: ${n.is_read ? 'transparent' : '#1e293b'};" 
                             onclick="app.handleNotificationClick(${n.id}, '${n.type}', ${n.tournamentId || 'null'}, ${n.requestId || 'null'})">
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <div class="notification-icon">${this.getNotificationIcon(n.type)}</div>
                                <div class="notification-content">
                                    <p style="margin: 0; color: #38bdf8; font-size: 14px; font-weight: bold;">${n.title}</p>
                                    <p style="margin: 2px 0; color: #cbd5e1; font-size: 12px;">${n.message}</p>
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
            }
            
            if (badge) {
                const unreadCount = notifications.filter(n => !n.is_read).length;
                if (unreadCount > 0) {
                    badge.textContent = unreadCount;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        } catch (error) {
            console.error("Error cargando notificaciones:", error);
        }
    }

    getNotificationIcon(type) {
        const icons = {
            'join_request': '📩',
            'request_accepted': '✅',
            'request_rejected': '❌',
            'tournament_update': '🏆'
        };
        return icons[type] || '🔔';
    }

    async handleNotificationClick(notificationId, type, tournamentId, requestId) {
        try {
            // Le decimos a Django que marcamos esta alerta en específico como leída
            await this.fetchAPI(`/notifications/${notificationId}/`, {
                method: 'PATCH',
                body: JSON.stringify({ is_read: true })
            });
            
            this.loadNotifications(); // Recargamos para quitar el fondo oscuro
            
            // Redirigimos al usuario a donde tenga sentido
            if (type === 'join_request' && tournamentId) {
                window.location.href = `torneos.html?tournament=${tournamentId}&view=requests`;
            } else if (tournamentId) {
                window.location.href = `torneos.html?tournament=${tournamentId}`;
            }
        } catch (error) {
            console.error("Error al marcar como leída:", error);
        }
    }

    async markAllNotificationsRead() {
        if (!this.currentUser) return;
        
        try {
            // Disparamos la ruta especial que creamos en views.py
            await this.fetchAPI('/notifications/mark-all-read/', { method: 'POST' });
            this.loadNotifications();
        } catch (error) {
            console.error("Error al marcar todas como leídas:", error);
        }
    }

    // ======================== TOURNAMENT REQUESTS (MANTENIDO LOCAL TEMPORALMENTE) ========================
    showJoinRequestModal(tournamentId) {
        if (typeof db === 'undefined') return;
        
        const teamName = prompt('Ingresa el nombre de tu equipo para unirte al torneo:');
        if (!teamName) return;
        
        const result = db.requestJoinTournament(tournamentId, this.currentUser.id, teamName);
        if (result.success) {
            this.showAlert('Solicitud enviada al creador del torneo', 'success');
        } else {
            this.showAlert(result.message, 'danger');
        }
    }

    respondToRequest(requestId, accepted) {
        if (typeof db === 'undefined') return;
        
        const result = db.respondToTournamentRequest(requestId, accepted);
        if (result.success) {
            this.showAlert(result.message, 'success');
            this.loadTournamentRequests();
        } else {
            this.showAlert(result.message, 'danger');
        }
    }

    loadTournamentRequests() {
        // This will be called from tournaments page
    }
}

window.app = new App();

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.href.includes('login.html') && !window.location.href.includes('signin.html') && !window.location.href.includes('index.html')) {
        app.checkAuth();
    }
});