/* ================================================================
   LOGOUT CENTRALIZADO - Centro de Estudiantes Digital
   Gestiona la limpieza de sesión y redirección en todas las páginas
================================================================ */

// El nombre de la "caja" donde guardamos los datos del usuario en el navegador
const SESSION_STORAGE_KEY = 'cedSession';

// Esta es la función que se ejecuta cuando alguien decide irse del sistema
function performLogout() {
  // Borramos TODA la memoria local del navegador relacionada con este sitio. 
  // Esto elimina la sesión, el nombre del usuario y cualquier dato guardado.
  localStorage.clear(); 

  // Si existían datos de prueba cargados temporalmente, los ponemos en "nada" (null)
  if (window.__FALLBACK_DATA__) {
    window.__FALLBACK_DATA__ = null;
  }

  // Una vez que limpiamos todo, mandamos al usuario de patitas a la calle (la landing page)
  window.location.href = '../index.html';
}

// Hacemos que esta función sea "famosa" (global) para que podamos llamarla 
// desde cualquier botón de "Cerrar Sesión" en cualquier parte del sitio.
window.performLogout = performLogout;
