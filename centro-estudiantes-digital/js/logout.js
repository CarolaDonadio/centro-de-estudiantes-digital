/* ================================================================
   LOGOUT CENTRALIZADO - Centro de Estudiantes Digital
   Gestiona la limpieza de sesión y redirección en todas las páginas
================================================================ */

const SESSION_STORAGE_KEY = 'cedSession';

function performLogout() {
  // Limpiar localStorage
  localStorage.removeItem(SESSION_STORAGE_KEY);
  
  // Limpiar estado global si existe
  if (window.__FALLBACK_DATA__) {
    window.__FALLBACK_DATA__ = null;
  }
  
  // Redirigir al login
  window.location.href = 'log.html';
}

// Exportar para uso en otros scripts
window.performLogout = performLogout;
