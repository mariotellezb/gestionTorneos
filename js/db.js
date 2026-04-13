// ======================== DATABASE SIMULATION WITH LOCALSTORAGE ========================

class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Initialize users if don't exist
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    id: 1,
                    name: 'Admin',
                    email: 'admin@torneos.com',
                    password: 'admin123',
                    role: 'administrador',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Juan Organizador',
                    email: 'juan@torneos.com',
                    password: 'pass123',
                    role: 'organizador',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
            localStorage.setItem('nextUserId', '3');
        }

        // Initialize tournaments if don't exist
        if (!localStorage.getItem('tournaments')) {
            const defaultTournaments = [
                {
                    id: 1,
                    name: 'Torneo de Futbol 2024',
                    description: 'Primer torneo de futbol del año',
                    sport: 'Futbol',
                    startDate: '2024-05-15',
                    endDate: '2024-06-30',
                    location: 'Estadio Central',
                    status: 'active',
                    organizerId: 2,
                    maxTeams: 16,
                    teams: [1, 2],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('tournaments', JSON.stringify(defaultTournaments));
            localStorage.setItem('nextTournamentId', '2');
        }

        // Initialize teams if don't exist
        if (!localStorage.getItem('teams')) {
            const defaultTeams = [
                {
                    id: 1,
                    name: 'Equipo A',
                    description: 'Primer equipo',
                    captainId: 2,
                    members: [2],
                    registeredDate: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Equipo B',
                    description: 'Segundo equipo',
                    captainId: 1,
                    members: [1],
                    registeredDate: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('teams', JSON.stringify(defaultTeams));
            localStorage.setItem('nextTeamId', '3');
        }

        // Initialize matches if don't exist
        if (!localStorage.getItem('matches')) {
            const defaultMatches = [
                {
                    id: 1,
                    tournamentId: 1,
                    homeTeamId: 1,
                    awayTeamId: 2,
                    date: '2024-05-20',
                    time: '15:00',
                    location: 'Estadio Central',
                    status: 'scheduled',
                    homeScore: null,
                    awayScore: null,
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('matches', JSON.stringify(defaultMatches));
            localStorage.setItem('nextMatchId', '2');
        }

        // Initialize current user session
        if (!localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify(null));
        }
    }

    // ======================== USER METHODS ========================
    registerUser(name, email, password, role = 'usuario') {
        const users = JSON.parse(localStorage.getItem('users'));
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            return { success: false, message: 'El correo ya está registrado' };
        }

        const newUser = {
            id: parseInt(localStorage.getItem('nextUserId')),
            name,
            email,
            password, // In production, should be hashed
            role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('nextUserId', (newUser.id + 1).toString());

        return { success: true, message: 'Usuario registrado exitosamente', user: newUser };
    }

    loginUser(email, password) {
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: 'Correo o contraseña incorrectos' };
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, message: 'Inicio de sesión exitoso', user };
    }

    logoutUser() {
        localStorage.setItem('currentUser', JSON.stringify(null));
        return { success: true, message: 'Sesión cerrada' };
    }

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    updateUser(userId, updates) {
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('users', JSON.stringify(users));

        // Update current user if it's the same
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
        }

        return { success: true, message: 'Usuario actualizado', user: users[userIndex] };
    }

    getAllUsers() {
        return JSON.parse(localStorage.getItem('users'));
    }

    getUserById(userId) {
        const users = JSON.parse(localStorage.getItem('users'));
        return users.find(u => u.id === userId);
    }

    // ======================== TOURNAMENT METHODS ========================
    createTournament(data) {
        const tournaments = JSON.parse(localStorage.getItem('tournaments'));
        
        const newTournament = {
            id: parseInt(localStorage.getItem('nextTournamentId')),
            ...data,
            status: 'active',
            teams: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        tournaments.push(newTournament);
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
        localStorage.setItem('nextTournamentId', (newTournament.id + 1).toString());

        return { success: true, message: 'Torneo creado exitosamente', tournament: newTournament };
    }

    updateTournament(tournamentId, updates) {
        const tournaments = JSON.parse(localStorage.getItem('tournaments'));
        const tournamentIndex = tournaments.findIndex(t => t.id === tournamentId);

        if (tournamentIndex === -1) {
            return { success: false, message: 'Torneo no encontrado' };
        }

        tournaments[tournamentIndex] = { ...tournaments[tournamentIndex], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('tournaments', JSON.stringify(tournaments));

        return { success: true, message: 'Torneo actualizado', tournament: tournaments[tournamentIndex] };
    }

    deleteTournament(tournamentId) {
        const tournaments = JSON.parse(localStorage.getItem('tournaments'));
        const filteredTournaments = tournaments.filter(t => t.id !== tournamentId);

        localStorage.setItem('tournaments', JSON.stringify(filteredTournaments));
        return { success: true, message: 'Torneo eliminado' };
    }

    getAllTournaments() {
        return JSON.parse(localStorage.getItem('tournaments'));
    }

    getTournamentById(tournamentId) {
        const tournaments = JSON.parse(localStorage.getItem('tournaments'));
        return tournaments.find(t => t.id === tournamentId);
    }

    getTournamentsByOrganizer(organizerId) {
        const tournaments = JSON.parse(localStorage.getItem('tournaments'));
        return tournaments.filter(t => t.organizerId === organizerId);
    }

    // ======================== TEAM METHODS ========================
    createTeam(name, description, captainId) {
        const teams = JSON.parse(localStorage.getItem('teams'));

        const newTeam = {
            id: parseInt(localStorage.getItem('nextTeamId')),
            name,
            description,
            captainId,
            members: [captainId],
            registeredDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        teams.push(newTeam);
        localStorage.setItem('teams', JSON.stringify(teams));
        localStorage.setItem('nextTeamId', (newTeam.id + 1).toString());

        return { success: true, message: 'Equipo creado exitosamente', team: newTeam };
    }

    updateTeam(teamId, updates) {
        const teams = JSON.parse(localStorage.getItem('teams'));
        const teamIndex = teams.findIndex(t => t.id === teamId);

        if (teamIndex === -1) {
            return { success: false, message: 'Equipo no encontrado' };
        }

        teams[teamIndex] = { ...teams[teamIndex], ...updates };
        localStorage.setItem('teams', JSON.stringify(teams));

        return { success: true, message: 'Equipo actualizado', team: teams[teamIndex] };
    }

    deleteTeam(teamId) {
        const teams = JSON.parse(localStorage.getItem('teams'));
        const filteredTeams = teams.filter(t => t.id !== teamId);

        localStorage.setItem('teams', JSON.stringify(filteredTeams));
        return { success: true, message: 'Equipo eliminado' };
    }

    getAllTeams() {
        return JSON.parse(localStorage.getItem('teams'));
    }

    getTeamById(teamId) {
        const teams = JSON.parse(localStorage.getItem('teams'));
        return teams.find(t => t.id === teamId);
    }

    addMemberToTeam(teamId, userId) {
        const teams = JSON.parse(localStorage.getItem('teams'));
        const team = teams.find(t => t.id === teamId);

        if (!team) {
            return { success: false, message: 'Equipo no encontrado' };
        }

        if (team.members.includes(userId)) {
            return { success: false, message: 'El usuario ya está en el equipo' };
        }

        team.members.push(userId);
        localStorage.setItem('teams', JSON.stringify(teams));

        return { success: true, message: 'Miembro agregado al equipo', team };
    }

    removeMemberFromTeam(teamId, userId) {
        const teams = JSON.parse(localStorage.getItem('teams'));
        const team = teams.find(t => t.id === teamId);

        if (!team) {
            return { success: false, message: 'Equipo no encontrado' };
        }

        team.members = team.members.filter(m => m !== userId);
        localStorage.setItem('teams', JSON.stringify(teams));

        return { success: true, message: 'Miembro removido del equipo', team };
    }

    // ======================== MATCH METHODS ========================
    createMatch(data) {
        const matches = JSON.parse(localStorage.getItem('matches'));

        const newMatch = {
            id: parseInt(localStorage.getItem('nextMatchId')),
            ...data,
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };

        matches.push(newMatch);
        localStorage.setItem('matches', JSON.stringify(matches));
        localStorage.setItem('nextMatchId', (newMatch.id + 1).toString());

        return { success: true, message: 'Partido creado exitosamente', match: newMatch };
    }

    updateMatch(matchId, updates) {
        const matches = JSON.parse(localStorage.getItem('matches'));
        const matchIndex = matches.findIndex(m => m.id === matchId);

        if (matchIndex === -1) {
            return { success: false, message: 'Partido no encontrado' };
        }

        matches[matchIndex] = { ...matches[matchIndex], ...updates };
        localStorage.setItem('matches', JSON.stringify(matches));

        return { success: true, message: 'Partido actualizado', match: matches[matchIndex] };
    }

    deleteMatch(matchId) {
        const matches = JSON.parse(localStorage.getItem('matches'));
        const filteredMatches = matches.filter(m => m.id !== matchId);

        localStorage.setItem('matches', JSON.stringify(filteredMatches));
        return { success: true, message: 'Partido eliminado' };
    }

    getAllMatches() {
        return JSON.parse(localStorage.getItem('matches'));
    }

    getMatchesByTournament(tournamentId) {
        const matches = JSON.parse(localStorage.getItem('matches'));
        return matches.filter(m => m.tournamentId === tournamentId);
    }

    // ======================== UTILITY METHODS ========================
    clearAllData() {
        localStorage.clear();
        this.initializeDatabase();
    }
}

// Create global database instance
const db = new Database();
