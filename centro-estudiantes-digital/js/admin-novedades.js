/* ================================================================
   NOVEDADES ADMIN: Gestión del módulo de novedades para admin
================================================================ */

const NovedadesAdmin = (() => {
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

  function createNovedadRow(novedad, categorias) {
    const cat = categorias.find(c => c.id === novedad.categoria_id);
    const row = document.createElement('div');
    row.className = 'modulo-item';

    const estado = novedad.destacada ? 'Destacada' : 'Normal';
    const detalles = [];
    if (novedad.materia) detalles.push(`📚 ${novedad.materia}`);
    if (novedad.carrera) detalles.push(`🎓 ${novedad.carrera}`);
    if (novedad.adjunto) detalles.push(`📎 ${novedad.adjunto}`);
    detalles.push(`${formatearFecha(novedad.fecha)}`);

    row.innerHTML = `
      <div class="modulo-item__info">
        <p class="modulo-item__titulo">${novedad.titulo}</p>
        <p class="modulo-item__detalle">
          <span style="color:${cat?.color || '#999'};font-weight:600">${cat?.nombre || 'General'}</span>
          · ${detalles.join(' · ')}
        </p>
      </div>
      <span class="modulo-item__estado ${novedad.destacada ? 'modulo-item__estado--featured' : ''}">
        ${estado}
      </span>
    `;

    return row;
  }

  function renderNovedades(novedades, categorias, containerId = 'modulo-novedades') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (novedades.length === 0) {
      container.innerHTML = '<p style="text-align:center;padding:2rem;color:#8a8d9c;font-family:Manrope,sans-serif">Sin novedades en el sistema.</p>';
      return;
    }

    const lista = document.createElement('div');
    lista.className = 'modulo-list';

    novedades.forEach(nov => {
      const row = createNovedadRow(nov, categorias);
      lista.appendChild(row);
    });

    container.appendChild(lista);
  }

  async function init(options = {}) {
    const {
      apiPath = 'json/novedades.json',
      containerId = 'modulo-novedades',
      sortByDate = true
    } = options;

    const data = await loadNovedades(apiPath);
    allNovedades = data.novedades || [];
    allCategorias = data.categorias || [];

    if (sortByDate) {
      allNovedades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    renderNovedades(allNovedades, allCategorias, containerId);
  }

  return {
    init,
    render: renderNovedades
  };
})();
