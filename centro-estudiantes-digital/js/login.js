// La "llave" con la que guardaremos los datos del usuario en la memoria del navegador
const SESSION_STORAGE_KEY = 'cedSession';

// Como el JS se usa tanto en la landing (raíz) como en el panel (carpeta /pages/),
// necesitamos saber dónde estamos para encontrar el archivo de usuarios correctamente.
const isInPagesFolder = window.location.pathname.includes('/pages/');
const API_USERS = isInPagesFolder ? '../json/usuarios.json' : 'json/usuarios.json';

// Diccionario para convertir los números que vienen de la base de datos (ID de perfil)
// en palabras que el código entienda más fácil.
const PERFIL_MAP = {
  1: 'estudiante',
  2: 'docente',
  3: 'delegado',
  4: 'administrador'
};

// Función que va a buscar el archivo JSON de usuarios (nuestra base de datos de mentira)
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

// Guarda el objeto del usuario en el "Local Storage" (memoria permanente del navegador)
function saveSession(user) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.log('error al guardar session', e)
  }
}

// Lee la memoria del navegador para ver si hay alguien logueado
function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));
  } catch {
    return null;
  }
}

// Devuelve "true" si hay un usuario válido en la sesión
function isAuthenticated() {
  const session = getSession();
  return Boolean(session && session.usuario && session.rol);
}

// Decide a qué página mandarte según tu trabajo (Rol)
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

// Muestra el cartelito rojo de error en el modal de login
function showError(message, errorElement) {
  if (!errorElement) return;
  errorElement.textContent = message;
  errorElement.classList.add('is-visible');
}

// Borra el mensaje de error
function hideError(errorElement) {
  if (!errorElement) return;
  errorElement.textContent = '';
  errorElement.classList.remove('is-visible');
}

// Aquí empieza la acción cuando la página termina de cargar
document.addEventListener('DOMContentLoaded', async () => {
  // --- 1. Referencias a elementos del HTML ---
  const loginForm = document.getElementById('loginForm');
  const loginOverlay = document.getElementById('loginOverlay');
  const openBtns = document.querySelectorAll('[data-open-login]');
  const closeBtn = document.querySelector('.login-card__close');
  const errorMessage = document.getElementById('errorMessage');
  const loginCard = document.querySelector('.login-card');

  // --- 2. Carga inicial de datos ---
  const session = getSession();
  const users = await loadMockUsers(); // Traemos la lista de usuarios del JSON

  // --- 3. Lógica del Menú Hamburguesa (Móvil) ---
  const navToggle = document.getElementById('navToggle');
  const publicNav = document.querySelector('.public-nav');

  if (navToggle && publicNav) {
    // Cuando haces clic en las 3 rayitas
    navToggle.addEventListener('click', () => {
      const isOpened = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isOpened);
      publicNav.classList.toggle('public-nav--open');
      // Evitar scroll del body con el menú abierto
      document.body.style.overflow = !isOpened ? 'hidden' : '';
    });

    // Para que los submenús (Instituto, Académico) se abran al tocar en el cel
    const subMenuTriggers = publicNav.querySelectorAll('.public-nav__link, .submenu-title');
    subMenuTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        if (window.getComputedStyle(navToggle).display !== 'none') {
          const parent = trigger.parentElement;
          const hasSubmenu = parent.querySelector('.dropdown-content, .submenu-content');
          
          if (hasSubmenu) {
            e.preventDefault(); // Evita que el link navegue, solo queremos abrir el menú
            parent.classList.toggle('is-active');
          }
        }
      });
    });
  }

  // Si ya estás logueado y entras a la página de login, te redirigimos directo al panel
  if (session) {
    if (window.location.pathname.endsWith('log.html')) {
      const dashboard = getRoleDashboard(session.rol);
      window.location.href = dashboard;
      return;
    }
  }

  // --- 4. Abrir el Modal de Login ---
  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Si ya estás logueado, los botones de "Ingresar" te llevan directo adentro
      if (session) {
        const dashboard = getRoleDashboard(session.rol);
        window.location.href = dashboard;
        return;
      }
      
      if (!loginOverlay) return;
      
      // Si el menú hamburguesa estaba abierto, lo cerramos para que no moleste
      if (publicNav && publicNav.classList.contains('public-nav--open')) {
        publicNav.classList.remove('public-nav--open');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      }

      loginOverlay.classList.add('is-open'); // Esta clase CSS es la que hace aparecer el modal
      document.body.style.overflow = 'hidden'; // Evita el scroll del fondo
    });
  });

  // --- 5. Cerrar el Modal ---
  const closeLogin = () => {
    if (loginOverlay) {
      loginOverlay.classList.remove('is-open'); // Quitamos la clase y el modal desaparece
    }
    document.body.style.overflow = '';
    hideError(errorMessage);
    if (loginForm) loginForm.reset();
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLogin);
  }

  // Cerrar si haces clic afuera de la tarjetita blanca (en el fondo borroso)
  if (loginOverlay) {
    loginOverlay.addEventListener('click', (e) => {
      if (e.target === loginOverlay) closeLogin();
    });
  }

  if (!loginForm) return;

  // --- 6. El momento del Login (Submit del formulario) ---
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se refresque

    // Obtenemos lo que escribió el usuario
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    // Validaciones básicas antes de buscar
    if (!user || !pass) {
      showError('Por favor completá usuario y contraseña.', errorMessage);
      return;
    }

    if (!users) {
      showError('No se pudieron cargar los datos de usuario. Intentá de nuevo más tarde.', errorMessage);
      return;
    }

    // Buscamos si existe alguien con ese usuario Y esa contraseña
    const match = users.find(u => u.usuario === user && u.password === pass);
    if (!match) {
      showError('Usuario o contraseña incorrectos. Por favor, intente de nuevo.', errorMessage);
      return;
    }

    // Si lo encontramos pero el administrador lo desactivó
    if (match.activo === false) {
      showError('Tu cuenta está desactivada. Contactá al administrador.', errorMessage);
      return;
    }

    hideError(errorMessage);

    // Preparamos los datos de la sesión (la "mochila" que el usuario llevará por el sitio)
    const rol = PERFIL_MAP[match.perfil_id] || 'estudiante';
    const session = {
      id: match.id,
      usuario: match.usuario,
      nombre: match.nombre,
      email: match.email,
      rol: rol,
      loggedAt: new Date().toISOString(),
    };
    saveSession(session); // Lo guardamos en la memoria del navegador

    loginCard.classList.add('is-success'); // Activa el check verde y animaciones de éxito

    // Esperamos un poquito (900ms) para que el usuario vea el éxito y luego lo mandamos adentro
    setTimeout(() => {
      const dashboard = getRoleDashboard(session.rol);
      window.location.href = dashboard;
    }, 900);
  });
});