const SESSION_STORAGE_KEY = 'cedSession';
const API_USERS = 'json/usuarios.json';

async function loadMockUsers() {
  try {
    const res = await fetch(API_USERS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[Login] No se pudo cargar usuarios mock:', err);
    return window.__FALLBACK_DATA__?.usuarios || null;
  }
}

function saveSession(user) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.log('error al guardar session', e)
  }
}

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

function getRoleDashboard(rol) {
  const roleMap = {
    estudiante: 'alumnos.html',
    alumno: 'alumnos.html',
    docente: 'admin.html',
    delegado: 'admin.html',
    admin: 'admin.html',
    administrador: 'admin.html',
  };
  return roleMap[rol?.toLowerCase()] || 'alumnos.html';
}

function showError(message, errorElement) {
  if (!errorElement) return;
  errorElement.textContent = message;
  errorElement.classList.add('is-visible');
}

function hideError(errorElement) {
  if (!errorElement) return;
  errorElement.textContent = '';
  errorElement.classList.remove('is-visible');
}

document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('loginForm');
  const loginOverlay = document.getElementById('loginOverlay');
  const openBtns = document.querySelectorAll('[data-open-login]');
  const closeBtn = document.querySelector('.login-card__close');
  const errorMessage = document.getElementById('errorMessage');
  const loginCard = document.querySelector('.login-card');

  const session = getSession();
  const users = await loadMockUsers();

  if (session) {
    if (window.location.pathname.endsWith('log.html')) {
      const dashboard = getRoleDashboard(session.rol);
      window.location.href = dashboard;
      return;
    }
  }

  // Función para abrir el modal o redirigir si ya está logueado
  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (session) {
        const dashboard = getRoleDashboard(session.rol);
        window.location.href = dashboard;
        return;
      }
      if (!loginOverlay) return;
      loginOverlay.classList.add('is-open');
      document.body.style.overflow = 'hidden'; // Evita el scroll del fondo
    });
  });

  // Función para cerrar el modal
  const closeLogin = () => {
    if (loginOverlay) {
      loginOverlay.classList.remove('is-open');
    }
    document.body.style.overflow = '';
    hideError(errorMessage);
    if (loginForm) loginForm.reset();
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLogin);
  }

  if (loginOverlay) {
    loginOverlay.addEventListener('click', (e) => {
      if (e.target === loginOverlay) closeLogin();
    });
  }

  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (!user || !pass) {
      showError('Por favor completá usuario y contraseña.', errorMessage);
      return;
    }

    if (!users) {
      showError('No se pudieron cargar los datos de usuario. Intentá de nuevo más tarde.', errorMessage);
      return;
    }

    const match = users.find(u => u.usuario === user && u.password === pass);
    if (!match) {
      showError('Usuario o contraseña incorrectos. Por favor, intente de nuevo.', errorMessage);
      return;
    }

    hideError(errorMessage);

    const session = {
      usuario: match.usuario,
      nombre: match.nombre,
      rol: match.rol,
      loggedAt: new Date().toISOString(),
    };
    saveSession(session);

    loginCard.classList.add('is-success');

    setTimeout(() => {
      const dashboard = getRoleDashboard(session.rol);
      window.location.href = dashboard;
    }, 900);
  });
});