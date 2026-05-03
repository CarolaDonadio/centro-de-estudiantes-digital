/* ================================================================
   LOGOUT CENTRALIZADO - Centro de Estudiantes Digital
   Gestiona la limpieza de sesión y redirección en todas las páginas
================================================================ */

const SESSION_STORAGE_KEY = 'cedSession';

function performLogout() {
  localStorage.clear();

  if (window.__FALLBACK_DATA__) {
    window.__FALLBACK_DATA__ = null;
  }

  window.location.href = 'index.html';
}

// Exportar para uso en otros scripts
window.performLogout = performLogout;
