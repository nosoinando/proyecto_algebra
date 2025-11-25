// Manejo de botones principales del Home

document.getElementById("btnEmpezar").addEventListener("click", () => {
    window.location.href = "./views/login.html";
});

document.getElementById("btnPlanes").addEventListener("click", () => {
    document.getElementById("planes").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("btnContactar").addEventListener("click", () => {
    alert("Puedes contactarnos al correo: soporte@algebralineal.com");
});
