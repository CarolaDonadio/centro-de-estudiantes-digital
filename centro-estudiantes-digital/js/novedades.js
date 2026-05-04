/* ================================================================
   NOVEDADES MANAGER: Lógica centralizada para todos los usuarios
================================================================ */

const NovedadesManager = (() => {
  let allNovedades = [];
  let allCategorias = [];

  async function loadNovedades(apiPath = 'json/novedades.json') {
    try {
      const res = await fetch(apiPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error loading novedades:', error);
      return { novedades: [], categorias: [] };
    }
  }

  function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function createNewsItem(novedad, categorias) {
    const cat = categorias.find(c => c.id === novedad.categoria_id);
    const item = document.createElement('article');
    item.className = 'news-item';
    if (novedad.destacada) item.classList.add('news-item--featured');

    const fechaFormato = formatearFecha(novedad.fecha);

    let metaHTML = `
      <span class="news-item__category" style="--cat-color:${cat?.color || '#999'}">
        ${cat?.nombre || 'General'}
      </span>
    `;

    if (novedad.materia) {
      metaHTML += `<span class="news-item__materia">📚 ${novedad.materia}</span>`;
    }

    if (novedad.carrera) {
      metaHTML += `<span class="news-item__carrera">🎓 ${novedad.carrera}</span>`;
    }

    metaHTML += `<time class="news-item__date">${fechaFormato}</time>`;

    const adjuntoHTML = novedad.adjunto ? `
      <div class="news-item__attachment">
        <svg viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
        ${novedad.adjunto}
      </div>
    ` : '';

    item.innerHTML = `
      <div class="news-item__header">
        <div class="news-item__meta">
          ${metaHTML}
        </div>
        ${novedad.destacada ? '<span class="news-item__badge">Destacada</span>' : ''}
      </div>
      <h3 class="news-item__title">${novedad.titulo}</h3>
      <p class="news-item__content">${novedad.contenido}</p>
      ${adjuntoHTML}
    `;

    return item;
  }

  function renderNovedades(novedades, categorias, containerId = 'newsList') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (novedades.length === 0) {
      container.innerHTML = '<p style="text-align:center;padding:2rem;color:#8a8d9c;font-family:Manrope,sans-serif">Sin novedades para mostrar.</p>';
      return;
    }

    novedades.forEach(nov => {
      const item = createNewsItem(nov, categorias);
      container.appendChild(item);
    });
  }

  function initializeFilters(categorias, filterId = 'newsFilters', listId = 'newsList') {
    const filters = document.getElementById(filterId);
    if (!filters) return;

    filters.innerHTML = '';

    const btnTodas = document.createElement('button');
    btnTodas.className = 'chip chip--active';
    btnTodas.textContent = 'Todas';
    btnTodas.addEventListener('click', () => {
      document.querySelectorAll(`#${filterId} .chip`).forEach(c => c.classList.remove('chip--active'));
      btnTodas.classList.add('chip--active');
      renderNovedades(allNovedades, allCategorias, listId);
    });
    filters.appendChild(btnTodas);

    categorias.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.textContent = cat.nombre;
      btn.addEventListener('click', () => {
        document.querySelectorAll(`#${filterId} .chip`).forEach(c => c.classList.remove('chip--active'));
        btn.classList.add('chip--active');
        const filtradas = allNovedades.filter(n => n.categoria_id === cat.id);
        renderNovedades(filtradas, allCategorias, listId);
      });
      filters.appendChild(btn);
    });
  }

  async function init(options = {}) {
    const {
      apiPath = 'json/novedades.json',
      listId = 'newsList',
      filterId = 'newsFilters',
      sortByDate = true
    } = options;

    const data = await loadNovedades(apiPath);
    allNovedades = data.novedades || [];
    allCategorias = data.categorias || [];

    if (sortByDate) {
      allNovedades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    initializeFilters(allCategorias, filterId, listId);
    renderNovedades(allNovedades, allCategorias, listId);
  }

  return {
    init,
    render: renderNovedades,
    loadNovedades,
    formatearFecha
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  NovedadesManager.init();
});
