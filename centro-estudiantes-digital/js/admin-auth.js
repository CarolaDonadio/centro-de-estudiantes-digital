/* ================================================================
   AUTENTICACIÓN Y VALIDACIÓN DE ROL - Panel de Administración
   Verifica que el usuario tenga un rol permitido antes de acceder
================================================================ */

// La "llave" o nombre del compartimento donde guardamos los datos del usuario en el navegador
//const SESSION_STORAGE_KEY = 'cedSession';

// Función que intenta buscar y leer los datos del usuario desde la memoria local (localStorage)
function getSession() {
  try {
    // Convertimos el texto JSON guardado de vuelta a un objeto de JavaScript para poder usarlo
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));
  } catch {
    // Si hay un error (está vacío o corrupto), devolvemos null (nada)
    return null;
  }
}

// Función rápida para saber si el usuario tiene una sesión válida (tiene usuario y rol)
function isAuthenticated() {
  const session = getSession();
  return Boolean(session && session.usuario && session.rol);
}

// Todo este bloque se ejecuta automáticamente apenas termina de cargar el HTML de la página
document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();

  // --- 1. Control de acceso básico ---
  // Si no detectamos ninguna sesión iniciada, mandamos al usuario de vuelta al inicio (index.html)
  if (!isAuthenticated()) {
    console.warn('[Admin] No hay sesión activa.');
    window.location.href = 'index.html';
    return;
  }

  // --- 2. Filtro de Roles ---
  // Definimos quiénes TIENEN permiso para estar en esta página (admin.html)
  const allowedRoles = ['admin', 'administrador', 'docente', 'delegado'];
  if (!allowedRoles.includes(session?.rol?.toLowerCase())) {
    console.warn('[Admin] Acceso denegado. Rol:', session?.rol);
    // Si un alumno intenta entrar aquí, le borramos la sesión y lo expulsamos
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.href = 'index.html';
    return;
  }

  // --- 3. Personalización del Panel ---
  // Buscamos el lugar en el diseño donde va el nombre del usuario y lo escribimos
  const userName = document.getElementById('userName');
  if (userName) {
    userName.textContent = session.nombre || 'Usuario';
  }

  // --- 4. Aplicación de Límites (Permisos) ---
  // Verificamos si el usuario es el administrador principal
  const isAdmin = ['admin', 'administrador'].includes(session.rol.toLowerCase());
  if (!isAdmin) {
    // Si NO es admin (es Docente o Delegado), buscamos todos los botones o menús
    // marcados con 'data-admin-only' y los escondemos de la vista.
    document.querySelectorAll('[data-admin-only]').forEach(el => {
      el.style.display = 'none';
    });
  }

  // Dejamos un mensaje informativo en la consola del navegador para auditoría visual
  console.log('[Admin] Panel abierto por:', session.nombre, '(' + session.rol + ')');
});
