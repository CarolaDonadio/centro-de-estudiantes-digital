/*=====================INICIALIZACIÓN=====================*/
document.addEventListener("DOMContentLoaded", () => {
  console.log("App inicializada");
});



/* ================= INICIALIZACIÓN NAVBAR Y FOOTER INTERNO ================= */
document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  renderFooter();
});

/* ================= evita que entren sin login ================= */
/*const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario && window.location.pathname.includes("pages")) {
  window.location.href = "../pages/login.html";
}*/