// ======================== LOGIN Y SIGNUP (CONECTADO A DJANGO) ========================
var API_BASE_URL = 'https://backend-troyan-legacy.onrender.com/api';

// --- LOGIN ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await fetch(`${API_BASE_URL}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem("currentUser", JSON.stringify(data.user));
                localStorage.setItem("accessToken", data.access);
                localStorage.setItem("refreshToken", data.refresh);

                showAuthAlert("¡Bienvenido!", "success");
                setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
            } else {
                showAuthAlert(data.message || "Error al iniciar sesión", "danger");
            }
        } catch (error) {
            console.error("Error:", error);
            showAuthAlert("Error de conexión con el servidor", "danger");
        }
    });
}

// --- SIGNUP ---
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            // 1. Intentamos registrar al usuario
            const response = await fetch(`${API_BASE_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showAuthAlert("¡Cuenta creada! Preparando tu sesión...", "success");
                
                // 2. ¡EL TRUCO! Hacemos login automático de inmediato
                const loginResponse = await fetch(`${API_BASE_URL}/login/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const loginData = await loginResponse.json();

                // 3. Si el login automático funciona, guardamos las llaves reales
                if (loginResponse.ok && loginData.success) {
                    localStorage.setItem("currentUser", JSON.stringify(loginData.user));
                    localStorage.setItem("accessToken", loginData.access);
                    localStorage.setItem("refreshToken", loginData.refresh);

                    setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
                } else {
                    // Plan B por si algo muy raro pasa
                    showAuthAlert("Registrado. Por favor, inicia sesión.", "warning");
                    setTimeout(() => { window.location.href = "login.html"; }, 1500);
                }

            } else {
                showAuthAlert(data.message || "Error al registrarse", "danger");
            }
        } catch (error) {
            console.error("Error:", error);
            showAuthAlert("Error de conexión", "danger");
        }
    });
}

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
    setTimeout(() => { alertDiv.classList.remove("active"); }, 3000);
}