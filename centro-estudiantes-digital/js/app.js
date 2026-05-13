/* ================================================================
   PROYECTO: Centro de Estudiantes Digital - ISFDyT 57
   ARCHIVO:  app.js
   FASE 1 - Sprint 3: Consumo de API Mock (JSON)
   FASE 1 - Sprint 4: Calendario interactivo + filtros
   FASE 1 - Sprint 5: Formularios con validación
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   0. CONFIGURACIÓN - Rutas a la API Mock
      En producción (Fase 2) se cambiará por el endpoint REST de CI4.
---------------------------------------------------------------- */
const API = {
  usuario:         'json/usuario.json',
  novedades:       'json/novedades.json',
  eventos:         'json/eventos.json',
  calendario:      'json/calendario.json',
  reglamentacion:  'json/reglamentacion.json',
  notificaciones:  'json/notificaciones.json',
};

/* ----------------------------------------------------------------
   1. HELPERS (utilidades genéricas)
---------------------------------------------------------------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Wrapper fetch con manejo de errores y fallback a datos inline.
 * Útil para cuando se abre el HTML con protocolo file:// (sin servidor).
 */
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err) {
    console.warn(`[API Mock] No se pudo cargar ${url}. Verificá que estés corriendo un servidor local.`, err);
    // Devolvemos el fallback desde window si existe (por si no hay servidor)
    const key = url.replace('json/', '').replace('.json', '');
    return window.__FALLBACK_DATA__?.[key] || null;
  }
}

/**
 * Lee el perfil activo desde localStorage.
 * Prioridad: 'perfil_activo' (override manual) → sesión cedSession → fallback 'alumno'.
 */
function getPerfilActivo() {
  const override = localStorage.getItem('perfil_activo');
  if (override) return override.toLowerCase();
  const session = JSON.parse(localStorage.getItem('cedSession') || 'null');
  return (session?.rol || state.usuario?.perfil || 'alumno').toLowerCase();
}

/** Formatea una fecha ISO a "dd MMM" en español. */
function formatDay(isoDate) {
  const d = new Date(isoDate);
  const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  return { dia: d.getDate(), mes: meses[d.getMonth()] };
}

/** Formatea "hace X tiempo" para novedades */
function timeAgo(isoDate) {
  const d = new Date(isoDate);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 3600)   return `hace ${Math.floor(diff / 60)}min`;
  if (diff < 86400)  return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString('es-AR');
}

/** Devuelve un color "soft" a partir de un hex (para fondo de chips) */
function softColor(hex, alpha = 0.14) {
  const h = hex.replace('#','');
  const r = parseInt(h.substr(0,2), 16);
  const g = parseInt(h.substr(2,2), 16);
  const b = parseInt(h.substr(4,2), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ----------------------------------------------------------------
   2. ESTADO GLOBAL DE LA APP
---------------------------------------------------------------- */
const state = {
  usuario: null,
  novedades: null,
  eventos: null,
  calendario: null,
  reglamentacion: null,
  filtroNovedad: 'todas',
  reglamentacionQuery: '',
  reglamentacionType: 'todas',
  reglamentacionCategory: 'todas',
  calendarioMes: null,        // Date actual mostrada en el drawer
  calendarioFiltro: 'todos',  // Filtro de eventos del calendario

  // Set con los IDs de eventos a los que el usuario se inscribió.
  // Se mantiene en memoria; en Fase 2 se persistirá en BD vía API REST.
  inscripciones: new Set(),

  // Si la sección "Próximos Eventos" está expandida (mostrando todos)
  eventosExpanded: false,

  // Drawer actualmente abierto (null si no hay)
  drawerActivo: null,

  // Notificaciones
  notificaciones: null,
  notifPanelOpen: false,
};

/* ----------------------------------------------------------------
   3. INICIALIZACIÓN
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Cargamos todo en paralelo desde la "API Mock"
  const [usuario, novedades, eventos, calendario, reglamentacion, notificaciones] = await Promise.all([
    fetchJSON(API.usuario),
    fetchJSON(API.novedades),
    fetchJSON(API.eventos),
    fetchJSON(API.calendario),
    fetchJSON(API.reglamentacion),
    fetchJSON(API.notificaciones),
  ]);

  Object.assign(state, { usuario, novedades, eventos, calendario, reglamentacion, notificaciones });

  // Renderizamos las secciones del dashboard
  renderUserHeader();
  renderCareerCard();
  renderEvents();
  renderNewsFilters();
  renderNewsList();
  renderReglamentacion();

  // Bindeamos los eventos de UI
  bindNavigation();
  bindDrawerControls();
  bindNotifications();
  bindReglamentacionSearch();
}

/* ----------------------------------------------------------------
   4. RENDER: Header + Saludo
---------------------------------------------------------------- */
function renderUserHeader() {
  const u = state.usuario;
  if (!u) return;

  const session = JSON.parse(localStorage.getItem('cedSession'));
  $('#userName').textContent = session?.nombre || u.nombre;
  $('#userAvatar').textContent = u.avatar;

  const resumen =
    `Tenés ${u.clases_hoy} clases hoy, ${u.notificaciones_sin_leer} notificaciones sin leer y ${u.eventos_semana} eventos del CE esta semana.`;
  $('#userSummary').textContent = resumen;

  $('#bellBadge').textContent = u.notificaciones_sin_leer;
}

/* ----------------------------------------------------------------
   5. RENDER: Tarjeta de Carrera
---------------------------------------------------------------- */
function renderCareerCard() {
  const u = state.usuario;
  if (!u) return;

  $('#userCareer').textContent = u.carrera;
  $('#materiasAprobadas').textContent = String(u.materias_cursadas).padStart(2,'0');
  $('#materiasTotales').textContent = u.materias_totales;

  // Próxima fecha académica
  if (u.proximas_fechas?.length) {
    const prox = u.proximas_fechas[0];
    $('#proximaFecha').textContent = `${prox.fecha} · ${prox.materia}`;
    $('#proximaTipo').textContent = prox.tipo;
  }

  // Animación de la barra de progreso
  const pct = (u.materias_cursadas / u.materias_totales) * 100;
  requestAnimationFrame(() => {
    $('#careerProgress').style.width = pct + '%';
  });
}

/* ----------------------------------------------------------------
   6. RENDER: Eventos CE
      - Por defecto muestra los 2 más próximos.
      - Botón "Mostrar todo" expande para ver todos.
      - Cada tarjeta tiene su botón "Inscribirme" funcional, con estado.
---------------------------------------------------------------- */
function renderEvents() {
  const cont    = $('#eventsContainer');
  const actions = $('#eventsActions');
  const lista   = state.eventos?.eventos || [];

  // Ordenamos por fecha (más próximos primero)
  const ordenados = [...lista].sort(
    (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
  );

  // Cuántos mostrar según el estado de expansión
  const visibles = state.eventosExpanded ? ordenados : ordenados.slice(0, 2);

  // Render de las tarjetas
  cont.classList.toggle('events-grid--expanded', state.eventosExpanded);
  cont.innerHTML = visibles.map(ev => buildEventCardHTML(ev)).join('');

  // Footer con el toggle "Mostrar todo / Mostrar menos"
  // Solo aparece si hay más de 2 eventos en total.
  if (ordenados.length > 2) {
    actions.innerHTML = `
      <button class="events-toggle ${state.eventosExpanded ? 'is-expanded' : ''}" id="eventsToggle">
        <span>${state.eventosExpanded ? 'Mostrar menos' : `Mostrar todo (${ordenados.length})`}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;
    $('#eventsToggle').addEventListener('click', () => {
      state.eventosExpanded = !state.eventosExpanded;
      renderEvents();
    });
  } else {
    actions.innerHTML = '';
  }

  // Bindeo: click en el botón "Inscribirme" de cada tarjeta
  $$('.event-card__cta', cont).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();              // que no abra el drawer
      const id = Number(btn.dataset.eventId);
      inscribirseEvento(id);
    });
  });

  // Click en el cuerpo de la tarjeta abre el drawer del Centro Estudiantil (gestiona eventos)
  $$('.event-card', cont).forEach(el => {
    el.addEventListener('click', () => openDrawer('centro'));
  });
}

/**
 * Genera el HTML de una tarjeta individual de evento.
 * Reflejá si el usuario ya está inscripto (state.inscripciones)
 * o si el cupo está completo.
 */
function buildEventCardHTML(ev) {
  const { dia, mes } = formatDay(ev.fecha_inicio);
  const inscripto = state.inscripciones.has(ev.id);
  const lleno     = ev.inscriptos >= ev.cupo;

  // Construimos el botón según el estado:
  let cta;
  if (inscripto) {
    cta = `
      <button class="event-card__cta event-card__cta--done" disabled>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Inscripto
      </button>`;
  } else if (lleno) {
    cta = `
      <button class="event-card__cta event-card__cta--full" disabled>
        Sin cupo
      </button>`;
  } else {
    cta = `
      <button class="event-card__cta" data-event-id="${ev.id}">
        Inscribirme
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>`;
  }

  return `
    <article class="event-card" style="--event-color: ${ev.color}" data-event-id="${ev.id}">
      <span class="event-card__cupo">${ev.inscriptos}/${ev.cupo}</span>
      <span class="event-card__category">${ev.categoria}</span>

      <div class="event-card__head">
        <div class="event-card__date-box">
          <span class="event-card__month">${mes}</span>
          <span class="event-card__date">${dia}</span>
        </div>
        <h3 class="event-card__title">${ev.titulo}</h3>
      </div>

      <p class="event-card__meta">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        ${ev.lugar}
      </p>

      <div class="event-card__foot">${cta}</div>
    </article>
  `;
}

/**
 * Lógica central de inscripción a un evento.
 * Actualiza el estado y refresca todas las vistas que muestren eventos.
 */
function inscribirseEvento(id) {
  const ev = state.eventos.eventos.find(x => x.id === id);
  if (!ev || state.inscripciones.has(id) || ev.inscriptos >= ev.cupo) return;

  // Actualizamos el modelo
  ev.inscriptos++;
  state.inscripciones.add(id);

  // Refrescamos la home y, si está abierto el drawer del centro, también lo actualizamos
  renderEvents();
  if (state.drawerActivo === 'centro') {
    renderCentro($('#drawerBody'));
  }
}

/* ----------------------------------------------------------------
   7. RENDER: Novedades (Feed) + Filtros por categoría
---------------------------------------------------------------- */
function renderNewsFilters() {
  const cont = $('#newsFilters');
  const cats = state.novedades?.categorias || [];

  // El "Todas" ya está hardcodeado, agregamos el resto dinámicamente
  cats.forEach(c => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.dataset.filter = c.id;
    chip.textContent = c.nombre;
    chip.addEventListener('click', () => {
      state.filtroNovedad = String(c.id);
      $$('.chip', cont).forEach(x => x.classList.remove('chip--active'));
      chip.classList.add('chip--active');
      renderNewsList();
    });
    cont.appendChild(chip);
  });

  // Bindeamos el chip "Todas"
  $('[data-filter="todas"]').addEventListener('click', (e) => {
    state.filtroNovedad = 'todas';
    $$('.chip', cont).forEach(x => x.classList.remove('chip--active'));
    e.currentTarget.classList.add('chip--active');
    renderNewsList();
  });
}

function renderNewsList() {
  const cont = $('#newsList');
  const novedades = state.novedades?.novedades || [];
  const categorias = state.novedades?.categorias || [];

  // Filtrado
  let lista = [...novedades];
  if (state.filtroNovedad !== 'todas') {
    lista = lista.filter(n => String(n.categoria_id) === state.filtroNovedad);
  }

  // Ordenar por destacada + fecha
  lista.sort((a,b) => {
    if (a.destacada !== b.destacada) return b.destacada - a.destacada;
    return new Date(b.fecha) - new Date(a.fecha);
  });

  if (!lista.length) {
    cont.innerHTML = `
      <div style="text-align:center; padding:30px; color:var(--text-muted); font-size:13px;">
        No hay novedades en esta categoría todavía.
      </div>
    `;
    return;
  }

  cont.innerHTML = lista.map(n => {
    const cat = categorias.find(c => c.id === n.categoria_id) || { color:'#2563eb' };
    const destacadaCls = n.destacada ? ' news-item--featured' : '';
    const star = n.destacada ? '<span class="news-item__star">★ DESTACADA</span>' : '';
    const adjunto = n.adjunto ? `
      <div class="news-item__attach">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11l-9 9a5 5 0 0 1-7-7l10-10a3 3 0 0 1 4 4L9 17a1 1 0 0 1-2-2l8-8"/>
        </svg>
        ${n.adjunto}
      </div>` : '';

    return `
      <article class="news-item${destacadaCls}"
               style="--news-color:${cat.color}; --news-color-soft:${softColor(cat.color)}">
        <div class="news-item__stripe" style="background:${cat.color}"></div>
        <div class="news-item__content">
          <div class="news-item__meta">
            <span class="news-item__category">${n.categoria}</span>
            <span class="news-item__date">${timeAgo(n.fecha)}</span>
            ${star}
          </div>
          <h3 class="news-item__title">${n.titulo}</h3>
          <p class="news-item__excerpt">${n.contenido}</p>
          ${adjunto}
        </div>
      </article>
    `;
  }).join('');
}

function buildNormativaItem(doc) {
  return `
    <article class="doc-item">
      <div>
        <h3>${doc.titulo}</h3>
        <p>${doc.descripcion}</p>
      </div>
      <a class="btn btn-secondary" href="${doc.link || '#'}" target="_blank" rel="noopener noreferrer" aria-label="Ver documento ${doc.titulo}">VER DOCUMENTO</a>
    </article>
  `;
}

function bindReglamentacionSearch() {
  const searchInput = $('#reglamentacionSearch');
  const categoryButtons = $$('.search-categories .chip');
  const typeButtons = $$('.tabs .chip');

  if (!searchInput || !categoryButtons.length) return;

  searchInput.addEventListener('input', (event) => {
    state.reglamentacionQuery = event.target.value;
    renderReglamentacion();
  });

  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.reglamentacionCategory = btn.dataset.filterCategory;
      categoryButtons.forEach(x => x.classList.remove('chip--active'));
      btn.classList.add('chip--active');
      renderReglamentacion();
    });
  });

  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.reglamentacionType = btn.dataset.filterType;
      typeButtons.forEach(x => x.classList.remove('chip--active'));
      btn.classList.add('chip--active');
      renderReglamentacion();
    });
  });
}

function getReglamentacionFiltered() {
  const query = state.reglamentacionQuery.trim().toLowerCase();
  const category = state.reglamentacionCategory;
  const type = state.reglamentacionType;
  const docs = state.reglamentacion?.documentos || [];

  return docs.filter(doc => {
    const typeMatch = type === 'todas' || String(doc.tipo).toLowerCase() === type;
    if (!typeMatch) return false;

    const categoryMatch = category === 'todas' || String(doc.categoria).toLowerCase() === category;
    if (!categoryMatch) return false;

    if (!query) return true;

    const searchable = [
      doc.titulo,
      doc.descripcion,
      ...(doc.palabras_clave || []),
      doc.categoria || '',
    ].join(' ').toLowerCase();
    return searchable.includes(query);
  });
}

function renderReglamentacion() {
  const cont = $('#reglamentacionList');
  if (!cont) return;

  const lista = getReglamentacionFiltered();
  if (!lista.length) {
    cont.innerHTML = `
      <div style="text-align:center; padding:30px; color:var(--text-muted); font-size:13px;">
        No se encontraron normativas con esos filtros.
      </div>
    `;
    return;
  }

  cont.innerHTML = lista.map(buildNormativaItem).join('');
}

function bindDrawerControls() {
  $('#drawerClose').addEventListener('click', closeDrawer);
  $('#drawerOverlay').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

/* ----------------------------------------------------------------
   9. DRAWER LATERAL - abrir/cerrar + contenido dinámico por sección
---------------------------------------------------------------- */
function openDrawer(type) {
  const drawer  = $('#drawer');
  const overlay = $('#drawerOverlay');
  const title   = $('#drawerTitle');
  const icon    = $('#drawerIcon');
  const body    = $('#drawerBody');

  const config = {
    perfil:         { title: 'Mi Perfil',           icon: iconUser,      render: renderProfile       },
    materias:       { title: 'Mis Materias',        icon: iconBook,      render: renderMaterias      },
    inscripciones:  { title: 'Mis Inscripciones',   icon: iconInscript,  render: renderInscripciones },
    carrera:        { title: 'Mi Carrera',          icon: iconCareer,    render: renderCarrera       },
    centro:         { title: 'Centro Estudiantil',  icon: iconStar,      render: renderCentro        },
    calendario:     { title: 'Calendario Académico',icon: iconCalendar,  render: renderCalendar      },
    eventos:        { title: 'Eventos',             icon: iconEvents,  render: renderEventos       },
  };

  const cfg = config[type];
  if (!cfg) return;

  // Marcamos cuál drawer está activo (para refrescos cruzados como inscripciones)
  state.drawerActivo = type;

  // Feedback visual: marcar como activo el botón del sidebar correspondiente
  $$('.nav-btn').forEach(b => b.classList.remove('nav-btn--active'));
  const btnActivo = $(`.nav-btn[data-drawer="${type}"]`);
  if (btnActivo) btnActivo.classList.add('nav-btn--active');

  title.textContent = cfg.title;
  icon.innerHTML = cfg.icon;
  body.innerHTML = '';    // limpia contenido previo
  cfg.render(body);

  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.classList.add('is-open');

  // Deshabilita scroll del body mientras drawer está abierto
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  $('#drawer').classList.remove('is-open');
  $('#drawer').setAttribute('aria-hidden', 'true');
  $('#drawerOverlay').classList.remove('is-open');
  document.body.style.overflow = '';

  // Limpiar estado activo
  state.drawerActivo = null;
  $$('.nav-btn').forEach(b => b.classList.remove('nav-btn--active'));
}

/* ----------------------------------------------------------------
   10. ÍCONOS del header del drawer (SVG inline)
---------------------------------------------------------------- */
const iconUser = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke-linecap="round"/>
  </svg>`;

const iconBook = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>`;

const iconInscript = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M9 14l2 2 4-4" />
  </svg>`;

const iconCareer = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>`;

const iconStar = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M12 2l2.6 5.3 5.9.9-4.3 4.2 1 5.8L12 15.5 6.8 18.2l1-5.8L3.5 8.2l5.9-.9z"/>
  </svg>`;

const iconDoc = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M6 3h9l5 5v13H6z"/>
    <path d="M15 3v5h5"/>
  </svg>`;

const iconLogout = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <path d="M10 17l5-5-5-5M15 12H3" stroke-linecap="round"/>
  </svg>`;

const iconCalendar = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke-linecap="round" />
  </svg>`;

const iconEvents = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>`;

/* ----------------------------------------------------------------
   11. DRAWER: PERFIL
---------------------------------------------------------------- */
function renderProfile(body) {
  const u = state.usuario;
  body.innerHTML = `
    <div class="profile-hero">
      <div class="profile-hero__avatar-wrap">
        <div class="profile-hero__avatar">${u.avatar}</div>
        <button class="profile-hero__edit-btn" title="Cambiar foto">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
             <circle cx="12" cy="13" r="4"/>
           </svg>
        </button>
      </div>
      <div class="profile-hero__name">${u.nombre}</div>
      <div class="profile-hero__email">${u.email}</div>
      <span class="profile-hero__role">${u.perfil}</span>
    </div>

    <div class="profile-data">
      <div class="profile-data__item">
        <div class="profile-data__label">Legajo</div>
        <div class="profile-data__value">${u.legajo}</div>
      </div>
      <div class="profile-data__item">
        <div class="profile-data__label">DNI</div>
        <div class="profile-data__value">${u.dni}</div>
      </div>
      <div class="profile-data__item">
        <div class="profile-data__label">Inscripto</div>
        <div class="profile-data__value">${u.cohorte}</div>
      </div>
      <div class="profile-data__item">
        <div class="profile-data__label">Estado</div>
        <div class="profile-data__value" style="color:var(--accent-green)">${u.activo ? 'Activo' : 'Inactivo'}</div>
      </div>
      <div class="profile-data__item" style="grid-column: 1 / -1;">
        <div class="profile-data__label">Carrera</div>
        <div class="profile-data__value">${u.carrera}</div>
      </div>
      <div class="profile-data__item" style="grid-column: 1 / -1;">
        <div class="profile-data__label">Progreso académico</div>
        <div class="profile-data__value">${u.materias_cursadas} / ${u.materias_totales} materias</div>
        <div class="progress" style="margin-top:8px; width:100%;">
          <div class="progress__fill" style="width: ${(u.materias_cursadas / u.materias_totales) * 100}%"></div>
        </div>
      </div>
      <div style="grid-column: 1 / -1; margin-top: 14px;">
        <button class="btn-primary" style="width: 100%;">Cambiar Contraseña</button>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   12. DRAWER: MIS MATERIAS
---------------------------------------------------------------- */
function renderMaterias(body) {
  const materias = [
    { nombre: 'Análisis Matemático I',  docente: 'Ing. García',  dias: ['Lun', 'Mié'], hora: '18–21hs', color: '#2563eb', nota: null,  estado: 'Cursando' },
    { nombre: 'Programación I',         docente: 'Lic. Chaves',  dias: ['Mar', 'Jue'], hora: '19–22hs', color: '#06b6d4', nota: 7,     estado: 'Cursando' },
    { nombre: 'Álgebra Lineal',         docente: 'Prof. Rossi',  dias: ['Vie'],        hora: '18–22hs', color: '#3DAA6A', nota: 8,     estado: 'Cursando' },
    { nombre: 'Sistemas Operativos',    docente: 'Ing. Torres',  dias: ['Mié'],        hora: '19–22hs', color: '#3b82f6', nota: null,  estado: 'Cursando' },
    { nombre: 'Lógica Computacional',   docente: 'Dr. López',    dias: ['Lun'],        hora: '19–22hs', color: '#0ea5e9', nota: 6,     estado: 'Cursando' },
  ];

  body.innerHTML = `
    <p class="drawer-section-label">1er Cuatrimestre 2026 · ${materias.length} materias</p>
    <div class="materia-list">
      ${materias.map(m => `
        <div class="materia-card" style="--mat-color: ${m.color}">
          <div class="materia-card__accent"></div>
          <div class="materia-card__body">
            <div class="materia-card__head">
              <h3 class="materia-card__title">${m.nombre}</h3>
              <span class="materia-card__status">${m.estado}</span>
            </div>
            <p class="materia-card__docente">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke-linecap="round"/>
              </svg>
              ${m.docente}
            </p>
            <div class="materia-card__horarios">
              ${m.dias.map(d => `<span class="materia-card__horario">${d}</span>`).join('')}
              <span class="materia-card__hora">${m.hora}</span>
            </div>
            ${m.nota !== null ? `
              <div class="materia-card__nota">
                <span class="nota-label">Último parcial</span>
                <span class="nota-value" style="color:${m.color}">${m.nota}</span>
              </div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ----------------------------------------------------------------
   13. DRAWER: MIS INSCRIPCIONES
---------------------------------------------------------------- */
function renderInscripciones(body) {
  const materiasInscriptas = [
    'Análisis Matemático I',
    'Programación I',
    'Álgebra Lineal',
    'Sistemas Operativos',
    'Lógica Computacional',
  ];

  const mesas = [
    { materia: 'Lógica Computacional',  tipo: 'Examen Final',     fecha: '20/07/2026', inscripto: true  },
    { materia: 'Estadística Aplicada',  tipo: 'Primer Parcial',   fecha: '28/07/2026', inscripto: false },
  ];

  const checkIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const calIcon   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round"/></svg>`;
  const bookIcon  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;

  body.innerHTML = `
    <div class="inscr-section">
      <div class="inscr-section__header">
        <div class="inscr-section__icon" style="background:rgba(37,99,235,.1);color:#2563eb">${bookIcon}</div>
        <div class="inscr-section__info">
          <p class="inscr-section__label">Materias cursadas</p>
          <h3 class="inscr-section__title">1er Cuatrimestre 2026</h3>
        </div>
        <span class="inscr-badge inscr-badge--open">Abierto</span>
      </div>
      <div class="inscr-list">
        ${materiasInscriptas.map(m => `
          <div class="inscr-item">
            <span class="inscr-item__check">${checkIcon}</span>
            <span class="inscr-item__name">${m}</span>
          </div>
        `).join('')}
      </div>
      <button class="btn-secondary" style="width:100%;margin-top:12px">Modificar inscripción</button>
    </div>

    <div class="inscr-divider"></div>

    <div class="inscr-section">
      <div class="inscr-section__header">
        <div class="inscr-section__icon" style="background:rgba(6,182,212,.1);color:#06b6d4">${calIcon}</div>
        <div class="inscr-section__info">
          <p class="inscr-section__label">Mesas de examen</p>
          <h3 class="inscr-section__title">Turno Julio 2026</h3>
        </div>
        <span class="inscr-badge inscr-badge--open">Abierto</span>
      </div>
      <div class="inscr-list inscr-list--mesas">
        ${mesas.map(m => `
          <div class="inscr-mesa">
            <div class="inscr-mesa__info">
              <p class="inscr-mesa__materia">${m.materia}</p>
              <p class="inscr-mesa__sub">${m.tipo} · ${m.fecha}</p>
            </div>
            ${m.inscripto
              ? `<span class="inscr-chip inscr-chip--done">${checkIcon} Inscripto</span>`
              : `<button class="btn-primary inscr-btn-sm">Inscribirme</button>`}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   14. DRAWER: MI CARRERA
---------------------------------------------------------------- */
function renderCarrera(body) {
  const u   = state.usuario;
  const pct = Math.round((u.materias_cursadas / u.materias_totales) * 100);

  const plan = [
    { anio: 'Primer Año', materias: [
      { nombre: 'Análisis Matemático I',  aprobada: true,  nota: 8  },
      { nombre: 'Álgebra Lineal',         aprobada: true,  nota: 7  },
      { nombre: 'Programación I',         aprobada: true,  nota: 9  },
      { nombre: 'Introducción a la IA',   aprobada: true,  nota: 8  },
      { nombre: 'Inglés Técnico I',       aprobada: true,  nota: 7  },
    ]},
    { anio: 'Segundo Año', materias: [
      { nombre: 'Análisis Matemático II', aprobada: false, cursando: true  },
      { nombre: 'Estadística Aplicada',   aprobada: false, cursando: true  },
      { nombre: 'Lógica Computacional',   aprobada: false, cursando: true  },
      { nombre: 'Sistemas Operativos',    aprobada: false, cursando: true  },
      { nombre: 'Base de Datos I',        aprobada: false, cursando: false },
    ]},
    { anio: 'Tercer Año', materias: [
      { nombre: 'Machine Learning',       aprobada: false, cursando: false },
      { nombre: 'Redes Neuronales',       aprobada: false, cursando: false },
      { nombre: 'Proyecto Final I',       aprobada: false, cursando: false },
    ]},
  ];

  const globeIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke-linecap="round"/></svg>`;
  const gradIcon  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5" stroke-linecap="round"/></svg>`;
  const calIcon   = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round"/></svg>`;

  body.innerHTML = `
    <div class="career-stats-row">
      <div class="career-stat-card">
        <span class="career-stat-card__num" style="color:var(--accent-green)">${u.materias_cursadas}</span>
        <span class="career-stat-card__label">Aprobadas</span>
      </div>
      <div class="career-stat-card">
        <span class="career-stat-card__num" style="color:var(--brand-500)">${u.materias_totales - u.materias_cursadas}</span>
        <span class="career-stat-card__label">Pendientes</span>
      </div>
      <div class="career-stat-card">
        <span class="career-stat-card__num" style="color:var(--accent-amber)">${pct}%</span>
        <span class="career-stat-card__label">Avance</span>
      </div>
    </div>

    <div class="progress" style="margin-bottom:22px">
      <div class="progress__fill" style="width:${pct}%"></div>
    </div>

    <p class="drawer-section-label">Accesos rápidos</p>
    <div class="career-links">
      <a class="career-link" href="#" tabindex="0">
        <div class="career-link__icon" style="background:rgba(37,99,235,.1);color:#2563eb">${globeIcon}</div>
        <span>Campus Virtual</span>
      </a>
      <a class="career-link" href="#" tabindex="0">
        <div class="career-link__icon" style="background:rgba(61,170,106,.1);color:#3DAA6A">${gradIcon}</div>
        <span>Aula Virtual</span>
      </a>
      <a class="career-link" href="#" tabindex="0">
        <div class="career-link__icon" style="background:rgba(14,165,233,.1);color:#0ea5e9">${calIcon}</div>
        <span>Mi Asistencia</span>
      </a>
    </div>

    <p class="drawer-section-label">Plan de estudios · ${u.carrera}</p>
    ${plan.map(yr => {
      const aprobadas = yr.materias.filter(m => m.aprobada).length;
      return `
        <div class="plan-year">
          <div class="plan-year__header">
            <span class="plan-year__title">${yr.anio}</span>
            <span class="plan-year__count">${aprobadas}/${yr.materias.length}</span>
          </div>
          <div class="plan-materias">
            ${yr.materias.map(m => `
              <div class="plan-materia ${m.aprobada ? 'plan-materia--done' : m.cursando ? 'plan-materia--active' : ''}">
                <span class="plan-materia__dot"></span>
                <span class="plan-materia__name">${m.nombre}</span>
                ${m.aprobada  ? `<span class="plan-materia__nota">${m.nota}</span>` : ''}
                ${m.cursando  ? `<span class="plan-materia__badge">Cursando</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('')}
  `;

  requestAnimationFrame(() => {
    const fill = body.querySelector('.progress__fill');
    if (fill) fill.style.width = pct + '%';
  });
}

/* ----------------------------------------------------------------
   15. DRAWER: CENTRO ESTUDIANTIL
---------------------------------------------------------------- */
function renderCentro(body) {
  const delegados = [
    { nombre: 'Valentina Ríos',   cargo: 'Presidenta',  carrera: 'Ciencias de Datos e IA', avatar: 'VR', color: '#3b82f6' },
    { nombre: 'Mateo Fernández',  cargo: 'Secretario',  carrera: 'Tecnicatura en Redes',    avatar: 'MF', color: '#2563eb' },
    { nombre: 'Lucía Aramburu',   cargo: 'Tesorera',    carrera: 'Prog. Universitaria',     avatar: 'LA', color: '#3DAA6A' },
  ];

  const proxEventos = (state.eventos?.eventos || [])
    .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
    .slice(0, 3);

  const igIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`;
  const waIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const mailIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7" stroke-linecap="round"/></svg>`;

  body.innerHTML = `
    <div class="ce-hero">
      <div class="ce-hero__avatar">CE</div>
      <div>
        <h3 class="ce-hero__name">Centro de Estudiantes</h3>
        <p class="ce-hero__sub">ISFDyT N° 57 · Juana Paula Manso · Chascomús</p>
      </div>
    </div>

    <p class="drawer-section-label">Comisión Directiva</p>
    <div class="delegado-list">
      ${delegados.map(d => `
        <div class="delegado-card">
          <div class="delegado-card__avatar" style="background:${d.color}">${d.avatar}</div>
          <div class="delegado-card__info">
            <p class="delegado-card__name">${d.nombre}</p>
            <p class="delegado-card__meta">${d.cargo} · ${d.carrera}</p>
          </div>
        </div>
      `).join('')}
    </div>

    <p class="drawer-section-label">Próximos eventos</p>
    <div class="ce-events-mini">
      ${proxEventos.map(ev => {
        const { dia, mes } = formatDay(ev.fecha_inicio);
        return `
          <div class="ce-event-mini" style="--ev-color:${ev.color}">
            <div class="ce-event-mini__date">
              <span class="ce-event-mini__day">${dia}</span>
              <span class="ce-event-mini__month">${mes}</span>
            </div>
            <div class="ce-event-mini__body">
              <p class="ce-event-mini__title">${ev.titulo}</p>
              <p class="ce-event-mini__lugar">${ev.lugar}</p>
            </div>
            <span class="ce-event-mini__cat" style="background:${ev.color}20;color:${ev.color}">${ev.categoria}</span>
          </div>
        `;
      }).join('')}
    </div>

    <p class="drawer-section-label">Contacto</p>
    <div class="ce-links">
      <a class="ce-link" href="#" tabindex="0" style="--lk-color:#06b6d4">
        <span class="ce-link__icon">${igIcon}</span>
        <span>Instagram</span>
        <span class="ce-link__handle">@ce.isfdyt57</span>
      </a>
      <a class="ce-link" href="#" tabindex="0" style="--lk-color:#3DAA6A">
        <span class="ce-link__icon">${waIcon}</span>
        <span>WhatsApp</span>
        <span class="ce-link__handle">Grupo general</span>
      </a>
      <a class="ce-link" href="#" tabindex="0" style="--lk-color:#2563eb">
        <span class="ce-link__icon">${mailIcon}</span>
        <span>Mail</span>
        <span class="ce-link__handle">ce@isfdyt57.edu.ar</span>
      </a>
    </div>
  `;
}

/* ----------------------------------------------------------------
   15. DRAWER: EVENTOS
---------------------------------------------------------------- */
function renderEventos(body) {
  const eventos = state.eventos?.eventos || [];

  // Ordenamos por fecha (más próximos primero)
  const ordenados = [...eventos].sort(
    (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
  );

  body.innerHTML = `
    <div class="events-list-drawer">
      ${ordenados.map(ev => buildEventCardHTML(ev)).join('')}
    </div>
  `;

  // Bindeo: click en el botón "Inscribirme" de cada tarjeta
  $$('.event-card__cta', body).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.eventId);
      inscribirseEvento(id);
      // Mostrar permiso generado
      const ev = state.eventos.eventos.find(x => x.id === id);
      alert(`Permiso de inscripción generado para: ${ev.titulo}`);
    });
  });
}

/* ----------------------------------------------------------------
   16. DRAWER: CALENDARIO ACADÉMICO
---------------------------------------------------------------- */
function renderCalendar(body) {
  if (!state.calendarioMes) {
    state.calendarioMes = new Date(2026, 2, 1); // Marzo 2026 por defecto (inicio ciclo lectivo)
  }

  // Determinar perfil una sola vez para todo el render
  const perfil   = getPerfilActivo();
  const esAdmin  = perfil === 'administrador' || perfil === 'admin';

  const currentDate = state.calendarioMes;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Obtener primer y último día del mes
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Calcular celdas vacías al principio
  let startingDay = firstDay.getDay(); 

  // Obtener todos los eventos y tipos
  let eventos = [...(state.calendario?.eventos_calendario || [])];
  const tipos = state.calendario?.tipos || [];

  if (state.mostrarEventosCE && state.eventos?.eventos) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const eventosExtra = state.eventos.eventos
      .filter(ev => new Date(ev.fecha_inicio) >= hoy)
      .map(ev => ({
        fecha: ev.fecha_inicio.split('T')[0],
        titulo: ev.titulo,
        tipo: 'evento_ce', // tipo unificado para los del JSON
        color: ev.color || '#8B5CF6'
      }));
    eventos = [...eventos, ...eventosExtra];
    // Agregar el tipo si no existe para que funcione el filtro opcional
    if (!tipos.find(t => t.id === 'evento_ce')) {
      tipos.push({ id: 'evento_ce', nombre: 'Eventos Externos', color: '#8B5CF6' });
    }
  }

  // Filtrar eventos si hay un filtro activo
  let eventosFiltrados = eventos;
  if (state.calendarioFiltro !== 'todos') {
    eventosFiltrados = eventos.filter(e => e.tipo === state.calendarioFiltro);
  }

  // Agrupar eventos por día en el mes actual
  const eventosDelMes = {};
  eventosFiltrados.forEach(e => {
    const [evYear, evMonth, evDay] = e.fecha.split('-');
    if (parseInt(evYear) === year && parseInt(evMonth) - 1 === month) {
      const d = parseInt(evDay);
      if (!eventosDelMes[d]) eventosDelMes[d] = [];
      eventosDelMes[d].push(e);
    }
  });

  // Generar HTML del Header del Calendario
  let calHTML = `
    <div class="calendar-header">
      <button class="cal-nav-btn" id="prevMonth" aria-label="Mes anterior">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <h3 class="calendar-title">${meses[month]} ${year}</h3>
      <button class="cal-nav-btn" id="nextMonth" aria-label="Mes siguiente">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  `;

  // Filtros de categorías
  calHTML += `<div class="news-filters" style="margin-bottom: 24px; flex-wrap: wrap; align-items: center;">`;
  calHTML += `<button class="chip ${state.calendarioFiltro === 'todos' ? 'chip--active' : ''}" data-cal-filter="todos">Todos</button>`;
  tipos.forEach(t => {
    const isAct = state.calendarioFiltro === t.id ? 'chip--active' : '';
    const extraStyle = isAct ? `background-color: ${softColor(t.color, 0.15)}; color: ${t.color}; border-color: ${t.color};` : '';
    calHTML += `<button class="chip ${isAct}" data-cal-filter="${t.id}" style="${extraStyle}">${t.nombre}</button>`;
  });
  
  // Botón para sincronizar/mostrar Eventos CE (eventos.json)
  const isSyncCE = state.mostrarEventosCE ? 'chip--active' : '';
  const syncStyle = isSyncCE ? `background-color: ${softColor('#8B5CF6', 0.15)}; color: #8B5CF6; border-color: #8B5CF6;` : '';
  calHTML += `<button class="chip ${isSyncCE}" id="btnSyncCE" style="margin-left: auto; ${syncStyle}">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: text-bottom;">
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3"></circle>
      <circle cx="18" cy="16" r="3"></circle>
    </svg>
    ${state.mostrarEventosCE ? 'Ocultar Eventos CE' : 'Ver Eventos CE'}
  </button>`;
  
  calHTML += `</div>`;

  // Días de la semana
  calHTML += `<div class="calendar-grid"><div class="calendar-weekdays">`;
  diasSemana.forEach(d => {
    calHTML += `<div class="calendar-weekday">${d}</div>`;
  });
  calHTML += `</div><div class="calendar-days">`;

  // Celdas vacías
  for (let i = 0; i < startingDay; i++) {
    calHTML += `<div class="calendar-day calendar-day--empty"></div>`;
  }

  // Días del mes
  const hoy = new Date();
  const esMesActual = hoy.getFullYear() === year && hoy.getMonth() === month;

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const isToday = esMesActual && hoy.getDate() === d;
    const dayEvents = eventosDelMes[d] || [];
    
    let dotsHTML = '<div class="calendar-day-events">';
    dayEvents.slice(0, 3).forEach(e => {
      dotsHTML += `<span class="calendar-dot" style="background-color: ${e.color}" title="${e.titulo}"></span>`;
    });
    if (dayEvents.length > 3) {
      dotsHTML += `<span class="calendar-dot calendar-dot--more" title="Más eventos"></span>`;
    }
    dotsHTML += '</div>';

    const dayClass = isToday ? 'calendar-day calendar-day--today' : 'calendar-day';
    const hasEventsClass = dayEvents.length > 0 ? 'calendar-day--has-events' : '';
    calHTML += `
      <div class="${dayClass} ${hasEventsClass}">
        <span class="calendar-day-num">${d}</span>
        ${dotsHTML}
      </div>
    `;
  }
  calHTML += `</div></div>`; // Cerrar days y grid

  // Listado inferior de eventos del mes
  let eventosDelMesFlat = [];
  Object.keys(eventosDelMes).sort((a,b) => parseInt(a) - parseInt(b)).forEach(dia => {
    eventosDelMes[dia].forEach(e => eventosDelMesFlat.push(e));
  });

  calHTML += `<div class="calendar-event-list">`;
  calHTML += `<p class="drawer-section-label" style="margin-top: 32px;">Eventos de ${meses[month]}</p>`;
  
  if (eventosDelMesFlat.length === 0) {
    calHTML += `<div class="notif-empty" style="margin-top:16px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" />
        </svg>
        <p>No hay eventos registrados.</p>
      </div>`;
  } else {
    eventosDelMesFlat.forEach(e => {
      const [y, m, d] = e.fecha.split('-');
      // Clave única para identificar el evento en operaciones de borrado (admin)
      const eventoKey = `${e.fecha}__${e.titulo}`;
      const btnEliminar = esAdmin ? `
        <button class="cal-list-del" data-evento-key="${eventoKey}" aria-label="Eliminar ${e.titulo}">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>` : '';
      calHTML += `
        <div class="cal-list-item" style="--ev-color: ${e.color}">
          <div class="cal-list-date">
            <span class="cal-list-day">${d}</span>
            <span class="cal-list-month">${meses[parseInt(m)-1].substring(0,3).toUpperCase()}</span>
          </div>
          <div class="cal-list-body">
            <h4 class="cal-list-title">${e.titulo}</h4>
            <span class="cal-list-type" style="color: ${e.color}; background-color: ${softColor(e.color)}">${tipos.find(t=>t.id===e.tipo)?.nombre || 'Evento'}</span>
          </div>
          ${btnEliminar}
        </div>
      `;
    });
  }
  calHTML += `</div>`;

  // Contenedor de acciones por perfil (docente / delegado / admin)
  calHTML += `<div id="panel-acciones-calendario" style="margin-top: 28px;"></div>`;

  body.innerHTML = calHTML;

  // Inyectar botones de acción según perfil y activar delete del admin
  renderPanelAcciones(body);
  bindCalendarAcciones(body);

  // Bindings para navegar mes
  body.querySelector('#prevMonth').addEventListener('click', () => {
    state.calendarioMes = new Date(year, month - 1, 1);
    renderCalendar(body);
  });
  body.querySelector('#nextMonth').addEventListener('click', () => {
    state.calendarioMes = new Date(year, month + 1, 1);
    renderCalendar(body);
  });

  // Bindings para filtros
  body.querySelectorAll('.chip[data-cal-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.calendarioFiltro = e.currentTarget.dataset.calFilter;
      renderCalendar(body);
    });
  });

  // Binding para botón Sincronizar Eventos CE
  const btnSyncCE = body.querySelector('#btnSyncCE');
  if (btnSyncCE) {
    btnSyncCE.addEventListener('click', () => {
      state.mostrarEventosCE = !state.mostrarEventosCE;
      renderCalendar(body);
    });
  }
}
function renderEventsList() {}
function renderFullNews() {}
function renderRegulations() {}
function renderSession() {}

/* ----------------------------------------------------------------
   CALENDARIO — Panel de acciones por perfil
---------------------------------------------------------------- */

/**
 * Inyecta los botones de gestión en #panel-acciones-calendario
 * según el perfil leído desde localStorage.
 *   alumno      → sin botones (solo lectura)
 *   docente     → "Cargar Fecha de Examen"
 *   delegado    → "Crear Evento Institucional"
 *   admin       → ambos botones
 */
function renderPanelAcciones(calBody) {
  const panel = calBody.querySelector('#panel-acciones-calendario');
  if (!panel) return;

  const perfil      = getPerfilActivo();
  const esDocente   = perfil === 'docente';
  const esDelegado  = perfil === 'delegado';
  const esAdmin     = perfil === 'administrador' || perfil === 'admin';

  if (!esDocente && !esDelegado && !esAdmin) {
    panel.innerHTML = '';
    return;
  }

  let html = `
    <div class="cal-acciones">
      <p class="drawer-section-label" style="margin-top:0; margin-bottom:10px;">Acciones disponibles</p>
      <div class="cal-acciones__btns">
  `;

  if (esDocente || esAdmin) {
    html += `
      <button class="btn-primary cal-accion-btn" id="btnCargarExamen">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2">
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <path d="M3 9h18M8 3v4M16 3v4M9 14l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Cargar Fecha de Examen
      </button>
    `;
  }

  if (esDelegado || esAdmin) {
    html += `
      <button class="btn-primary cal-accion-btn cal-accion-btn--delegado" id="btnCrearEvento">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
        </svg>
        Crear Evento Institucional
      </button>
    `;
  }

  html += `</div></div>`;
  panel.innerHTML = html;

  panel.querySelector('#btnCargarExamen')?.addEventListener('click', () => abrirModalExamen(calBody));
  panel.querySelector('#btnCrearEvento')?.addEventListener('click',  () => abrirModalEvento(calBody));
}

/**
 * Activa los botones de eliminar evento para el perfil administrador.
 * Cada botón lleva data-evento-key="YYYY-MM-DD__titulo" como identificador.
 */
function bindCalendarAcciones(calBody) {
  calBody.querySelectorAll('.cal-list-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      eliminarEvento(btn.dataset.eventoKey, calBody);
    });
  });
}

/* ----------------------------------------------------------------
   CALENDARIO — Modal: Cargar Fecha de Examen (perfil docente / admin)
---------------------------------------------------------------- */

function abrirModalExamen(calBody) {
  const materias = [
    'Análisis Matemático I', 'Programación I', 'Álgebra Lineal',
    'Sistemas Operativos', 'Lógica Computacional', 'Estadística Aplicada',
    'Base de Datos I', 'Inglés Técnico I',
  ];

  const modal = crearModalCalendario({
    titulo: 'Cargar Fecha de Examen',
    html: `
      <form id="formExamen" class="cal-modal-form">
        <label class="cal-modal-label">
          Materia
          <select name="materia" required>
            <option value="">Seleccioná una materia…</option>
            ${materias.map(m => `<option value="${m}">${m}</option>`).join('')}
          </select>
        </label>
        <div class="cal-modal-row">
          <label class="cal-modal-label">
            Fecha
            <input type="date" name="fecha" required>
          </label>
          <label class="cal-modal-label">
            Horario
            <input type="time" name="horario" required>
          </label>
        </div>
        <label class="cal-modal-label">
          Tipo de examen
          <select name="tipo_examen" required>
            <option value="Parcial">Parcial</option>
            <option value="Final">Final</option>
            <option value="Recuperatorio">Recuperatorio</option>
          </select>
        </label>
        <div class="cal-modal-actions">
          <button type="button" class="btn-secondary" id="cancelarModalExamen">Cancelar</button>
          <button type="submit" class="btn-primary">Guardar examen</button>
        </div>
      </form>
    `,
  });

  modal.querySelector('#cancelarModalExamen').addEventListener('click', () => cerrarModalCalendario(modal));
  modal.querySelector('#formExamen').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    guardarExamen({
      materia:      data.get('materia'),
      fecha:        data.get('fecha'),
      horario:      data.get('horario'),
      tipo_examen:  data.get('tipo_examen'),
    }, calBody, modal);
  });
}

/**
 * Agrega el examen al array de eventos del estado y re-renderiza el calendario.
 * En Fase 2, este mock se reemplaza por un POST a /api/calendario.
 */
function guardarExamen({ materia, fecha, horario, tipo_examen }, calBody, modal) {
  const nuevoEvento = {
    fecha,
    titulo:   `${tipo_examen}: ${materia} — ${horario}hs`,
    tipo:     'examen',
    color:    '#3A5BA9',
  };

  state.calendario.eventos_calendario.push(nuevoEvento);

  // Navegar al mes del evento recién cargado
  const [y, m] = fecha.split('-').map(Number);
  state.calendarioMes = new Date(y, m - 1, 1);

  cerrarModalCalendario(modal);
  renderCalendar(calBody);
}

/* ----------------------------------------------------------------
   CALENDARIO — Modal: Crear Evento Institucional (perfil delegado / admin)
---------------------------------------------------------------- */

function abrirModalEvento(calBody) {
  const modal = crearModalCalendario({
    titulo: 'Crear Evento Institucional',
    html: `
      <form id="formEvento" class="cal-modal-form">
        <label class="cal-modal-label">
          Título del evento
          <input type="text" name="titulo" required placeholder="Ej: Festival del Estudiante">
        </label>
        <div class="cal-modal-row">
          <label class="cal-modal-label">
            Fecha inicio
            <input type="date" name="fecha_inicio" required>
          </label>
          <label class="cal-modal-label">
            Fecha fin <span style="font-weight:400;text-transform:none;">(opcional)</span>
            <input type="date" name="fecha_fin">
          </label>
        </div>
        <label class="cal-modal-label">
          Descripción
          <textarea name="descripcion" rows="3" placeholder="Detalle, programa, requisitos…"></textarea>
        </label>
        <label class="cal-modal-label">
          Ubicación
          <input type="text" name="ubicacion" placeholder="Ej: SUM, Aula Magna, Campus…">
        </label>
        <div class="cal-modal-actions">
          <button type="button" class="btn-secondary" id="cancelarModalEvento">Cancelar</button>
          <button type="submit" class="btn-primary cal-btn--delegado">Crear evento</button>
        </div>
      </form>
    `,
  });

  modal.querySelector('#cancelarModalEvento').addEventListener('click', () => cerrarModalCalendario(modal));
  modal.querySelector('#formEvento').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    guardarEvento({
      titulo:       data.get('titulo'),
      fecha_inicio: data.get('fecha_inicio'),
      fecha_fin:    data.get('fecha_fin') || null,
      descripcion:  data.get('descripcion'),
      ubicacion:    data.get('ubicacion'),
    }, calBody, modal);
  });
}

/**
 * Agrega el evento al estado con tipo 'evento_centro' y re-renderiza.
 * Si el tipo no existe aún en la paleta, lo registra para que el filtro funcione.
 * En Fase 2, reemplazar por POST a /api/eventos.
 */
function guardarEvento({ titulo, fecha_inicio, fecha_fin, descripcion, ubicacion }, calBody, modal) {
  const TIPO_ID = 'evento_centro';

  // Registrar el tipo en la paleta si es la primera vez
  if (!state.calendario.tipos.find(t => t.id === TIPO_ID)) {
    state.calendario.tipos.push({ id: TIPO_ID, nombre: 'Evento CE', color: '#8B5CF6' });
  }

  const nuevoEvento = {
    fecha:       fecha_inicio,
    titulo,
    tipo:        TIPO_ID,   // tipo requerido por la consigna
    color:       '#8B5CF6',
    descripcion,
    ubicacion,
    fecha_fin,
  };

  state.calendario.eventos_calendario.push(nuevoEvento);

  const [y, m] = fecha_inicio.split('-').map(Number);
  state.calendarioMes = new Date(y, m - 1, 1);

  cerrarModalCalendario(modal);
  renderCalendar(calBody);
}

/* ----------------------------------------------------------------
   CALENDARIO — Eliminar evento (solo perfil administrador)
---------------------------------------------------------------- */

/**
 * Filtra el evento del estado usando la clave compuesta "fecha__titulo"
 * y re-renderiza el calendario.
 * En Fase 2, reemplazar por DELETE /api/calendario/:id.
 */
function eliminarEvento(eventoKey, calBody) {
  const separador = eventoKey.indexOf('__');
  const fecha   = eventoKey.slice(0, separador);
  const titulo  = eventoKey.slice(separador + 2);

  state.calendario.eventos_calendario = state.calendario.eventos_calendario.filter(
    e => !(e.fecha === fecha && e.titulo === titulo)
  );

  renderCalendar(calBody);
}

/* ----------------------------------------------------------------
   CALENDARIO — Helpers para modales
---------------------------------------------------------------- */

/**
 * Crea un modal flotante sobre el drawer con el contenido dado.
 * Retorna el elemento montado en document.body para que el caller
 * pueda bindear eventos de formulario sobre él.
 */
function crearModalCalendario({ titulo, html }) {
  document.getElementById('calendarModal')?.remove();

  // Los estilos .cal-modal-* están en styles.css (disponible en todos los portales)
  const el = document.createElement('div');
  el.id = 'calendarModal';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', titulo);
  el.innerHTML = `
    <div class="cal-modal-overlay">
      <div class="cal-modal-card">
        <div class="cal-modal-header">
          <h3 class="cal-modal-title">${titulo}</h3>
          <button class="cal-modal-close" aria-label="Cerrar modal">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6l12 12M18 6l-12 12" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        ${html}
      </div>
    </div>
  `;

  document.body.appendChild(el);

  el.querySelector('.cal-modal-close').addEventListener('click', () => cerrarModalCalendario(el));
  el.querySelector('.cal-modal-overlay').addEventListener('click', (e) => {
    if (e.target === el.querySelector('.cal-modal-overlay')) cerrarModalCalendario(el);
  });

  // Cerrar con Escape
  function onEsc(e) {
    if (e.key === 'Escape') { cerrarModalCalendario(el); document.removeEventListener('keydown', onEsc); }
  }
  document.addEventListener('keydown', onEsc);

  return el;
}

function cerrarModalCalendario(modal) {
  modal?.parentNode?.removeChild(modal);
}

/* ----------------------------------------------------------------
   NOTIFICACIONES - Panel desplegable de la campana
---------------------------------------------------------------- */
function bindNotifications() {
  const bellBtn = $('#bellBtn');
  const panel   = $('#notifPanel');

  if (!bellBtn || !panel) return;

  updateBellBadge();
  renderNotifPanel();

  bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !panel.classList.contains('is-open');
    if (willOpen) {
      const rect = bellBtn.getBoundingClientRect();
      panel.style.top  = (rect.bottom + 10) + 'px';
      panel.style.right = (window.innerWidth - rect.right) + 'px';
    }
    panel.classList.toggle('is-open');
    panel.setAttribute('aria-hidden', String(!willOpen));
    bellBtn.setAttribute('aria-expanded', String(willOpen));
    state.notifPanelOpen = willOpen;
  });

  $('#notifMarkAll')?.addEventListener('click', (e) => {
    e.stopPropagation();
    markAllNotifRead();
  });

  document.addEventListener('click', (e) => {
    if (!state.notifPanelOpen) return;
    if (!panel.contains(e.target) && e.target !== bellBtn && !bellBtn.contains(e.target)) {
      closeNotifPanel();
    }
  });
}

function closeNotifPanel() {
  const panel = $('#notifPanel');
  if (!panel) return;
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  $('#bellBtn')?.setAttribute('aria-expanded', 'false');
  state.notifPanelOpen = false;
}

function renderNotifPanel() {
  const list  = $('#notifList');
  if (!list) return;

  const notifs = state.notificaciones?.notificaciones || [];

  if (!notifs.length) {
    list.innerHTML = `
      <div class="notif-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" stroke-linecap="round"/>
          <path d="M10 21a2 2 0 0 0 4 0" stroke-linecap="round"/>
        </svg>
        <p>No tenés notificaciones</p>
      </div>
    `;
    return;
  }

  list.innerHTML = notifs.map(n => {
    const unreadCls = !n.leida ? ' notif-item--unread' : '';
    const unreadDot = !n.leida ? '<span class="notif-item__unread-dot"></span>' : '';
    return `
      <div class="notif-item${unreadCls}" data-notif-id="${n.id}" role="button" tabindex="0"
           aria-label="${n.titulo}${n.leida ? '' : ' (sin leer)'}">
        <span class="notif-item__dot notif-item__dot--${n.tipo}"></span>
        <div class="notif-item__body">
          <p class="notif-item__title">${n.titulo}</p>
          <p class="notif-item__desc">${n.descripcion}</p>
          <span class="notif-item__time">${timeAgo(n.fecha)}</span>
        </div>
        ${unreadDot}
      </div>
    `;
  }).join('');

  list.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', () => markNotifRead(Number(el.dataset.notifId)));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') markNotifRead(Number(el.dataset.notifId));
    });
  });
}

function markNotifRead(id) {
  const notifs = state.notificaciones?.notificaciones;
  if (!notifs) return;
  const n = notifs.find(x => x.id === id);
  if (n && !n.leida) {
    n.leida = true;
    renderNotifPanel();
    updateBellBadge();
  }
}

function markAllNotifRead() {
  const notifs = state.notificaciones?.notificaciones;
  if (!notifs) return;
  notifs.forEach(n => { n.leida = true; });
  renderNotifPanel();
  updateBellBadge();
}

function updateBellBadge() {
  const badge  = $('#bellBadge');
  if (!badge) return;
  const notifs  = state.notificaciones?.notificaciones || [];
  const unread  = notifs.filter(n => !n.leida).length;
  badge.textContent = unread;
  badge.style.display = unread > 0 ? '' : 'none';
}

/* ----------------------------------------------------------------
   16. NAVEGACIÓN - Click en cualquier botón del sidebar abre drawer
---------------------------------------------------------------- */
function bindNavigation() {
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.id === 'logoutBtn') {
        $('#logoutModal').classList.add('is-open');
        return;
      }
      const target = btn.dataset.drawer;
      if (!target) return;
      if (state.drawerActivo === target) {
        closeDrawer();
      } else {
        openDrawer(target);
      }
    });
  });

  // Lógica del modal de cierre de sesión
  $('#logoutCancel')?.addEventListener('click', () => {
    $('#logoutModal').classList.remove('is-open');
  });

  $('#logoutConfirm')?.addEventListener('click', () => {
    performLogout();
  });
}

/* ----------------------------------------------------------------
   17. FALLBACK DATA (por si se abre con file://)
        En caso de que fetch() falle, usamos estos datos embebidos.
---------------------------------------------------------------- */
window.__FALLBACK_DATA__ = {
  usuario: {
    id: 1, dni: "43987654", nombre: "Santiago Chiale",
    email: "santiago.chiale@isfdyt57.edu.ar", perfil_id: 1, perfil: "Alumno",
    carrera_id: 3, carrera: "Ciencias de Datos e IA", avatar: "SC",
    activo: true, materias_cursadas: 5, materias_totales: 30,
    legajo: "2024-0342", cohorte: 2024,
    proximas_fechas: [{ fecha: "20/07/2026", materia: "Lógica Computacional", tipo: "Examen Final" }],
    notificaciones_sin_leer: 3, clases_hoy: 3, eventos_semana: 2
  },
  notificaciones: {
    notificaciones: [
      { id: 1, titulo: "Inscripción confirmada", descripcion: "Tu inscripción a Lógica Computacional (20/07) fue confirmada exitosamente.", tipo: "success", fecha: "2026-04-27T09:00:00", leida: false },
      { id: 2, titulo: "Cierre de inscripciones", descripcion: "Las inscripciones a mesas de Julio cierran el 10/07.", tipo: "warning", fecha: "2026-04-26T14:30:00", leida: false },
      { id: 3, titulo: "Workshop de Python", descripcion: "El CE abrió cupos para el taller de Pandas, NumPy y Scikit-learn.", tipo: "info", fecha: "2026-04-25T11:00:00", leida: false }
    ]
  }
};
