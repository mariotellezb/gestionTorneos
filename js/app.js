// ======================== APPLICATION UTILITIES ========================

class App {
    constructor() {
        this.currentPage = '';
        this.currentUser = db.getCurrentUser();
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
        const currentUser = db.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return false;
        }
        this.currentUser = currentUser;
        return true;
    }

    logout() {
        if (confirm('¿Deseas cerrar sesión?')) {
            db.logoutUser();
            window.location.href = 'login.html';
        }
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'administrador';
    }

    isOrganizer() {
        return this.currentUser && (this.currentUser.role === 'organizador' || this.currentUser.role === 'administrador');
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
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    formatDateTime(dateString) {
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

    // ======================== USER HELPERS ========================
    getUserName(userId) {
        const user = db.getUserById(userId);
        return user ? user.name : 'Usuario desconocido';
    }

    getTeamName(teamId) {
        const team = db.getTeamById(teamId);
        return team ? team.name : 'Equipo desconocido';
    }

    getTournamentName(tournamentId) {
        const tournament = db.getTournamentById(tournamentId);
        return tournament ? tournament.name : 'Torneo desconocido';
    }

    // ======================== PERMISSION CHECKS ========================
    canEditTournament(tournamentId) {
        if (this.isAdmin()) return true;
        const tournament = db.getTournamentById(tournamentId);
        return tournament && tournament.organizerId === this.currentUser.id;
    }

    canEditTeam(teamId) {
        if (this.isAdmin()) return true;
        const team = db.getTeamById(teamId);
        return team && team.captainId === this.currentUser.id;
    }
}

// Create global app instance
const app = new App();

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.href.includes('login.html') && !window.location.href.includes('signin.html') && !window.location.href.includes('index.html')) {
        app.checkAuth();
    }
});
