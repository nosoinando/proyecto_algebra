// Bloquear acceso si no ha iniciado sesión
if (localStorage.getItem("logueado") !== "true") {
    window.location.href = "login.html";
}

// Logout
document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.removeItem("logueado");
    window.location.href = "login.html";
});
