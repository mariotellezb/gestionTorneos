// ======================== APPLICATION UTILITIES (CONECTADA A DJANGO) ========================

var API_BASE_URL = 'https://backend-troyan-legacy.onrender.com/api';

class App {
    constructor() {
        this.apiUrl = API_BASE_URL;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.loadTheme();
    }

    async fetchAPI(endpoint, options = {}) {
        const url = `${this.apiUrl}${endpoint}`;
        const token = localStorage.getItem("accessToken"); // Nombre exacto que guardamos en auth.js

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}), // Inyectamos el token si existe
            ...(options.headers || {})
        };

        try {
            const response = await fetch(url, { ...options, headers });

            // Manejo de errores de autenticación
            if (response.status === 401) {
                console.warn("Token inválido o expirado.");
                // Opcional: this.logout();
                throw new Error("Sesión expirada");
            }

            if (response.status === 204) return null;

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

    // ======================== TEMA (MODO CLARO/OSCURO) ========================
    toggleTheme() {
        const body = document.body;
        body.classList.toggle('light-mode');
        
        const isLight = body.classList.contains('light-mode');
        localStorage.setItem('troyan_theme', isLight ? 'light' : 'dark');
        
        // Cambiar el texto del botón si existe en la pantalla actual
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.innerHTML = isLight ? '🌙 Modo Oscuro' : '☀️ Modo Claro';
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('troyan_theme');
        const themeBtn = document.getElementById('themeToggleBtn');
        
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            if (themeBtn) themeBtn.innerHTML = '🌙 Modo Oscuro';
        } else {
            document.body.classList.remove('light-mode');
            if (themeBtn) themeBtn.innerHTML = '☀️ Modo Claro';
        }
    }

    // ======================== ACCIONES DE EQUIPOS GLOBALES ========================
    async joinTeam(teamId) {
        if (!confirm('¿Estás seguro de que deseas unirte a este equipo como jugador?')) return;
        
        try {
            const currentUser = this.currentUser;
            
            const response = await this.fetchAPI(`/teams/${teamId}/join/`, {
                method: 'POST',
                body: JSON.stringify({ user_id: currentUser.id }) 
            });
            
            if (response && response.error) {
                this.showAlert(response.error, 'warning');
                return; 
            }
            
            this.showAlert('¡Te has unido al equipo exitosamente!', 'success');
            
            // Cerramos las ventanas (sin importar en qué pantalla estemos)
            this.closeModal('detailsModal');
            this.closeModal('teamDetailsModal');
            
            // Recargamos los datos
            if (typeof loadTournaments === 'function') loadTournaments(); 
            if (typeof loadTeams === 'function') loadTeams();
            
        } catch (error) {
            console.error("Error técnico al unirse:", error);
            // 🔥 AQUÍ ESTÁ LA MAGIA: Nos dirá exactamente por qué falló
            this.showAlert('Falla de sistema: ' + error.message, 'danger');
        }
    }

    async leaveTeam(teamId) {
        if (!confirm('¿Estás seguro de que deseas salir de este equipo?')) return;
        
        try {
            const currentUser = this.currentUser;
            
            const response = await this.fetchAPI(`/teams/${teamId}/leave/`, {
                method: 'POST',
                body: JSON.stringify({ user_id: currentUser.id }) 
            });
            
            if (response && response.error) {
                this.showAlert(response.error, 'warning');
                return;
            }
            
            this.showAlert('Has salido del equipo exitosamente', 'success');
            this.closeModal('detailsModal');
            this.closeModal('teamDetailsModal');
            
            if (typeof loadTournaments === 'function') loadTournaments(); 
            if (typeof loadTeams === 'function') loadTeams();
            
        } catch (error) {
            console.error("Error técnico al salir:", error);
            this.showAlert('Falla de sistema: ' + error.message, 'danger');
        }
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
        if (app.checkAuth()) {
            if (typeof app.loadNotifications === 'function') {
                app.loadNotifications();
            }
        }
    }
});