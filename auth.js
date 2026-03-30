// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        console.log("Login:", email, password);

        alert("Inicio de sesión simulado");
    });
}

// SIGNUP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        console.log("Registro:", name, email, password);

        alert("Registro simulado");
    });
}