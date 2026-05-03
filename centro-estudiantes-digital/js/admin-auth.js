/* ================================================================
   AUTENTICACIÓN Y VALIDACIÓN DE ROL - Panel de Administrador
   Verifica que el usuario sea admin antes de acceder
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

  const allowedRoles = ['admin', 'administrador'];
  if (!allowedRoles.includes(session?.rol?.toLowerCase())) {
    console.warn('[Admin] Acceso denegado. Rol:', session?.rol);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.href = 'index.html';
    return;
  }

  // Inyectar nombre del admin en el header
  const userName = document.getElementById('adminName');
  if (userName) {
    userName.textContent = session.nombre || 'Administrador';
  }

  console.log('[Admin] Panel abierto por:', session.nombre);
});
