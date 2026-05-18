/* ================================================================
   AUTENTICACIÓN Y VALIDACIÓN DE ROL - Panel de Administración
   Verifica que el usuario tenga un rol permitido antes de acceder
================================================================ */

// const SESSION_STORAGE_KEY = 'cedSession';

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));
  } catch {
    return null;
  }
}

function isAuthenticated() {
  const session = getSession();
  return Boolean(session && session.usuario && session.rol);
}

document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();

  if (!isAuthenticated()) {
    console.warn('[Admin] No hay sesión activa.');
    window.location.href = 'index.html';
    return;
  }

  const allowedRoles = ['admin', 'administrador', 'docente', 'delegado'];
  if (!allowedRoles.includes(session?.rol?.toLowerCase())) {
    console.warn('[Admin] Acceso denegado. Rol:', session?.rol);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.href = 'index.html';
    return;
  }

  // Inyectar nombre en el header
  const userName = document.getElementById('userName');
  if (userName) {
    userName.textContent = session.nombre || 'Usuario';
  }

  // Ocultar opciones exclusivas de admin para otros roles
  const isAdmin = ['admin', 'administrador'].includes(session.rol.toLowerCase());
  if (!isAdmin) {
    document.querySelectorAll('[data-admin-only]').forEach(el => {
      el.style.display = 'none';
    });
  }

  console.log('[Admin] Panel abierto por:', session.nombre, '(' + session.rol + ')');
});
