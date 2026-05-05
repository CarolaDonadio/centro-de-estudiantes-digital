/**
 * novedades-filtro.js
 * Módulo para filtrar y validar permisos de novedades según rol de usuario
 * 
 * Responsabilidad única: Lógica de acceso y visibilidad de novedades
 * Importar en otros módulos: import { filtrarNovedades, puedeCrear } from './novedades-filtro.js'
 */

/**
 * Filtra novedades visibles para el usuario según su rol y carrera/materia
 * @param {Array} novedades - Array de objetos novedad
 * @param {Object} usuario - Objeto usuario autenticado { id, rol, carrera_id, materias: [...] }
 * @returns {Array} Novedades filtradas que el usuario puede ver
 */
export function filtrarNovedadesParaUsuario(novedades, usuario) {
  if (!usuario) return [];
  if (!Array.isArray(novedades)) return [];

  return novedades.filter(novedad => puedeVerNovedad(novedad, usuario));
}

/**
 * Valida si un usuario puede ver una novedad específica
 * @param {Object} novedad - Novedad a verificar
 * @param {Object} usuario - Usuario autenticado
 * @returns {Boolean}
 */
export function puedeVerNovedad(novedad, usuario) {
  const { visibilidad, carrera_id, materia_id, requiere_carrera, requiere_materia } = novedad;
  const { rol, carrera_id: usuarioCarrera, materias = [] } = usuario;

  switch (visibilidad) {
    case 'public':
      return true;

    case 'carrera':
      if (requiere_carrera && carrera_id === null) {
        return false;
      }
      return !requiere_carrera || carrera_id === usuarioCarrera;

    case 'materia':
      if (requiere_materia && materia_id === null) {
        return false;
      }
      return !requiere_materia || materias.includes(materia_id);

    case 'delegados':
      return ['delegado', 'admin'].includes(rol);

    case 'admin':
      return rol === 'admin';

    default:
      return false;
  }
}

/**
 * Valida si un usuario puede crear un tipo de novedad
 * @param {Object} usuario - Usuario autenticado
 * @param {Object} tipoNovedad - Configuración de novedad { puede_crear, requiere_materia, materia_id }
 * @returns {Boolean}
 */
export function puedeCrearNovedad(usuario, tipoNovedad) {
  const { rol } = usuario;
  const { puede_crear = [], requiere_materia = false, materia_id = null } = tipoNovedad;

  if (!puede_crear.includes(rol)) {
    return false;
  }

  // Si requiere materia, validar que el docente enseña esa materia
  if (requiere_materia && rol === 'docente') {
    const { materias = [] } = usuario;
    return materias.includes(materia_id);
  }

  return true;
}

/**
 * Valida una novedad antes de ser creada/editada
 * @param {Object} novedad - Objeto novedad a validar
 * @param {Object} usuario - Usuario que intenta crear/editar
 * @returns {Object} { valido: Boolean, errores: String[] }
 */
export function validarNovedadCreada(novedad, usuario) {
  const errores = [];

  // Validaciones básicas
  if (!novedad.titulo || novedad.titulo.trim().length === 0) {
    errores.push('El título no puede estar vacío');
  } else if (novedad.titulo.length > 200) {
    errores.push('El título no puede exceder 200 caracteres');
  }

  if (!novedad.contenido || novedad.contenido.trim().length === 0) {
    errores.push('El contenido no puede estar vacío');
  }

  if (!novedad.categoria_id) {
    errores.push('Debe seleccionar una categoría');
  }

  // Validaciones de permisos
  if (!puedeCrearNovedad(usuario, novedad)) {
    errores.push('No tienes permisos para crear este tipo de novedad');
  }

  // Validaciones condicionales
  if (novedad.requiere_carrera && !novedad.carrera_id) {
    errores.push('Esta novedad requiere una carrera específica');
  }

  if (novedad.requiere_materia && !novedad.materia_id) {
    errores.push('Esta novedad requiere una materia específica');
  }

  // Validar que materia_id tenga una materia válida si requiere_materia
  if (novedad.requiere_materia && usuario.rol === 'docente') {
    if (!usuario.materias?.includes(novedad.materia_id)) {
      errores.push('No enseñas la materia especificada');
    }
  }

  return {
    valido: errores.length === 0,
    errores
  };
}

/**
 * Agrupa novedades por categoría
 * @param {Array} novedades - Array de novedades
 * @returns {Object} { categoriaId: [novedades...] }
 */
export function agruparPorCategoria(novedades) {
  return novedades.reduce((grupos, novedad) => {
    const catId = novedad.categoria_id;
    if (!grupos[catId]) {
      grupos[catId] = [];
    }
    grupos[catId].push(novedad);
    return grupos;
  }, {});
}

/**
 * Ordena novedades por importancia: destacadas primero, luego por fecha descendente
 * @param {Array} novedades - Array de novedades
 * @returns {Array} Novedades ordenadas
 */
export function ordenarNovedades(novedades) {
  return [...novedades].sort((a, b) => {
    if (a.destacada !== b.destacada) {
      return a.destacada ? -1 : 1;
    }
    return new Date(b.fecha) - new Date(a.fecha);
  });
}

/**
 * Obtiene información de un usuario (simulado; en backend vendría de la BD)
 * Ejemplo de estructura: 
 * { id: 1, nombre: 'Juan', rol: 'alumno', carrera_id: 2, materias: [1, 3, 5] }
 * @returns {Object} Usuario actual (buscar en localStorage o sessionStorage)
 */
export function obtenerUsuarioActual() {
  try {
    const usuarioJSON = sessionStorage.getItem('usuario_actual');
    if (!usuarioJSON) return null;
    return JSON.parse(usuarioJSON);
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    return null;
  }
}

/**
 * Genera HTML para una novedad con componentes reutilizables
 * @param {Object} novedad - Objeto novedad
 * @param {Boolean} mostrarAcciones - Si mostrar botones editar/eliminar
 * @returns {String} HTML de la tarjeta
 */
export function generarHTMLNovedad(novedad, mostrarAcciones = false) {
  const fechaFormato = new Date(novedad.fecha).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const clasesDestacada = novedad.destacada ? 'card-novedad--destacada' : '';
  const adjuntoHTML = novedad.adjunto ? `<p class="novedad-adjunto"><a href="/adjuntos/${novedad.adjunto}" download>📎 ${novedad.adjunto}</a></p>` : '';
  const accionesHTML = mostrarAcciones ? `
    <div class="novedad-acciones">
      <button class="btn-pequeño" data-accion="editar" data-id="${novedad.id}">Editar</button>
      <button class="btn-pequeño btn-peligro" data-accion="eliminar" data-id="${novedad.id}">Eliminar</button>
    </div>
  ` : '';

  return `
    <article class="card-novedad ${clasesDestacada}" data-id="${novedad.id}">
      <header class="novedad-header">
        <h3 class="novedad-titulo">${escapeHTML(novedad.titulo)}</h3>
        <span class="novedad-categoria" style="background-color: ${novedad.categoria_color || '#999'}">
          ${novedad.categoria}
        </span>
      </header>
      <div class="novedad-cuerpo">
        <p class="novedad-contenido">${escapeHTML(novedad.contenido)}</p>
        ${adjuntoHTML}
      </div>
      <footer class="novedad-footer">
        <span class="novedad-autor">Por ${escapeHTML(novedad.autor)}</span>
        <span class="novedad-fecha">${fechaFormato}</span>
        ${accionesHTML}
      </footer>
    </article>
  `;
}

/**
 * Escapa caracteres especiales HTML para prevenir XSS
 * @param {String} texto - Texto a escapar
 * @returns {String} Texto escapado
 */
function escapeHTML(texto) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return texto.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Filtra novedades por rango de fechas
 * @param {Array} novedades - Array de novedades
 * @param {Date} fechaInicio - Fecha inicial (inclusive)
 * @param {Date} fechaFin - Fecha final (inclusive)
 * @returns {Array} Novedades en el rango
 */
export function filtrarPorFecha(novedades, fechaInicio, fechaFin) {
  return novedades.filter(novedad => {
    const fecha = new Date(novedad.fecha);
    return fecha >= fechaInicio && fecha <= fechaFin;
  });
}

/**
 * Busca novedades por texto en título o contenido
 * @param {Array} novedades - Array de novedades
 * @param {String} termino - Término de búsqueda
 * @returns {Array} Novedades coincidentes
 */
export function buscarNovedades(novedades, termino) {
  if (!termino || termino.trim().length === 0) return novedades;

  const terminoLower = termino.toLowerCase();
  return novedades.filter(novedad =>
    novedad.titulo.toLowerCase().includes(terminoLower) ||
    novedad.contenido.toLowerCase().includes(terminoLower)
  );
}
