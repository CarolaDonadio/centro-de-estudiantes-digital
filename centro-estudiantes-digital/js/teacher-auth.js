/* ================================================================
   AUTENTICACIÓN Y VALIDACIÓN DE ROL - Dashboard del Docente
   Verifica que el usuario sea docente antes de acceder
================================================================ */

const SESSION_STORAGE_KEY = 'cedSession';

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
    console.warn('[Docente] No hay sesión activa.');
    window.location.href = 'index.html';
    return;
  }

  const allowedRoles = ['docente'];
  if (!allowedRoles.includes(session?.rol?.toLowerCase())) {
    console.warn('[Docente] Acceso denegado. Rol:', session?.rol);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.href = 'index.html';
    return;
  }

  // Inyectar nombre del docente en el header
  const userName = document.getElementById('teacherName');
  if (userName) {
    userName.textContent = session.nombre || 'Docente';
  }

  console.log('[Docente] Sesión activa para:', session.nombre);
});
