/* ================================================================
   PUBLICACIONES DOCENTES: Gestión de publicaciones por tipo
================================================================ */

const PublicacionesDocentes = (() => {
  let allPublicaciones = [];

  function createPublicacionItem(pub) {
    const colorMap = {
      aviso: '#F5A623',
      material: '#4A67C9',
      evaluacion: '#E67E5B',
      calificacion: '#3DAA6A'
    };

    const iconMap = {
      aviso:        '<svg viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" stroke-linecap="round"/></svg>',
      material:     '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6"/></svg>',
      evaluacion:   '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M9 14l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      calificacion: '<svg viewBox="0 0 24 24"><path d="M12 2l2.6 5.3 5.9.9-4.3 4.2 1 5.8L12 15.5 6.8 18.2l1-5.8L3.5 8.2l5.9-.9z"/></svg>'
    };

    const item = document.createElement('article');
    item.className = 'pub-item';
    item.style.setProperty('--pub-color', colorMap[pub.tipo] || '#4A67C9');

    item.innerHTML = `
      <div class="pub-item__icon">${iconMap[pub.tipo] || iconMap.aviso}</div>
      <div>
        <div class="pub-item__head">
          <span class="pub-item__type">${pub.tipo}</span>
          <span class="pub-item__time">· ${pub.hace}</span>
        </div>
        <h4 class="pub-item__title">${pub.titulo}</h4>
        <p class="pub-item__excerpt">${pub.extracto}</p>
        <p class="pub-item__excerpt" style="margin-top:.3rem;font-size:.74rem;color:#8a8d9c">📚 ${pub.curso}</p>
      </div>
      <div class="pub-item__meta">
        <span class="pub-item__reach">
          <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" stroke-linecap="round"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14c2.7 0 5 1.7 5 4" stroke-linecap="round"/></svg>
          ${pub.alcance} alumnos
        </span>
        <span>${pub.lecturas} lecturas</span>
      </div>
    `;

    return item;
  }

  function renderPublicaciones(publicaciones, containerId = 'pubList', filtro = 'todas') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const filtradas = filtro === 'todas'
      ? publicaciones
      : publicaciones.filter(p => p.tipo === filtro);

    if (filtradas.length === 0) {
      container.innerHTML = '<p style="text-align:center;padding:2rem;color:#8a8d9c;font-family:Manrope,sans-serif">Sin publicaciones para este filtro.</p>';
      return;
    }

    filtradas.forEach(pub => {
      const item = createPublicacionItem(pub);
      container.appendChild(item);
    });
  }

  function initializeFilters(publicaciones, filterId = 'pubFilters', listId = 'pubList') {
    const filters = document.getElementById(filterId);
    if (!filters) return;

    const tiposDisponibles = [...new Set(publicaciones.map(p => p.tipo))];

    document.querySelectorAll(`#${filterId} .chip`).forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll(`#${filterId} .chip`).forEach(c => c.classList.remove('chip--active'));
        chip.classList.add('chip--active');
        renderPublicaciones(allPublicaciones, listId, chip.dataset.filter);
      });
    });
  }

  function init(publicaciones, options = {}) {
    const {
      filterId = 'pubFilters',
      listId = 'pubList',
      sortByDate = true
    } = options;

    allPublicaciones = publicaciones || [];

    if (sortByDate) {
      allPublicaciones.sort((a, b) => a.id - b.id);
    }

    initializeFilters(allPublicaciones, filterId, listId);
    renderPublicaciones(allPublicaciones, listId, 'todas');
  }

  return {
    init,
    render: renderPublicaciones
  };
})();
