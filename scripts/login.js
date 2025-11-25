document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const user = document.getElementById("usuario").value.trim();
    const pass = document.getElementById("contrasena").value.trim();
    const error = document.getElementById("errorMsg");

    // Hard-coded credentials
    if (user === "estudiante" && pass === "1234") {
        localStorage.setItem("logueado", "true");
        window.location.href = "dashboard.html";
    } else {
        error.style.display = "block";
    }
});
