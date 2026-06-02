// ======================== LOGIN (CONECTADO A DJANGO) ========================
var API_BASE_URL = 'http://127.0.0.1:8000/api';

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            showAuthAlert("Por favor completa todos los campos", "danger");
            return;
        }

        try {
            fetch('https://backend-troyan-legacy.onrender.com/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Guardamos la sesión local para que app.js la detecte
                localStorage.setItem("currentUser", JSON.stringify(data.user));
                showAuthAlert("¡Bienvenido! Redirigiendo...", "success");
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            } else {
                showAuthAlert(data.message, "danger");
            }
        } catch (error) {
            // ¡Esta línea es nueva y nos dirá la verdad en la consola!
            console.error("EL ERROR REAL ES:", error); 
            showAuthAlert("Error al conectar con el servidor", "danger");
        }
    });
}

// ======================== SIGNUP (CONECTADO A DJANGO) ========================
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!name || !email || !password) {
            showAuthAlert("Por favor completa todos los campos", "danger");
            return;
        }

        if (password.length < 6) {
            showAuthAlert("La contraseña debe tener al menos 6 caracteres", "danger");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Guardamos al usuario para tu interfaz
                localStorage.setItem("currentUser", JSON.stringify(data.user));
                
                // ¡NUEVO: Guardamos las llaves de seguridad!
                localStorage.setItem("accessToken", data.access);
                localStorage.setItem("refreshToken", data.refresh);

                showAuthAlert("¡Bienvenido! Redirigiendo...", "success");
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            } else {
                showAuthAlert(data.message, "danger");
            }
        } catch (error) {
            // ¡Esta línea es nueva y nos dirá la verdad en la consola!
            console.error("EL ERROR REAL ES:", error); 
            showAuthAlert("Error al conectar con el servidor", "danger");
        }
    });
}

// ======================== UI HELPERS ========================
function showAuthAlert(message, type) {
    let alertDiv = document.getElementById("alert");
    if (!alertDiv) {
        const newAlert = document.createElement("div");
        newAlert.id = "alert";
        document.body.insertBefore(newAlert, document.body.firstChild);
        alertDiv = newAlert;
    }
    
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type} active`;
    
    setTimeout(() => {
        alertDiv.classList.remove("active");
    }, 3000);
}