// ======================== LOGIN ========================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            showAuthAlert("Por favor completa todos los campos", "danger");
            return;
        }

        const result = db.loginUser(email, password);

        if (result.success) {
            showAuthAlert("¡Bienvenido! Redirigiendo...", "success");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } else {
            showAuthAlert(result.message, "danger");
        }
    });
}

// ======================== SIGNUP ========================
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function(e) {
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

        const result = db.registerUser(name, email, password, "usuario");

        if (result.success) {
            showAuthAlert("¡Registro exitoso! Redirigiendo a iniciar sesión...", "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } else {
            showAuthAlert(result.message, "danger");
        }
    });
}

// ======================== UI HELPERS ========================
function showAuthAlert(message, type) {
    const alertDiv = document.getElementById("alert");
    if (!alertDiv) {
        const newAlert = document.createElement("div");
        newAlert.id = "alert";
        document.body.insertBefore(newAlert, document.body.firstChild);
    }
    
    const alert = document.getElementById("alert");
    alert.textContent = message;
    alert.className = `alert alert-${type} active`;
    
    setTimeout(() => {
        alert.classList.remove("active");
    }, 3000);
}
