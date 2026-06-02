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
                // Guardamos los tokens con nombres exactos que espera app.js
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
            const response = await fetch(`${API_BASE_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem("currentUser", JSON.stringify(data.user));
                localStorage.setItem("accessToken", data.access);
                localStorage.setItem("refreshToken", data.refresh);

                showAuthAlert("¡Cuenta creada!", "success");
                setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
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