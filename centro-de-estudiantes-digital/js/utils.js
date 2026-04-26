/*=====================FUNCIONES_AUXILIARES=====================*/

function getBasePath() {
  return window.location.pathname.includes("/pages/") ? "../" : "";
}

/* ================= NAVBAR ================= */
/*function renderNavbar() {
  const base = getBasePath();
  const user = JSON.parse(localStorage.getItem("user"));

  const nav = document.getElementById("navbar");
  if (!nav) return;

  nav.innerHTML = `
  <nav class="ce-navbar" role="navigation" aria-label="Navegación principal">
    <div class="container d-flex justify-content-between align-items-center">
        <a href="${base}index.html" class="brand-text">
            <!-- Ícono libro — forma inconfundible, no depende del color -->
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect x="2" y="4" width="12" height="20" rx="2" fill="#E6A817"/>
                <rect x="14" y="4" width="12" height="20" rx="2" fill="rgba(255,255,255,0.25)"/>
                <rect x="13" y="4" width="2" height="20" fill="#003366"/>
                <rect x="5" y="9" width="6" height="1.5" rx="0.75" fill="#003366"/>
                <rect x="5" y="12" width="6" height="1.5" rx="0.75" fill="#003366"/>
                <rect x="5" y="15" width="4" height="1.5" rx="0.75" fill="#003366"/>
            </svg>
            Centro de Estudiantes
        </a>

        <div class="d-flex align-items-center gap-3">
            <ul class="d-none d-md-flex list-unstyled mb-0 gap-4" style="color:rgba(255,255,255,0.75); font-size:0.88rem;">
                <li><a href="${base}index.html" style="color:rgba(255,255,255,0.75); text-decoration:none;" aria-label="Inicio">Inicio</a></li>
                <li><a href="${base}pages/novedades.html" style="color:rgba(255,255,255,0.75); text-decoration:none;">Novedades</a></li>
                <li><a href="${base}pages/eventos.html" style="color:rgba(255,255,255,0.75); text-decoration:none;">Eventos</a></li>
                <li><a href="${base}pages/calendario.html" style="color:rgba(255,255,255,0.75); text-decoration:none;">Calendario</a></li>
                <li><a href="${base}pages/reglamentos.html" style="color:rgba(255,255,255,0.75); text-decoration:none;">Reglamento</a></li>
            </ul>

            <!-- Botón de login — forma rectangular + ícono de candado + texto -->
            <a href="${base}pages/login.html" class="btn-login" role="button" aria-label="Iniciar sesión en el portal">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <rect x="3" y="6" width="8" height="7" rx="1.5" stroke="#003366" stroke-width="1.5" fill="none"/>
                    <path d="M5 6V4.5a2 2 0 0 1 4 0V6" stroke="#003366" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                    <circle cx="7" cy="9.5" r="1" fill="#003366"/>
                </svg>
                Iniciar sesión
            </a>
        </div>
    </div>
  </nav>
  `;
}*/

function renderNavbar() {
  const base = getBasePath();

  const nav = document.getElementById("navbar");
  if (!nav) return;

  nav.innerHTML = `
  <nav class="ce-navbar">
    <div class="container">

      <!-- FILA SUPERIOR -->
      <div class="d-flex justify-content-between align-items-center">

        <!-- LOGO -->
        <a href="${base}index.html" class="brand-text">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="4" width="12" height="20" rx="2" fill="#E6A817"/>
            <rect x="14" y="4" width="12" height="20" rx="2" fill="rgba(255,255,255,0.25)"/>
            <rect x="13" y="4" width="2" height="20" fill="#003366"/>
            <rect x="5" y="9" width="6" height="1.5" rx="0.75" fill="#003366"/>
            <rect x="5" y="12" width="6" height="1.5" rx="0.75" fill="#003366"/>
            <rect x="5" y="15" width="4" height="1.5" rx="0.75" fill="#003366"/>
          </svg>
          Centro de Estudiantes
        </a>

        <!-- BOTÓN -->
        <button class="navbar-toggler d-md-none" type="button"
          data-bs-toggle="collapse" data-bs-target="#menuNav">
          <span style="color:white; font-size:1.6rem;">☰</span>
        </button>

        <!-- DESKTOP MENU -->
        <div class="d-none d-md-flex align-items-center gap-3">

          <ul class="list-unstyled mb-0 d-flex gap-4">
            <li><a href="${base}index.html" class="nav-link-ce">Inicio</a></li>
            <li><a href="${base}pages/novedades.html" class="nav-link-ce">Novedades</a></li>
            <li><a href="${base}pages/eventos.html" class="nav-link-ce">Eventos</a></li>
            <li><a href="${base}pages/calendario.html" class="nav-link-ce">Calendario</a></li>
            <li><a href="${base}pages/reglamentos.html" class="nav-link-ce">Reglamento</a></li>
          </ul>

          <a href="${base}pages/login.html" class="btn-login">
            Iniciar sesión
          </a>

        </div>

      </div>

      <!-- MOBILE MENU -->
      <div class="collapse d-md-none mt-3" id="menuNav">
        <ul class="list-unstyled d-flex flex-column gap-3">

          <li><a href="${base}index.html" class="nav-link-ce">Inicio</a></li>
          <li><a href="${base}pages/novedades.html" class="nav-link-ce">Novedades</a></li>
          <li><a href="${base}pages/eventos.html" class="nav-link-ce">Eventos</a></li>
          <li><a href="${base}pages/calendario.html" class="nav-link-ce">Calendario</a></li>
          <li><a href="${base}pages/reglamentos.html" class="nav-link-ce">Reglamento</a></li>

          <li>
            <a href="${base}pages/login.html" class="btn-login btn-login-mobile">
              Iniciar sesión
            </a>
          </li>

        </ul>
      </div>

    </div>
  </nav>
  `;
}

/* ================= FOOTER ================= */
function renderFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;
  const base = getBasePath();

  footer.innerHTML = `
    <footer class="ce-footer">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4">
          <p class="footer-brand">Centro de Estudiantes</p>
          <p>Representando a los estudiantes de nuestro instituto. Gestión democrática y participatión digital.</p>
          <p class="mt-2" style="color:rgba(255,255,255,0.5); font-size:0.8rem;"> Consejo Academico Institucional: · Lunes de 20 a 21hs</p>
        </div>
        
        <div class="col-md-2 offset-md-1">
          <p style="color:white; font-weight:700; font-size:0.85rem; margin-bottom:0.75rem;">Navegación</p>
          <ul class="list-unstyled" style="font-size:0.83rem;">
            <li class="mb-1"><a href="${base}index.html">Inicio</a></li>
            <li class="mb-1"><a href="${base}pages/novedades.html">Noticias</a></li>
            <li class="mb-1"><a href="${base}pages/eventos.html">Eventos</a></li>
            <li class="mb-1"><a href="${base}pages/calendario.html">Calendario</a></li>
            <li class="mb-1"><a href="${base}pages/reglamentos.html">Reglamento</a></li>
        </ul>
      </div>
      <div class="col-md-2">
        <p style="color:white; font-weight:700; font-size:0.85rem; margin-bottom:0.75rem;">Acceso rápido</p>
        <ul class="list-unstyled" style="font-size:0.83rem;">
          <li class="mb-1"><a href="${base}pages/login.html">Portal estudiante</a></li>
          <li class="mb-1"><a href="${base}pages/novedades.html">Becas</a></li>
          <li class="mb-1"><a href="${base}pages/eventos.html">Actividades</a></li>
          <li class="mb-1"><a href="${base}pages/reglamentos.html">Reglamento</a></li>
        </ul>
      </div>
      <div class="col-md-3">
        <p style="color:white; font-weight:700; font-size:0.85rem; margin-bottom:0.75rem;">Accesibilidad</p>
        <p style="font-size:0.82rem;">
          Este sitio está diseñado para ser accesible a personas con daltonismo y otras condiciones visuales.
        </p>
        <div class="accessibility-note mt-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="5" stroke="#E6A817" stroke-width="1.2"/>
            <circle cx="6" cy="4" r="1" fill="#E6A817"/>
            <rect x="5.25" y="6" width="1.5" height="3" rx="0.75" fill="#E6A817"/>
          </svg>
          Diseño accesible WCAG 2.1 AA
        </div>
      </div>
     </div>
     <hr />
     <div class="d-flex flex-wrap justify-content-between align-items-center gap-2" style="font-size:0.78rem;">
      <span>© 2026 Centro de Estudiantes · Todos los derechos reservados</span>
      <span>Hecho con compromiso estudiantil</span>
      </div>
      </div>
    </footer>
  `;
}