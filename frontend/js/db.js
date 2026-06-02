// Este archivo reemplazará tu antiguo db.js basado en LocalStorage.
// Ahora nos comunicaremos con el servidor de Django de forma asíncrona.

class DatabaseAPI {
    
    // ======================== TOURNAMENT METHODS ========================
    
    // Antes: return JSON.parse(localStorage.getItem('tournaments'));
    async getAllTournaments() {
        try {
            const response = await fetch(`${API_BASE_URL}/tournaments/`);
            if (!response.ok) throw new Error('Error de red');
            const tournaments = await response.json();
            return tournaments;
        } catch (error) {
            console.error("Hubo un error al obtener los torneos:", error);
            return [];
        }
    }

    // Antes: localStorage.setItem('tournaments', JSON.stringify(tournaments));
    async createTournament(tournamentData) {
        try {
            const response = await fetch(`${API_BASE_URL}/tournaments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Aquí luego añadiremos el Token de autorización
                },
                body: JSON.stringify(tournamentData)
            });
            const newTournament = await response.json();
            return { success: true, message: 'Torneo creado', tournament: newTournament };
        } catch (error) {
            console.error("Error al crear torneo:", error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    async deleteTournament(tournamentId) {
        try {
            await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/`, {
                method: 'DELETE'
            });
            return { success: true, message: 'Torneo eliminado' };
        } catch (error) {
            console.error("Error al eliminar torneo:", error);
            return { success: false, message: 'Error de conexión' };
        }
    }
}

// Exportamos la nueva instancia
const db = new DatabaseAPI();