// ======================== APPLICATION UTILITIES (CONECTADA A DJANGO) ========================

// URL base de tu API de Django
var API_BASE_URL = 'http://127.0.0.1:8000/api';

class App {
    constructor() {
        this.currentPage = '';
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    // ======================== API HELPER ========================
    // Función centralizada para hacer peticiones a Django
    async fetchAPI(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                // Aquí iría el Token de Auth en el futuro
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            // Si la respuesta no tiene contenido (ej. un DELETE exitoso), devolvemos null
            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            console.error(`Error en la petición a ${endpoint}:`, error);
            throw error;
        }
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

    // ======================== NOTIFICATIONS (MANTENIDO LOCAL TEMPORALMENTE) ========================
    // Nota: Mantenemos db.algo() aquí temporalmente hasta crear los modelos de Django
    toggleNotifications() {
        const dropdown = document.getElementById('notificationsDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
            this.loadNotifications();
        }
    }

    loadNotifications() {
        if (!this.currentUser || typeof db === 'undefined') return;
        
        const notifications = db.getNotifications(this.currentUser.id);
        const notificationsList = document.getElementById('notificationsList');
        const badge = document.getElementById('notificationBadge');
        
        if (notificationsList) {
            if (notifications.length === 0) {
                notificationsList.innerHTML = '<p class="no-notifications">No hay notificaciones</p>';
            } else {
                notificationsList.innerHTML = notifications.map(n => `
                    <div class="notification-item ${n.read ? 'read' : 'unread'}" onclick="app.handleNotificationClick(${n.id}, '${n.type}', ${n.tournamentId || 'null'}, ${n.requestId || 'null'})">
                        <div class="notification-icon-${n.type}">${this.getNotificationIcon(n.type)}</div>
                        <div class="notification-content">
                            <p class="notification-title">${n.title}</p>
                            <p class="notification-message">${n.message}</p>
                            <p class="notification-time">${this.formatDate(n.createdAt)}</p>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        if (badge) {
            const unreadCount = db.getUnreadNotificationsCount(this.currentUser.id);
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
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

    handleNotificationClick(notificationId, type, tournamentId, requestId) {
        if (typeof db !== 'undefined') {
            db.markNotificationAsRead(notificationId);
        }
        this.loadNotifications();
        
        if (type === 'join_request' && tournamentId) {
            window.location.href = `torneos.html?tournament=${tournamentId}&view=requests`;
        } else if (tournamentId) {
            window.location.href = `torneos.html?tournament=${tournamentId}`;
        }
    }

    markAllNotificationsRead() {
        if (!this.currentUser || typeof db === 'undefined') return;
        db.markAllNotificationsAsRead(this.currentUser.id);
        this.loadNotifications();
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