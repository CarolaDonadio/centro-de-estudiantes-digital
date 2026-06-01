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
  usuario: 'json/usuario.json',
  novedades: 'json/novedades.json',
  eventos: 'json/eventos.json',
  calendario: 'json/calendario.json',
  reglamentacion: 'json/reglamentacion.json',
  notificaciones: 'json/notificaciones.json',
  carreras: 'json/carreras.json',
  materias: 'json/materias.json',
};

/* ----------------------------------------------------------------
   1. HELPERS (utilidades genéricas)
---------------------------------------------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
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

/** Formatea una fecha ISO a "dd MMM" en español. */
function formatDay(isoDate) {
  const d = new Date(isoDate);
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return { dia: d.getDate(), mes: meses[d.getMonth()] };
}

/** Formatea "hace X tiempo" para novedades */
function timeAgo(isoDate) {
  const d = new Date(isoDate);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString('es-AR');
}

function getUniqueNewsSubjects() {
  const allMaterias = state.materias?.materias || [];
  return allMaterias.map(m => ({ id: m.id, nombre: m.nombre }));
}

/** Devuelve un color "soft" a partir de un hex (para fondo de chips) */
function softColor(hex, alpha = 0.14) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substr(0, 2), 16);
  const g = parseInt(h.substr(2, 2), 16);
  const b = parseInt(h.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Darkens a hex color by a given percentage. */
function darkenHex(hex, percent) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  r = Math.max(0, r - Math.round(r * (percent / 100)));
  g = Math.max(0, g - Math.round(g * (percent / 100)));
  b = Math.max(0, b - Math.round(b * (percent / 100)));

  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/** Mapea el tipo de evento a una imagen de fondo (Unsplash) */
function getEventBackgroundImage(imagenTipo) {
  const imagenes = {
    'workshop': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    'party': 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=500&h=300&fit=crop',
    'conference': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    'charla': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    'chess': 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=500&h=300&fit=crop',
    'hackathon': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
    'cinema': 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=500&h=300&fit=crop',
    'default': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop'
  };
  return imagenes[imagenTipo?.toLowerCase()] || imagenes['default'];
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
  carreras: null,
  filtroCarrera: 'todas',
  filtroMateria: 'todas',
  filtroFechaDesde: '',
  filtroFechaHasta: '',
  filtroMateriasEstado: 'todas',
  materias: null,
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
  const [usuario, novedades, eventos, calendario, reglamentacion, notificaciones, carreras, materias] = await Promise.all([
    fetchJSON(API.usuario),
    fetchJSON(API.novedades),
    fetchJSON(API.eventos),
    fetchJSON(API.calendario),
    fetchJSON(API.reglamentacion),
    fetchJSON(API.notificaciones),
    fetchJSON(API.carreras),
    fetchJSON(API.materias),
  ]);

  Object.assign(state, { usuario, novedades, eventos, calendario, reglamentacion, notificaciones, carreras, materias });

  // Aseguramos que el contador de notificaciones sin leer en el usuario sea coherente con el JSON de notificaciones
  if (state.notificaciones && state.notificaciones.notificaciones) {
    const initialUnreadCount = state.notificaciones.notificaciones.filter(n => !n.leida).length;
    if (state.usuario) {
      state.usuario.notificaciones_sin_leer = initialUnreadCount;
    }
  }

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
  const name = session?.nombre || u.nombre;
  $('#userName').textContent = name;

  // Actualizar iniciales del avatar dinámicamente
  if (name && $('#userAvatar')) {
    const parts = name.split(' ');
    const initials = parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
    $('#userAvatar').textContent = initials;
  }

  // Lógica de Píldora de Rol
  const rawRole = (session?.rol || u.perfil || '').toLowerCase();
  const roleLabels = {
    'admin': 'ADMINISTRADOR',
    'administrador': 'ADMINISTRADOR',
    'docente': 'DOCENTE',
    'delegado': 'DELEGADO'
  };

  if (roleLabels[rawRole]) {
    // Limpiamos si ya existe (para evitar duplicados en re-renders)
    const oldPill = $('.role-pill');
    if (oldPill) oldPill.remove();

    const pill = document.createElement('span');
    pill.className = 'role-pill';
    pill.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" stroke-linejoin="round"></path></svg>
      ${roleLabels[rawRole]}
    `;
    $('.header__text').prepend(pill);
  }

  const resumen =
    `Tenés ${u.clases_hoy} clases hoy, ${u.notificaciones_sin_leer} notificaciones sin leer y ${u.eventos_semana} eventos del CE esta semana.`;
  $('#userSummary').textContent = resumen;
}

/* ----------------------------------------------------------------
   5. RENDER: Tarjeta de Carrera
---------------------------------------------------------------- */
function renderCareerCard() {
  const u = state.usuario;
  if (!u) return;

  $('#userCareer').textContent = u.carrera;
  $('#materiasAprobadas').textContent = String(u.materias_cursadas).padStart(2, '0');
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
      - Por defecto muestra los 4 más próximos (2x2).
      - Botón "Mostrar todo" expande para ver todos.
      - Cada tarjeta tiene su botón "Inscribirme" funcional, con estado.
---------------------------------------------------------------- */
function renderEvents() {
  const cont = $('#eventsContainer');
  const actions = $('#eventsActions');
  const lista = state.eventos?.eventos || [];

  // Ordenamos por fecha (más próximos primero)
  const ordenados = [...lista].sort(
    (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
  );

  // Cuántos mostrar según el estado de expansión (por defecto mostrar 4 -> 2x2)
  const visibles = state.eventosExpanded ? ordenados : ordenados.slice(0, 4);

  // Render de las tarjetas
  cont.classList.toggle('events-grid--expanded', state.eventosExpanded);
  cont.innerHTML = visibles.map(ev => buildEventCardHTML(ev)).join('');

  // Footer con el toggle "Mostrar todo / Mostrar menos"
  // Solo aparece si hay más de 4 eventos en total.
  if (ordenados.length > 4) {
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
  const lleno = ev.inscriptos >= ev.cupo;

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
    <article class="event-card" style="--event-color: ${ev.color}; background-image: url('${getEventBackgroundImage(ev.imagen)}');" data-event-id="${ev.id}">
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
  if (!cont) return;

  const cats = state.novedades?.categorias || [];
  const careers = state.carreras || [];
  const subjects = getUniqueNewsSubjects();

  cont.innerHTML = `
    <div class="news-filters__categories">
      <button class="chip chip--active" data-filter="todas">Todas</button>
      ${cats.map(c => `<button class="chip" data-filter="${c.id}">${c.nombre}</button>`).join('')}
    </div>
    <div class="news-filters__advanced">
      <div class="filter-group">
        <label for="newsCareerFilter">Filtrar por Carrera</label>
        <select id="newsCareerFilter" class="filter-select">
          <option value="todas">Todas las carreras</option>
          ${careers.map(c => `<option value="${c.id}">${c.codigo}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label for="newsSubjectFilter">Filtrar por Materia</label>
        <select id="newsSubjectFilter" class="filter-select">
          <option value="todas">Todas las materias</option>
          ${subjects.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('')}
        </select>
      </div>
      <div class="news-filters__dates">
        <div class="filter-group" style="flex:1">
          <label for="newsDateFrom">Desde</label>
          <input id="newsDateFrom" type="date" class="filter-input" value="${state.filtroFechaDesde}">
        </div>
        <div class="filter-group" style="flex:1">
          <label for="newsDateTo">Hasta</label>
          <input id="newsDateTo" type="date" class="filter-input" value="${state.filtroFechaHasta}">
        </div>
      </div>
    </div>
  `;

  // Bind de chips de categorías
  cont.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filtroNovedad = btn.dataset.filter;
      cont.querySelectorAll('.chip').forEach(x => x.classList.remove('chip--active'));
      btn.classList.add('chip--active');
      renderNewsList();
    });
  });

  // Bind de selectores de Carrera y Materia
  const careerSelect = cont.querySelector('#newsCareerFilter');
  if (careerSelect) {
    careerSelect.value = state.filtroCarrera;
    careerSelect.addEventListener('change', () => {
      state.filtroCarrera = careerSelect.value;
      renderNewsList();
    });
  }

  const subjectSelect = cont.querySelector('#newsSubjectFilter');
  if (subjectSelect) {
    subjectSelect.value = state.filtroMateria;
    subjectSelect.addEventListener('change', () => {
      state.filtroMateria = subjectSelect.value;
      renderNewsList();
    });
  }

  // Bind de inputs de fechas
  const dateFrom = cont.querySelector('#newsDateFrom');
  dateFrom?.addEventListener('change', () => {
    state.filtroFechaDesde = dateFrom.value;
    renderNewsList();
  });

  const dateTo = cont.querySelector('#newsDateTo');
  dateTo?.addEventListener('change', () => {
    state.filtroFechaHasta = dateTo.value;
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
  if (state.filtroCarrera !== 'todas') {
    lista = lista.filter(n => String(n.carrera_id) === state.filtroCarrera);
  }
  if (state.filtroMateria !== 'todas') {
    lista = lista.filter(n => String(n.materia_id) === state.filtroMateria);
  }
  if (state.filtroFechaDesde) {
    lista = lista.filter(n => new Date(n.fecha) >= new Date(state.filtroFechaDesde));
  }
  if (state.filtroFechaHasta) {
    lista = lista.filter(n => new Date(n.fecha) <= new Date(state.filtroFechaHasta));
  }

  // Ordenar por destacada + fecha
  lista.sort((a, b) => {
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
    const cat = categorias.find(c => c.id === n.categoria_id) || { color: '#2563eb' };
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
  const drawer = $('#drawer');
  const overlay = $('#drawerOverlay');
  const title = $('#drawerTitle');
  const icon = $('#drawerIcon');
  const body = $('#drawerBody');

  const config = {
    perfil: { title: 'Mi Perfil', icon: iconUser, render: renderProfile },
    materias: { title: 'Mis Materias', icon: iconBook, render: renderMaterias },
    inscripciones: { title: 'Mis Inscripciones', icon: iconInscript, render: renderInscripciones },
    carrera: { title: 'Mi Carrera', icon: iconCareer, render: renderCarrera },
    centro: { title: 'Centro Estudiantil', icon: iconStar, render: renderCentro },
    novedades: { title: 'Novedades', icon: iconNews, render: renderNovedades },
    calendario: { title: 'Calendario Académico', icon: iconCalendar, render: renderCalendar },
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

const iconNews = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M4 6h16M4 10h16M4 14h8M4 18h8"/>
    <circle cx="18" cy="18" r="2"/>
  </svg>`;

const iconCalendar = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke-linecap="round" />
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

/**
 * Calcula el estado de regularidad dinámicamente
 * Regular: Asistencia >= 75% y Nota >= 4
 * Riesgo: Asistencia entre 60% y 74% O Nota < 4
 * Libre: Asistencia < 60%
 */
function getMateriaStatus(asistencia, nota) {
  if (asistencia < 60) return { texto: 'Libre', color: 'var(--accent-coral)' };
  if (asistencia < 75 || (nota !== null && nota < 4)) return { texto: 'Riesgo', color: 'var(--accent-amber)' };
  return { texto: 'Regular', color: 'var(--accent-green)' };
}

function renderMaterias(body) {
  let list = state.materias?.materias || [];

  // Aplicar cálculo de estado a cada materia para poder filtrar
  list = list.map(m => ({
    ...m,
    statusInfo: getMateriaStatus(m.asistencia, m.nota_parcial)
  }));

  // Filtrar si es necesario
  if (state.filtroMateriasEstado !== 'todas') {
    list = list.filter(m => m.statusInfo.texto.toLowerCase() === state.filtroMateriasEstado);
  }

  body.innerHTML = `
    <div class="drawer__filters" style="margin-bottom: 20px;">
      <button class="chip ${state.filtroMateriasEstado === 'todas' ? 'chip--active' : ''}" data-status-filter="todas">Todas</button>
      <button class="chip ${state.filtroMateriasEstado === 'regular' ? 'chip--active' : ''}" data-status-filter="regular">Regulares</button>
      <button class="chip ${state.filtroMateriasEstado === 'riesgo' ? 'chip--active' : ''}" data-status-filter="riesgo">En Riesgo</button>
      <button class="chip ${state.filtroMateriasEstado === 'libre' ? 'chip--active' : ''}" data-status-filter="libre">Libres</button>
    </div>

    <p class="drawer-section-label">1er Cuatrimestre 2026 · ${list.length} materias mostradas</p>
    <div class="materia-list">
      ${list.map(m => `
        <div class="materia-card" style="--mat-color: ${m.color}">
          <div class="materia-card__accent"></div>
          <div class="materia-card__body">
            <div class="materia-card__head">
              <h3 class="materia-card__title">${m.nombre}</h3>
              <span class="materia-card__status" style="background:${m.statusInfo.color}15; color:${m.statusInfo.color}">
                ${m.statusInfo.texto}
              </span>
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

            <div class="materia-card__attendance" style="margin-top:12px;">
              <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:4px; color:var(--text-muted);">
                <span>ASISTENCIA</span>
                <span style="color:${m.statusInfo.color}">${m.asistencia}%</span>
              </div>
              <div class="progress" style="width:100%; height:4px;">
                <div class="progress__fill" style="width:${m.asistencia}%; background:${m.statusInfo.color}; transition: width 0.8s ease;"></div>
              </div>
            </div>

            ${m.nota_parcial !== null ? `
              <div class="materia-card__nota">
                <span class="nota-label">Nota Parcial</span>
                <span class="nota-value" style="color:${m.nota_parcial < 4 ? 'var(--accent-coral)' : 'var(--accent-green)'}">${m.nota_parcial}</span>
              </div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Bindeo de filtros
  body.querySelectorAll('[data-status-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filtroMateriasEstado = btn.dataset.statusFilter;
      renderMaterias(body);
    });
  });
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
    { materia: 'Lógica Computacional', tipo: 'Examen Final', fecha: '20/07/2026', inscripto: true },
    { materia: 'Estadística Aplicada', tipo: 'Primer Parcial', fecha: '28/07/2026', inscripto: false },
  ];

  const checkIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const calIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round"/></svg>`;
  const bookIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;

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
  const u = state.usuario;
  const pct = Math.round((u.materias_cursadas / u.materias_totales) * 100);

  const plan = [
    {
      anio: 'Primer Año', materias: [
        { nombre: 'Análisis Matemático I', aprobada: true, nota: 8 },
        { nombre: 'Álgebra Lineal', aprobada: true, nota: 7 },
        { nombre: 'Programación I', aprobada: true, nota: 9 },
        { nombre: 'Introducción a la IA', aprobada: true, nota: 8 },
        { nombre: 'Inglés Técnico I', aprobada: true, nota: 7 },
      ]
    },
    {
      anio: 'Segundo Año', materias: [
        { nombre: 'Análisis Matemático II', aprobada: false, cursando: true },
        { nombre: 'Estadística Aplicada', aprobada: false, cursando: true },
        { nombre: 'Lógica Computacional', aprobada: false, cursando: true },
        { nombre: 'Sistemas Operativos', aprobada: false, cursando: true },
        { nombre: 'Base de Datos I', aprobada: false, cursando: false },
      ]
    },
    {
      anio: 'Tercer Año', materias: [
        { nombre: 'Machine Learning', aprobada: false, cursando: false },
        { nombre: 'Redes Neuronales', aprobada: false, cursando: false },
        { nombre: 'Proyecto Final I', aprobada: false, cursando: false },
      ]
    },
  ];

  const globeIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke-linecap="round"/></svg>`;
  const gradIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5" stroke-linecap="round"/></svg>`;
  const calIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round"/></svg>`;

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
                ${m.aprobada ? `<span class="plan-materia__nota">${m.nota}</span>` : ''}
                ${m.cursando ? `<span class="plan-materia__badge">Cursando</span>` : ''}
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
    { nombre: 'Valentina Ríos', cargo: 'Presidenta', carrera: 'Ciencias de Datos e IA', avatar: 'VR', color: '#3b82f6' },
    { nombre: 'Mateo Fernández', cargo: 'Secretario', carrera: 'Tecnicatura en Redes', avatar: 'MF', color: '#2563eb' },
    { nombre: 'Lucía Aramburu', cargo: 'Tesorera', carrera: 'Prog. Universitaria', avatar: 'LA', color: '#3DAA6A' },
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

function renderNovedades(body) {
  const novedades = state.novedades?.novedades || [];
  const categorias = state.novedades?.categorias || [];

  // Filtros por categoría
  const filtrosHTML = `
    <div class="drawer__filters">
      <button class="chip chip--active" data-filter="todas">Todas</button>
      ${categorias.map(c => `<button class="chip" data-filter="${c.id}">${c.nombre}</button>`).join('')}
    </div>
  `;

  // Lista de novedades filtrada
  let listaFiltrada = [...novedades];
  const filtroActual = state.filtroNovedad || 'todas';
  if (filtroActual !== 'todas') {
    listaFiltrada = listaFiltrada.filter(n => String(n.categoria_id) === filtroActual);
  }

  // Ordenar: destacadas primero, luego por fecha
  listaFiltrada.sort((a, b) => {
    if (a.destacada !== b.destacada) return b.destacada - a.destacada;
    return new Date(b.fecha) - new Date(a.fecha);
  });

  const listaHTML = listaFiltrada.length ? listaFiltrada.map(n => {
    const cat = categorias.find(c => c.id === n.categoria_id) || { color: '#2563eb' };
    const destacadaCls = n.destacada ? ' news-drawer-item--featured' : '';
    const star = n.destacada ? '<span class="news-drawer-item__star">★</span>' : '';
    const adjunto = n.adjunto ? `
      <div class="news-drawer-item__attach">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 11l-9 9a5 5 0 0 1-7-7l10-10a3 3 0 0 1 4 4L9 17a1 1 0 0 1-2-2l8-8"/>
        </svg>
        ${n.adjunto}
      </div>` : '';

    return `
      <article class="news-drawer-item${destacadaCls}" style="--news-color:${cat.color}">
        <div class="news-drawer-item__header">
          <span class="news-drawer-item__category" style="color:${cat.color}">${n.categoria}</span>
          <span class="news-drawer-item__date">${timeAgo(n.fecha)}</span>
          ${star}
        </div>
        <h3 class="news-drawer-item__title">${n.titulo}</h3>
        <p class="news-drawer-item__content">${n.contenido}</p>
        ${adjunto}
      </article>
    `;
  }).join('') : `
    <div class="news-drawer-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M10 21a2 2 0 0 0 4 0"/>
      </svg>
      <p>No hay novedades en esta categoría</p>
    </div>
  `;

  body.innerHTML = `
    ${filtrosHTML}
    <div class="news-drawer-list">
      ${listaHTML}
    </div>
  `;

  // Bind de filtros
  body.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.filtroNovedad = chip.dataset.filter;
      body.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
      chip.classList.add('chip--active');
      renderNovedades(body); // Re-render
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

  const currentDate = state.calendarioMes;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Obtener primer y último día del mes
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Calcular celdas vacías al principio
  let startingDay = firstDay.getDay();

  // Obtener todos los eventos y tipos.
  // Combinamos los eventos base del JSON con los creados por docentes,
  // delegados y administradores a través del store compartido.
  const eventosBase = state.calendario?.eventos_calendario || [];
  const eventos = window.CalendarioStore
    ? window.CalendarioStore.mergeWithBase(eventosBase)
    : eventosBase;
  const tipos = state.calendario?.tipos || [];

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
  calHTML += `<div class="calendar-filters" style="margin-bottom: 24px;">`;
  calHTML += `<button class="chip ${state.calendarioFiltro === 'todos' ? 'chip--active' : ''}" data-cal-filter="todos">Todos</button>`;
  tipos.forEach(t => {
    const isAct = state.calendarioFiltro === t.id ? 'chip--active' : '';
    calHTML += `<button class="chip ${isAct}" data-cal-filter="${t.id}" style="--chip-base-color: ${t.color}; --chip-dark-color: ${darkenHex(t.color, 20)};">${t.nombre}</button>`;
  });
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
  Object.keys(eventosDelMes).sort((a, b) => parseInt(a) - parseInt(b)).forEach(dia => {
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
      const rolMap = { docente: 'Docente', delegado: 'Delegado', admin: 'Admin', administrador: 'Admin' };
      const autorHTML = e.creado_por_nombre
        ? `<span class="cal-list-author">Publicado por ${e.creado_por_nombre}${rolMap[e.creado_por_rol] ? ` · ${rolMap[e.creado_por_rol]}` : ''}</span>`
        : '';
      const horaHTML = e.hora ? `<span class="cal-list-hora">${e.hora} hs</span>` : '';
      calHTML += `
        <div class="cal-list-item" style="--ev-color: ${e.color}">
          <div class="cal-list-date">
            <span class="cal-list-day">${d}</span>
            <span class="cal-list-month">${meses[parseInt(m) - 1].substring(0, 3).toUpperCase()}</span>
          </div>
          <div class="cal-list-body">
            <h4 class="cal-list-title">${e.titulo}</h4>
            <div class="cal-list-meta-row">
              <span class="cal-list-type" style="color: ${e.color}; background-color: ${softColor(e.color)}">${tipos.find(t => t.id === e.tipo)?.nombre || 'Evento'}</span>
              ${horaHTML}
            </div>
            ${autorHTML}
          </div>
        </div>
      `;
    });
  }
  calHTML += `</div>`;

  body.innerHTML = calHTML;

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
}
function renderEventsList() { }
function renderFullNews() { }
function renderRegulations() { }
function renderSession() { }

/* ----------------------------------------------------------------
   NOTIFICACIONES - Panel desplegable de la campana
---------------------------------------------------------------- */
function bindNotifications() {
  const bellBtn = $('#bellBtn');
  const panel = $('#notifPanel');

  if (!bellBtn || !panel) return;

  updateBellBadge();
  renderNotifPanel();

  bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !panel.classList.contains('is-open');
    if (willOpen) {
      const rect = bellBtn.getBoundingClientRect();
      panel.style.top = (rect.bottom + 10) + 'px';
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
  const list = $('#notifList');
  if (!list) return;

  // Obtenemos todas y ordenamos por fecha (más reciente primero)
  const allNotifs = [...(state.notificaciones?.notificaciones || [])]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  if (!allNotifs.length) {
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

  list.innerHTML = allNotifs.map(n => {
    const unreadCls = !n.leida ? ' notif-item--unread' : '';
    const unreadDot = !n.leida ? '<span class="notif-item__unread-dot"></span>' : '';
    const ariaLabel = `${n.titulo}${!n.leida ? ' (sin leer)' : ''}`;

    return `
      <div class="notif-item${unreadCls}" data-notif-id="${n.id}" role="button" tabindex="0"
           aria-label="${ariaLabel}">
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
  const badge = $('#bellBadge');
  if (!badge) return;
  const notifs = state.notificaciones?.notificaciones || [];
  const unread = notifs.filter(n => !n.leida).length;
  badge.textContent = unread;
  badge.style.display = unread > 0 ? 'flex' : 'none'; // Usar 'flex' para que el badge se muestre correctamente

  // Actualizar el estado del usuario para que el resumen también refleje el conteo actual
  if (state.usuario) {
    state.usuario.notificaciones_sin_leer = unread;
  }
  renderUserHeader(); // Re-renderizar el encabezado para actualizar el resumen
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
      { id: 1, titulo: "Inscripción confirmada", descripcion: "Tu inscripción a Lógica Computacional (20/07) ha sido exitosa.", fecha: "2026-05-15T09:00:00", tipo: "success", leida: false }
    ]
  },
  materias: {
    materias: [
      { id: 1, codigo: "TP1", nombre: "Técnicas de Programación", carrera_id: 1, docente: "García, María", asistencia: 85, nota_parcial: 8, dias: ["Lun", "Mié"], hora: "18:30 - 21:30", color: "#4A67C9" },
      { id: 2, codigo: "BD1", nombre: "Bases de Datos I", carrera_id: 1, docente: "López, Carlos", asistencia: 72, nota_parcial: 3, dias: ["Mar", "Jue"], hora: "19:00 - 22:00", color: "#F5A623" },
      { id: 3, codigo: "LC", nombre: "Lógica Computacional", carrera_id: 1, docente: "Ríos, Valentina", asistencia: 98, nota_parcial: 10, dias: ["Vie"], hora: "18:00 - 21:00", color: "#8B5CF6" }
    ]
  }
};