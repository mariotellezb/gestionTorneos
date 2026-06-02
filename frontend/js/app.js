// ======================== APPLICATION UTILITIES (CONECTADA A DJANGO) ========================

var API_BASE_URL = 'https://backend-troyan-legacy.onrender.com/api';

class App {
    constructor() {
        this.apiUrl = API_BASE_URL;
        this.refreshUserSession(); // Constructor único y seguro
        this.loadTheme();
    }

    // ==========================================
    // GESTIÓN DE SESIÓN (Segura contra "undefined")
    // ==========================================
    refreshUserSession() {
        const userStr = localStorage.getItem('currentUser');
        
        // Verificamos que exista y que NO sea basura
        if (userStr && userStr !== "undefined" && userStr !== "null") {
            try {
                this.currentUser = JSON.parse(userStr);
            } catch (e) {
                console.error("Error al leer el usuario, limpiando...", e);
                this.currentUser = null;
            }
        } else {
            this.currentUser = null;
        }
        
        this.accessToken = localStorage.getItem("accessToken");
        this.refreshToken = localStorage.getItem("refreshToken");
    }

    checkAuth() {
        this.refreshUserSession(); // Siempre validamos al pedir auth
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    logout() {
        if (confirm('¿Deseas cerrar sesión?')) {
            localStorage.removeItem("currentUser");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "login.html";
        }
    }

    // ==========================================
    // PETICIONES A DJANGO (FETCH API)
    // ==========================================
    async fetchAPI(endpoint, options = {}) {
        const url = `${this.apiUrl}${endpoint}`;
        const token = localStorage.getItem("accessToken");

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {})
        };

        try {
            const response = await fetch(url, { ...options, headers });

            if (response.status === 401) {
                console.warn("Token inválido o expirado.");
                // Si el token expira, es buena práctica hacer logout automático
                // this.logout(); 
                throw new Error("Sesión expirada");
            }

            if (response.status === 204) return null;

            return await response.json();
        } catch (error) {
            console.error(`Error en fetchAPI (${endpoint}):`, error);
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

    // ======================== ROLES ========================
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'administrador';
    }

    isOrganizer() {
        return this.currentUser && ['organizador', 'creador', 'administrador'].includes(this.currentUser.role);
    }
    
    canCreateTournament() {
        return this.isOrganizer();
    }

    isCaptain() {
        return this.currentUser && ['capitan', 'administrador'].includes(this.currentUser.role);
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
        if (modal) modal.classList.add('active');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    }

    // ======================== TABLE & FORMATTING HELPERS ========================
    createTableRow(data) {
        const tr = document.createElement('tr');
        Object.values(data).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        return tr;
    }

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

    // ======================== FORM HELPERS ========================
    getFormData(formId) {
        const form = document.getElementById(formId);
        if(!form) return {};
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => { data[key] = value; });
        return data;
    }

    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) form.reset();
    }

    // ======================== ASYNC DATA HELPERS ========================
    async getTournamentName(tournamentId) {
        try {
            const tournament = await this.fetchAPI(`/tournaments/${tournamentId}/`);
            return tournament ? tournament.name : 'Torneo desconocido';
        } catch (error) {
            return 'Torneo desconocido';
        }
    }

    // ======================== TOURNAMENT & TEAM ACTIONS ========================
    async joinTeam(teamId) {
        if (!confirm('¿Estás seguro de que deseas unirte a este equipo como jugador?')) return;
        try {
            const response = await this.fetchAPI(`/teams/${teamId}/join/`, {
                method: 'POST',
                body: JSON.stringify({ user_id: this.currentUser.id }) 
            });
            
            if (response && response.error) {
                this.showAlert(response.error, 'warning');
                return; 
            }
            this.showAlert('¡Te has unido al equipo exitosamente!', 'success');
            this.closeModal('detailsModal');
            this.closeModal('teamDetailsModal');
            if (typeof loadTournaments === 'function') loadTournaments(); 
            if (typeof loadTeams === 'function') loadTeams();
        } catch (error) {
            this.showAlert('Falla de sistema: ' + error.message, 'danger');
        }
    }

    async leaveTeam(teamId) {
        if (!confirm('¿Estás seguro de que deseas salir de este equipo?')) return;
        try {
            const response = await this.fetchAPI(`/teams/${teamId}/leave/`, {
                method: 'POST',
                body: JSON.stringify({ user_id: this.currentUser.id }) 
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
            this.showAlert('Falla de sistema: ' + error.message, 'danger');
        }
    }

    async joinTournament() {
        if (!this.currentUser) {
            this.showAlert('Debes iniciar sesión para unirte a un torneo', 'warning');
            return;
        }
        try {
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
            const result = db.requestJoinTournamentWithDetails(tournamentId, this.currentUser.id, {
                teamName, captainName, phone, email, notes
            });
            if (result.success) {
                this.showAlert('Solicitud enviada al creador del torneo.', 'success');
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
        window.location.href = 'torneos.html?action=create';
    }
}

// ======================== INITIALIZATION ========================
window.app = new App();

document.addEventListener('DOMContentLoaded', () => {
    // Solo validamos auth si NO estamos en páginas públicas
    const isPublicPage = window.location.href.includes('login.html') || 
                         window.location.href.includes('signin.html') || 
                         window.location.href.includes('index.html') ||
                         window.location.pathname === '/' ||
                         window.location.pathname.endsWith('/');

    if (!isPublicPage) {
        if (app.checkAuth()) {
            if (typeof app.loadNotifications === 'function') {
                app.loadNotifications();
            }
        }
    }
});