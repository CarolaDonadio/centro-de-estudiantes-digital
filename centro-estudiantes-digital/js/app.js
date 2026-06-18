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
// Este objeto define las rutas a los archivos JSON locales que se usaban como "API mock" en la Fase 1.
// Aunque ahora se usa la API real (api-client.js), algunas referencias a JSON locales persisten para datos estáticos.
const API = {
  usuario: '../json/usuario.json',
  novedades: '../json/novedades.json',
  eventos: '../json/eventos.json',
  calendario: '../json/calendario.json',
  reglamentacion: '../json/reglamentacion.json',
  notificaciones: '../json/notificaciones.json',
  carreras: '../json/carreras.json',
  materias: '../json/materias.json',
};

/* ----------------------------------------------------------------
   1. HELPERS (utilidades genéricas)
---------------------------------------------------------------- */
// Funciones cortas para seleccionar elementos del DOM, similares a jQuery.
// $ para un solo elemento, $$ para una lista de elementos.
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Función auxiliar para cargar archivos JSON.
 * Wrapper fetch con manejo de errores y fallback a datos inline.
 * Útil para cuando se abre el HTML con protocolo file:// (sin servidor).
 */
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err) {
    // Si falla la carga (ej. no hay servidor local), intenta usar datos de respaldo (fallback)
    console.warn(`[API Mock] No se pudo cargar ${url}. Verificá que estés corriendo un servidor local.`, err);
    // Devolvemos el fallback desde window si existe (por si no hay servidor)
    const key = url.replace('../json/', '').replace('.json', '');
    return window.__FALLBACK_DATA__?.[key] || null;
  }
}

// Formatea una fecha ISO (ej. "2026-06-15T19:52:32Z") a un objeto con día y mes abreviado.
/** Formatea una fecha ISO a "dd MMM" en español. */
function formatDay(isoDate) {
  const d = new Date(isoDate);
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return { dia: d.getDate(), mes: meses[d.getMonth()] };
}

// Calcula cuánto tiempo pasó desde una fecha dada y lo devuelve en formato legible (ej. "hace 5min").
/** Formatea "hace X tiempo" para novedades */
function timeAgo(isoDate) {
  const d = new Date(isoDate);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString('es-AR');
}

// Obtiene una lista de nombres de materias únicas para usar en filtros.
function getUniqueNewsSubjects() {
  const allMaterias = state.materias?.materias || [];
  return allMaterias.map(m => ({ id: m.id, nombre: m.nombre }));
}

// Convierte un color hexadecimal a un formato RGBA con una transparencia (alpha) dada.
/** Devuelve un color "soft" a partir de un hex (para fondo de chips) */
function softColor(hex, alpha = 0.14) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substr(0, 2), 16);
  const g = parseInt(h.substr(2, 2), 16);
  const b = parseInt(h.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Oscurece un color hexadecimal en un porcentaje dado.
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

// Asigna una imagen de fondo predefinida según el tipo de evento.
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
   2. ESTADO GLOBAL DE LA APP (state)
   Este objeto guarda toda la información dinámica de la aplicación.
   Cuando cambia, se deben re-renderizar las partes de la UI que lo usan.
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
   3. INICIALIZACIÓN (init)
   Esta función se ejecuta cuando la página termina de cargar.
   Es el punto de entrada principal de la aplicación.
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', init);

// Función asíncrona que carga todos los datos iniciales de la API y JSON locales.
async function init() {
  try {
    const [usuario, novedadesAPI, dataNovedadesJSON, eventosAPI, calendarioAPI, dataCalendarioJSON, reglamentacionAPI, notificacionesAPI, carrerasAPI, materias] = await Promise.all([
      fetchJSON(API.usuario),
      Novedades.listar(),
      fetchJSON(API.novedades),
      Eventos.listar(), // Carga eventos desde la API
      Calendario.listar(), // Carga calendario desde la API
      fetchJSON(API.calendario), // Mantenemos el JSON para obtener los 'tipos' (categorías con colores)
      Reglamentacion.listar().catch(() => []), // Carga reglamentación desde la API (asumiendo que devuelve un array)
      Notificaciones.listar(), // Carga notificaciones desde la API
      Carreras.listar(),
      fetchJSON(API.materias)
    ]);

    // Procesamiento de Novedades: mezcla datos de la API con categorías del JSON local.
    const categorias = dataNovedadesJSON?.categorias || [];
    const novedades = {
      novedades: (novedadesAPI || []).map(n => ({
        ...n,
        categoria: categorias.find(c => c.id == n.categoria_id)?.nombre || 'General',
        // Normalizar fecha para el Alumno
        fecha: n.fecha || n.created_at
      })),
      categorias
    };

    // Preparamos el objeto de eventos con el formato que espera el resto de app.js.
    const eventos = {
      eventos: eventosAPI || []
    };

    // Preparamos el objeto de calendario mezclando los eventos de la API con los tipos del JSON local.
    const calendario = {
      eventos_calendario: calendarioAPI || [],
      tipos: dataCalendarioJSON?.tipos || []
    };

    // Preparamos el objeto de reglamentacion con el formato que espera el resto de app.js.
    const reglamentacion = { documentos: reglamentacionAPI || [] };
    // Preparamos el objeto de notificaciones con el formato que espera el resto de app.js.
    const notificaciones = { notificaciones: notificacionesAPI || [] };

    Object.assign(state, { usuario, novedades, eventos, calendario, reglamentacion, notificaciones, carreras: carrerasAPI, materias });

    // Cargar inscripciones previas del usuario
    if (usuario && eventosAPI && Array.isArray(eventosAPI)) {
      eventosAPI.forEach(ev => {
        if (ev.usuarios_inscriptos && Array.isArray(ev.usuarios_inscriptos)) {
          if (ev.usuarios_inscriptos.includes(usuario.id)) {
            state.inscripciones.add(ev.id);
          }
        }
      });
    }

    // Calcula el número inicial de notificaciones sin leer.
    if (state.notificaciones?.notificaciones) {
      const initialUnreadCount = state.notificaciones.notificaciones.filter(n => !n.leida).length;
      if (state.usuario) state.usuario.notificaciones_sin_leer = initialUnreadCount;
    }

    // Llama a las funciones para renderizar las diferentes secciones de la interfaz.
    renderUserHeader();
    renderCareerCard();
    renderEvents();
    renderNewsFilters();
    renderNewsList();
    renderReglamentacion();
    
    // Bindea los eventos a los controles de navegación y notificaciones.
    bindNavigation();
    bindDrawerControls();
    bindNotifications();
    bindReglamentacionSearch();
    bindSidebarToggle();
  } catch (err) {
    console.error('Error en init():', err);
  }
}

/* ----------------------------------------------------------------
   4. RENDER: Header + Saludo (renderUserHeader)
   Actualiza la información del usuario en el encabezado de la página.
---------------------------------------------------------------- */
function renderUserHeader() {
  const u = state.usuario;
  if (!u) return;

  // Obtiene el nombre del usuario de la sesión (si está disponible) o del objeto de usuario.
  // Esto es para asegurar que el nombre mostrado sea el más actualizado.
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

  // Lógica para mostrar la "píldora" del rol del usuario (ej. "ADMINISTRADOR").
  // Lógica de Píldora de Rol
  const rawRole = (session?.rol || u.perfil || '').toLowerCase();
  const roleLabels = {
    'admin': 'ADMINISTRADOR',
    'administrador': 'ADMINISTRADOR',
    'docente': 'DOCENTE',
    'delegado': 'DELEGADO'
  };

  if (roleLabels[rawRole]) {
    // Limpiamos la píldora si ya existe (para evitar duplicados en re-renders).
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

  // Actualiza el resumen de actividades del usuario (clases, notificaciones, eventos).
  const resumen =
    `Tenés ${u.clases_hoy} clases hoy, ${u.notificaciones_sin_leer} notificaciones sin leer y ${u.eventos_semana} eventos del CE esta semana.`;
  $('#userSummary').textContent = resumen;
}

/* ----------------------------------------------------------------
   5. RENDER: Tarjeta de Carrera (renderCareerCard)
   Actualiza la información de la carrera del alumno en la tarjeta principal.
---------------------------------------------------------------- */
function renderCareerCard() {
  const u = state.usuario;
  if (!u || !state.carreras) return;

  // Buscar el nombre de la carrera en los datos de la API
  const carreraObj = state.carreras.find(c => c.id == u.carrera_id);
  $('#userCareer').textContent = carreraObj ? carreraObj.nombre : u.carrera; // Muestra el nombre de la carrera.

  // Actualiza el número de materias aprobadas y totales.
  $('#materiasAprobadas').textContent = String(u.materias_cursadas).padStart(2, '0');
  $('#materiasTotales').textContent = u.materias_totales;
  

  // Próxima fecha académica
  if (u.proximas_fechas?.length) {
    const prox = u.proximas_fechas[0];
    $('#proximaFecha').textContent = `${prox.fecha} · ${prox.materia}`;
    $('#proximaTipo').textContent = prox.tipo;
  }

  // Animación de la barra de progreso de la carrera.
  const pct = (u.materias_cursadas / u.materias_totales) * 100;
  requestAnimationFrame(() => {
    $('#careerProgress').style.width = pct + '%';
  });
}

/* ----------------------------------------------------------------
   6. RENDER: Eventos CE (renderEvents)
   Renderiza la cuadrícula de eventos del Centro de Estudiantes.
   - Por defecto muestra los 4 más próximos (2x2).
   - Un botón "Mostrar todo" permite expandir para ver todos los eventos.
   - Cada tarjeta de evento tiene un botón "Inscribirme" que refleja el estado de inscripción.
---------------------------------------------------------------- */
function renderEvents() {
  const cont = $('#eventsContainer');
  const actions = $('#eventsActions');
  const lista = state.eventos?.eventos || [];

  // Ordenamos por fecha (más próximos primero)
  const ordenados = [...lista].sort( // Crea una copia para no modificar el array original.
    (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
  );

  // Cuántos eventos mostrar según el estado de expansión (por defecto, los primeros 4).
  const visibles = state.eventosExpanded ? ordenados : ordenados.slice(0, 4);

  // Render de las tarjetas
  cont.classList.toggle('events-grid--expanded', state.eventosExpanded);
  cont.innerHTML = visibles.map(ev => buildEventCardHTML(ev)).join(''); // Genera el HTML para cada evento visible.

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

  // Bindeo: Asigna el evento 'click' al botón "Inscribirme" de cada tarjeta.
  $$('.event-card__cta', cont).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();              // Evita que el clic en el botón también abra el drawer del evento.
      const id = btn.dataset.eventId;
      console.log('Intentando inscribirse al evento ID:', id);
      inscribirseEvento(id);
    });
  });
}


/**
 * buildEventCardHTML:
 * Genera el HTML de una tarjeta individual de evento.
 * Refleja si el usuario ya está inscripto (usando `state.inscripciones`) o si el cupo está completo.
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
 * showToast:
 * Muestra un mensaje flotante (toast) en la parte inferior de la pantalla.
 * Actualiza el estado y refresca todas las vistas que muestren eventos.
 */
function showToast(message, type = 'success') {
  const toast = $('#toastMessage');
  const text = $('#toastMessageText');
  if (!toast || !text) {
    window.alert(message);
    return;
  }

  toast.classList.remove('toast-message--success', 'toast-message--error', 'toast-message--warn');
  toast.classList.add(`toast-message--${type}`);
  text.textContent = message;
  toast.classList.add('is-visible');

  clearTimeout(toast._toastTimer);
  toast._toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3600);
}

/**
 * inscribirseEvento:
 * Lógica central para que un usuario se inscriba a un evento.
 */
async function inscribirseEvento(id) {
  const ev = state.eventos.eventos.find(x => x.id === id);
  if (!ev) {
    showToast('No se encontró el evento.', 'error');
    return;
  }
  if (state.inscripciones.has(id)) {
    showToast('Ya estás inscripto a este evento.', 'warn');
    return;
  }
  if (ev.inscriptos >= ev.cupo) {
    showToast('No hay cupo disponible para este evento.', 'error');
    return;
  }

  try {
    // Agregamos el ID del usuario a la lista de inscriptos dentro del evento.
    const usuariosActualizados = ev.usuarios_inscriptos || [];
    if (!usuariosActualizados.includes(state.usuario.id)) {
      usuariosActualizados.push(state.usuario.id); // Añade el ID del usuario actual.
    }

    const inscriptosActualizados = (ev.inscriptos || 0) + 1;

    await Eventos.actualizar(id, {
      ...ev,
      inscriptos: inscriptosActualizados,
      usuarios_inscriptos: usuariosActualizados
    });

    ev.inscriptos = inscriptosActualizados; // Actualiza el contador de inscriptos en el objeto local.
    ev.usuarios_inscriptos = usuariosActualizados; // Actualiza la lista de IDs de inscriptos.
    state.inscripciones.add(id); // Añade el ID del evento al Set de inscripciones del estado global.
    
    // Refrescamos la home y, si está abierto el drawer del centro, también lo actualizamos
    renderEvents();
    if (state.drawerActivo === 'centro') {
      renderCentro($('#drawerBody'));
    }

    showToast('Te inscribiste exitosamente', 'success');
  } catch (err) {
    console.error('Error al inscribirse al evento:', err);
    showToast('No se pudo completar la inscripción en este momento. Intente más tarde.', 'error');
  }
}

/* ----------------------------------------------------------------
   7. RENDER: Novedades (Feed) + Filtros por categoría (renderNewsFilters y renderNewsList)
   Gestiona la visualización de las noticias y los filtros asociados.
---------------------------------------------------------------- */
function renderNewsFilters() {
  const cont = $('#newsFilters');
  if (!cont) return;

  const cats = state.novedades?.categorias || [];
  const careers = state.carreras || [];
  // Obtiene las materias únicas para el filtro.
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
          ${careers.map(c => `<option value="${c.id}">${c.codigo || c.nombre}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label for="newsSubjectFilter">Filtrar por Materia</label>
        <select id="newsSubjectFilter" class="filter-select">
          <option value="todas">Todas las materias</option>
          ${subjects.map(s => `<option value="${s.nombre}">${s.nombre}</option>`).join('')}
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

  // Bindea los selectores de Carrera y Materia para aplicar filtros.
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

  // Bindea los inputs de fechas para filtrar por rango.
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

// Renderiza la lista de novedades aplicando los filtros activos.
function renderNewsList() {
  const cont = $('#newsList');
  const novedades = state.novedades?.novedades || [];
  const categorias = state.novedades?.categorias || [];

  // Filtrado
  let lista = [...novedades];
  // Filtra por categoría seleccionada.
  if (state.filtroNovedad !== 'todas') {
    lista = lista.filter(n => String(n.categoria_id) === state.filtroNovedad);
  }
  // Filtra por carrera. Las novedades con `carrera_id: null` son para todas las carreras.
  if (state.filtroCarrera !== 'todas') {
    // Si carrera_id es null, es para todas
    lista = lista.filter(n => n.carrera_id === null || String(n.carrera_id) === state.filtroCarrera);
  }
  // Filtra por materia (nombre de la materia).
  if (state.filtroMateria !== 'todas') {
    // Filtrar por el nombre de la materia (string) que viene de la API o del form de admin
    lista = lista.filter(n => n.materia === state.filtroMateria);
  }
  // Filtra por rango de fechas.
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

  // Si no hay novedades después de filtrar, muestra un mensaje.
  if (!lista.length) {
    cont.innerHTML = `
      <div style="text-align:center; padding:30px; color:var(--text-muted); font-size:13px;">
        No hay novedades en esta categoría todavía.
      </div>
    `;
    return;
  }

  // Genera el HTML para cada novedad filtrada.
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

// Genera el HTML para un elemento individual de reglamentación.
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

// Bindea los controles de búsqueda y filtro de la sección de reglamentación.
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

// Filtra los documentos de reglamentación según la búsqueda y los filtros activos.
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

// Renderiza la lista de documentos de reglamentación.
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

// Bindea los controles para cerrar el drawer lateral (botón "X", clic en overlay, tecla Escape).
function bindDrawerControls() {
  $('#drawerClose').addEventListener('click', closeDrawer);
  $('#drawerOverlay').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

/**
 * bindSidebarToggle:
 * Lógica del menú hamburguesa para móviles, que abre y cierra el sidebar.
 */
function bindSidebarToggle() {
  const toggle = $('#sidebarToggle');
  const body = document.body;
  
  // Crear overlay si no existe
  let overlay = $('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    body.appendChild(overlay);
  }

  // Función para cerrar el sidebar.
  const closeSidebar = () => {
    body.classList.remove('sidebar--open');
    toggle?.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  };

  // Event listener para el botón de toggle (hamburguesa).
  toggle?.addEventListener('click', () => {
    const isOpen = body.classList.toggle('sidebar--open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    // Bloquear scroll del body si está abierto ("sin scrolling interno")
    body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Event listener para el overlay, para cerrar el sidebar al hacer clic fuera.
  overlay.addEventListener('click', closeSidebar);
}

/* ----------------------------------------------------------------
   9. DRAWER LATERAL - abrir/cerrar + contenido dinámico por sección (openDrawer y closeDrawer)
---------------------------------------------------------------- */
function openDrawer(type) {
  const drawer = $('#drawer');
  const overlay = $('#drawerOverlay');
  const title = $('#drawerTitle');
  const icon = $('#drawerIcon');
  const body = $('#drawerBody');

  // Objeto de configuración para cada tipo de drawer, con su título, ícono y función de renderizado.
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
  
  // Marcamos cuál drawer está activo en el estado global (útil para refrescos cruzados, ej. inscripciones).
  state.drawerActivo = type;

  // Feedback visual: marca como activo el botón del sidebar correspondiente.
  $$('.nav-btn').forEach(b => b.classList.remove('nav-btn--active'));
  const btnActivo = $(`.nav-btn[data-drawer="${type}"]`);
  if (btnActivo) btnActivo.classList.add('nav-btn--active');

  // Actualiza el título y el ícono del drawer.
  title.textContent = cfg.title;
  icon.innerHTML = cfg.icon;
  body.innerHTML = '';    // Limpia el contenido previo del cuerpo del drawer.
  cfg.render(body);       // Llama a la función de renderizado específica para el tipo de drawer.

  // Abre el drawer y el overlay.
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.classList.add('is-open');

  // Deshabilita scroll del body mientras drawer está abierto
  document.body.style.overflow = 'hidden';
}

// Cierra el drawer lateral y restaura el scroll del body.
function closeDrawer() {
  $('#drawer').classList.remove('is-open');
  $('#drawer').setAttribute('aria-hidden', 'true');
  $('#drawerOverlay').classList.remove('is-open');
  document.body.style.overflow = '';

  // Limpia el estado del drawer activo y desactiva el botón del sidebar.
  // Limpiar estado activo
  state.drawerActivo = null;
  $$('.nav-btn').forEach(b => b.classList.remove('nav-btn--active'));
}

/* ----------------------------------------------------------------
   10. ÍCONOS del header del drawer (SVG inline)
   Definiciones de íconos SVG para usar en los encabezados de los drawers.
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
   11. DRAWER: PERFIL (renderProfile)
   Renderiza la información del perfil del usuario en el drawer.
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
 * getMateriaStatus:
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

// renderMaterias: Renderiza la lista de materias del alumno en el drawer.
function renderMaterias(body) {
  let list = state.materias?.materias || [];

  // Aplicar cálculo de estado a cada materia para poder filtrar
  list = list.map(m => ({
    // Añade una propiedad `statusInfo` a cada materia con su estado y color.
    ...m,
    statusInfo: getMateriaStatus(m.asistencia, m.nota_parcial)
  }));

  // Filtrar si es necesario
  if (state.filtroMateriasEstado !== 'todas') {
    list = list.filter(m => m.statusInfo.texto.toLowerCase() === state.filtroMateriasEstado);
  }

  // Genera el HTML para los filtros de estado y la lista de materias.
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
   13. DRAWER: MIS INSCRIPCIONES (renderInscripciones)
   Renderiza las inscripciones del alumno a materias y mesas de examen.
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
   14. DRAWER: MI CARRERA (renderCarrera)
   Renderiza el plan de estudios y el progreso del alumno en su carrera.
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
   15. DRAWER: CENTRO ESTUDIANTIL (renderCentro)
   Renderiza la información del Centro de Estudiantes, incluyendo directivos, eventos y contactos.
---------------------------------------------------------------- */
function renderCentro(body) {
  const delegados = [
    { nombre: 'Valentina Ríos', cargo: 'Presidenta', carrera: 'Ciencias de Datos e IA', avatar: 'VR', color: '#3b82f6' },
    { nombre: 'Mateo Fernández', cargo: 'Secretario', carrera: 'Tecnicatura en Redes', avatar: 'MF', color: '#2563eb' },
    { nombre: 'Lucía Aramburu', cargo: 'Tesorera', carrera:"", avatar: 'LA', color: '#3DAA6A' },
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

// renderNovedades: Renderiza las novedades en el drawer, con filtros por categoría.
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
  // Aplica el filtro de categoría si no es 'todas'.
  const filtroActual = state.filtroNovedad || 'todas';
  if (filtroActual !== 'todas') {
    listaFiltrada = listaFiltrada.filter(n => String(n.categoria_id) === filtroActual);
  }

  // Ordenar: destacadas primero, luego por fecha
  listaFiltrada.sort((a, b) => {
    if (a.destacada !== b.destacada) return b.destacada - a.destacada;
    return new Date(b.fecha) - new Date(a.fecha);
  });

  // Genera el HTML para cada novedad.
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

  // Bindea los chips de filtro para re-renderizar las novedades al cambiar la categoría.
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
   16. DRAWER: CALENDARIO ACADÉMICO (renderCalendar)
   Renderiza el calendario académico con navegación por mes y filtros por tipo de evento.
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
  // Combina los eventos base del JSON con los creados por usuarios (docentes, delegados, admins)
  // a través del `CalendarioStore` (si está disponible), para mostrar todos los eventos relevantes.
  const eventosBase = state.calendario?.eventos_calendario || [];
  const eventos = window.CalendarioStore
    ? window.CalendarioStore.mergeWithBase(eventosBase)
    : eventosBase;
  const tipos = state.calendario?.tipos || [];

  // Filtrar eventos si hay un filtro activo
  let eventosFiltrados = eventos; // Inicialmente, todos los eventos.
  if (state.calendarioFiltro !== 'todos') {
    eventosFiltrados = eventos.filter(e => e.tipo === state.calendarioFiltro);
  }

  // Agrupar eventos por día en el mes actual
  const eventosDelMes = {};
  eventosFiltrados.forEach(e => {
    const [evYear, evMonth, evDay] = e.fecha.split('-'); // Divide la fecha ISO en año, mes y día.
    if (parseInt(evYear) === year && parseInt(evMonth) - 1 === month) {
      const d = parseInt(evDay);
      if (!eventosDelMes[d]) eventosDelMes[d] = [];
      eventosDelMes[d].push(e);
    }
  });

  // Genera el HTML del encabezado del calendario (botones de navegación y título del mes).
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

  // Genera el HTML para los filtros de categorías de eventos (chips).
  calHTML += `<div class="calendar-filters" style="margin-bottom: 24px;">`;
  calHTML += `<button class="chip ${state.calendarioFiltro === 'todos' ? 'chip--active' : ''}" data-cal-filter="todos">Todos</button>`;
  tipos.forEach(t => {
    const isAct = state.calendarioFiltro === t.id ? 'chip--active' : '';
    calHTML += `<button class="chip ${isAct}" data-cal-filter="${t.id}" style="--chip-base-color: ${t.color}; --chip-dark-color: ${darkenHex(t.color, 20)};">${t.nombre}</button>`;
  });
  calHTML += `</div>`;

  // Genera el HTML para los nombres de los días de la semana.
  calHTML += `<div class="calendar-grid"><div class="calendar-weekdays">`;
  diasSemana.forEach(d => {
    calHTML += `<div class="calendar-weekday">${d}</div>`;
  });
  calHTML += `</div><div class="calendar-days">`;

  // Celdas vacías
  // Rellena los días iniciales del calendario si el mes no empieza en domingo.
  for (let i = 0; i < startingDay; i++) {
    calHTML += `<div class="calendar-day calendar-day--empty"></div>`;
  }

  // Días del mes
  // Itera sobre cada día del mes para generar su celda en el calendario.
  const hoy = new Date();
  const esMesActual = hoy.getFullYear() === year && hoy.getMonth() === month;

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const isToday = esMesActual && hoy.getDate() === d;
    const dayEvents = eventosDelMes[d] || [];

    // Genera los "puntos" de eventos para cada día.
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

  // Prepara la lista plana de eventos del mes para la sección inferior.
  // Listado inferior de eventos del mes
  let eventosDelMesFlat = [];
  Object.keys(eventosDelMes).sort((a, b) => parseInt(a) - parseInt(b)).forEach(dia => {
    eventosDelMes[dia].forEach(e => eventosDelMesFlat.push(e));
  });

  calHTML += `<div class="calendar-event-list">`;
  // Título de la lista de eventos del mes.
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
    // Genera el HTML para cada evento en la lista.
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

  // Inyecta el HTML generado en el cuerpo del drawer.
  body.innerHTML = `<div class="calendar-wrapper">${calHTML}</div>`;

  // Bindings para navegar mes
  body.querySelector('#prevMonth').addEventListener('click', () => {
    state.calendarioMes = new Date(year, month - 1, 1);
    renderCalendar(body);
  });
  body.querySelector('#nextMonth').addEventListener('click', () => {
    state.calendarioMes = new Date(year, month + 1, 1);
    renderCalendar(body);
  });

  // Bindea los chips de filtro para cambiar la vista del calendario.
  body.querySelectorAll('.chip[data-cal-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.calendarioFiltro = e.currentTarget.dataset.calFilter;
      renderCalendar(body);
    });
  });
}
function renderEventsList() { }
function renderFullNews() { } // Función placeholder, no implementada.
// Las siguientes funciones son placeholders o no se usan directamente en este archivo.
function renderRegulations() { }
function renderSession() { }

/* ----------------------------------------------------------------
   NOTIFICACIONES - Panel desplegable de la campana
---------------------------------------------------------------- */
function bindNotifications() {
  const bellBtn = $('#bellBtn'); // Botón de la campana de notificaciones.
  const panel = $('#notifPanel'); // El panel desplegable de notificaciones.

  if (!bellBtn || !panel) return;
  
  // Actualiza el contador de notificaciones y renderiza el panel.

  updateBellBadge();
  renderNotifPanel();

  bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !panel.classList.contains('is-open');
    // Posiciona el panel de notificaciones cerca del botón de la campana.
    if (willOpen) {
      const rect = bellBtn.getBoundingClientRect();
      panel.style.top = (rect.bottom + 10) + 'px';
      panel.style.right = (window.innerWidth - rect.right) + 'px';
    }
    panel.classList.toggle('is-open');
    panel.setAttribute('aria-hidden', String(!willOpen));
    bellBtn.setAttribute('aria-expanded', String(willOpen)); // Actualiza el atributo ARIA para accesibilidad.
    state.notifPanelOpen = willOpen;
  });

  // Bindea el botón "Marcar todo leído".
  $('#notifMarkAll')?.addEventListener('click', (e) => {
    e.stopPropagation();
    markAllNotifRead();
  });

  // Cierra el panel de notificaciones si se hace clic fuera de él.
  document.addEventListener('click', (e) => {
    if (!state.notifPanelOpen) return;
    if (!panel.contains(e.target) && e.target !== bellBtn && !bellBtn.contains(e.target)) {
      closeNotifPanel();
    }
  });
}

// closeNotifPanel: Cierra el panel de notificaciones.
function closeNotifPanel() {
  const panel = $('#notifPanel');
  if (!panel) return;
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  $('#bellBtn')?.setAttribute('aria-expanded', 'false');
  state.notifPanelOpen = false;
}

// renderNotifPanel: Renderiza la lista de notificaciones en el panel.
function renderNotifPanel() {
  const list = $('#notifList');
  if (!list) return;

  // Ordena las notificaciones por fecha, las más recientes primero.
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

  // Genera el HTML para cada notificación.
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

  // Bindea los eventos de clic y teclado para marcar notificaciones como leídas.
  list.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', () => markNotifRead(Number(el.dataset.notifId)));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') markNotifRead(Number(el.dataset.notifId));
    });
  });
}

// markNotifRead: Marca una notificación específica como leída.
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

// markAllNotifRead: Marca todas las notificaciones como leídas.
function markAllNotifRead() {
  const notifs = state.notificaciones?.notificaciones;
  if (!notifs) return;
  notifs.forEach(n => { n.leida = true; });
  renderNotifPanel();
  updateBellBadge();
}

// updateBellBadge: Actualiza el número en el badge de la campana de notificaciones.
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
   16. NAVEGACIÓN - Click en cualquier botón del sidebar abre drawer (bindNavigation)
   Gestiona la navegación principal a través de los botones del sidebar.
---------------------------------------------------------------- */
function bindNavigation() {
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Si es el botón de logout, limpia el localStorage y redirige al inicio.
      if (btn.id === 'logoutBtn') {
        performLogout();
        return;
      }

      // Cerrar sidebar en móvil al seleccionar una opción
      if (window.innerWidth <= 720 && document.body.classList.contains('sidebar--open')) {
        document.body.classList.remove('sidebar--open');
        $('#sidebarToggle')?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }

      // Abre o cierra el drawer según el botón clickeado.
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