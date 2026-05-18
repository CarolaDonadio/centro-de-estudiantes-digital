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

  // Inyectar nombre e identidad en el header
  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    const name = session.nombre || 'Usuario';
    userNameEl.textContent = name;

    // 1. Actualizar iniciales del avatar dinámicamente
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl && name) {
      const parts = name.split(' ');
      const initials = parts.length > 1 
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0][0].toUpperCase();
      avatarEl.textContent = initials;
    }

    // 2. Lógica de Píldora de Rol (ADMINISTRADOR, DOCENTE, DELEGADO)
    const rawRole = (session.rol || '').toLowerCase();
    const roleLabels = {
      'admin': 'ADMINISTRADOR',
      'administrador': 'ADMINISTRADOR',
      'docente': 'DOCENTE',
      'delegado': 'DELEGADO'
    };

    if (roleLabels[rawRole]) {
      const textContainer = document.querySelector('.header__text');
      // Limpiamos pill anterior si existe para evitar duplicados
      const oldPill = document.querySelector('.role-pill');
      if (oldPill) oldPill.remove();

      const pill = document.createElement('span');
      pill.className = 'role-pill';
      pill.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" stroke-linejoin="round"></path></svg>
        ${roleLabels[rawRole]}
      `;
      if (textContainer) textContainer.prepend(pill);
    }
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
