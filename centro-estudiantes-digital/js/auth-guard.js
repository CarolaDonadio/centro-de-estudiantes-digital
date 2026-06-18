/* ================================================================
   AUTH GUARD - Protección de páginas para usuarios no autenticados
   Redirige a index.html si no hay sesión activa.
   Usar en páginas que requieren login pero no un rol específico.
================================================================ */

const SESSION_STORAGE_KEY = 'cedSession';

(function checkAuth() {
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));
  } catch {
    session = null;
  }

  const isAuthenticated = Boolean(session && session.usuario && session.rol);
  if (!isAuthenticated) {
    console.warn('[AuthGuard] No hay sesión activa. Redirigiendo a index.html...');
    window.location.href = '../index.html';
  }
})();
