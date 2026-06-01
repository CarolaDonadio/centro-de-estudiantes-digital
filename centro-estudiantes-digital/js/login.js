const SESSION_STORAGE_KEY = 'cedSession';

// Detectamos si el HTML actual está en la carpeta /pages/
const isInPagesFolder = window.location.pathname.includes('/pages/');
const API_USERS = isInPagesFolder ? '../json/usuarios.json' : 'json/usuarios.json';

const PERFIL_MAP = {
  1: 'estudiante',
  2: 'docente',
  3: 'delegado',
  4: 'administrador'
};

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
  const prefix = isInPagesFolder ? '' : 'pages/';
  const roleMap = {
    estudiante: prefix + 'alumnos.html',
    alumno: prefix + 'alumnos.html',
    docente: prefix + 'admin.html',
    delegado: prefix + 'admin.html',
    admin: prefix + 'admin.html',
    administrador: prefix + 'admin.html',
  };
  return roleMap[rol?.toLowerCase()] || prefix + 'alumnos.html';
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

  // Lógica de Menú Hamburguesa
  const navToggle = document.getElementById('navToggle');
  const publicNav = document.querySelector('.public-nav');

  if (navToggle && publicNav) {
    navToggle.addEventListener('click', () => {
      const isOpened = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isOpened);
      publicNav.classList.toggle('public-nav--open');
      // Evitar scroll del body con el menú abierto
      document.body.style.overflow = !isOpened ? 'hidden' : '';
    });

    // Lógica de Acordeón para submenús en móvil
    const subMenuTriggers = publicNav.querySelectorAll('.public-nav__link, .submenu-title');
    subMenuTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        // Solo aplicar si el menú hamburguesa es visible (estamos en móvil)
        if (window.getComputedStyle(navToggle).display !== 'none') {
          const parent = trigger.parentElement;
          const hasSubmenu = parent.querySelector('.dropdown-content, .submenu-content');
          
          if (hasSubmenu) {
            e.preventDefault(); // Evita que el '#' recargue la página
            parent.classList.toggle('is-active');
          }
        }
      });
    });
  }

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
      
      // Cerramos el menú móvil si está abierto antes de mostrar el login
      if (publicNav && publicNav.classList.contains('public-nav--open')) {
        publicNav.classList.remove('public-nav--open');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      }

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

    if (match.activo === false) {
      showError('Tu cuenta está desactivada. Contactá al administrador.', errorMessage);
      return;
    }

    hideError(errorMessage);

    const rol = PERFIL_MAP[match.perfil_id] || 'estudiante';
    const session = {
      id: match.id,
      usuario: match.usuario,
      nombre: match.nombre,
      email: match.email,
      rol: rol,
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