/**
 * API CLIENT - Centro de Estudiantes
 * Maneja todas las comunicaciones con la API remota
 * Autenticación: Basic Auth
 */

const API_CONFIG = {
  baseURL: 'https://centro-de-estudiantes-api.vercel.app',
  credentials: {
    user: 'grupo1',
    pass: 'PassGrupo1'
  }
};

/**
 * Genera el header de autenticación Basic Auth
 */
function getAuthHeader() {
  const credentials = `${API_CONFIG.credentials.user}:${API_CONFIG.credentials.pass}`;
  const encoded = btoa(credentials);
  return {
    'Authorization': `Basic ${encoded}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Función genérica para hacer requests
 */
async function request(endpoint, method = 'GET', body = null) {
  try {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const options = {
      method,
      headers: getAuthHeader()
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * ==================== CALENDARIO ====================
 */
const Calendario = {
  async listar() {
    return await request('/calendario');
  },
  async obtener(id) {
    return await request(`/calendario/${id}`);
  },
  async crear(data) {
    return await request('/calendario', 'POST', data);
  },
  async actualizar(id, data) {
    return await request(`/calendario/${id}`, 'PUT', data);
  },
  async eliminar(id) {
    return await request(`/calendario/${id}`, 'DELETE');
  }
};

/**
 * ==================== CARRERAS ====================
 */
const Carreras = {
  async listar() {
    return await request('/carreras');
  },
  async obtener(id) {
    return await request(`/carreras/${id}`);
  },
  async crear(data) {
    return await request('/carreras', 'POST', data);
  },
  async actualizar(id, data) {
    return await request(`/carreras/${id}`, 'PUT', data);
  },
  async eliminar(id) {
    return await request(`/carreras/${id}`, 'DELETE');
  }
};

/**
 * ==================== EVENTOS ====================
 */
const Eventos = {
  async listar() {
    return await request('/eventos');
  },
  async obtener(id) {
    return await request(`/eventos/${id}`);
  },
  async crear(data) {
    return await request('/eventos', 'POST', data);
  },
  async actualizar(id, data) {
    return await request(`/eventos/${id}`, 'PUT', data);
  },
  async eliminar(id) {
    return await request(`/eventos/${id}`, 'DELETE');
  }
};

/**
 * ==================== MATERIAS ====================
 */
const Materias = {
  async listar() {
    return await request('/materias');
  },
  async obtener(id) {
    return await request(`/materias/${id}`);
  },
  async crear(data) {
    return await request('/materias', 'POST', data);
  },
  async actualizar(id, data) {
    return await request(`/materias/${id}`, 'PUT', data);
  },
  async eliminar(id) {
    return await request(`/materias/${id}`, 'DELETE');
  }
};

/**
 * ==================== NOTIFICACIONES ====================
 */
const Notificaciones = {
  async listar() {
    return await request('/notificaciones');
  },
  async obtener(id) {
    return await request(`/notificaciones/${id}`);
  },
  async crear(data) {
    return await request('/notificaciones', 'POST', data);
  },
  async actualizar(id, data) {
    return await request(`/notificaciones/${id}`, 'PUT', data);
  },
  async eliminar(id) {
    return await request(`/notificaciones/${id}`, 'DELETE');
  }
};

/**
 * ==================== NOVEDADES ====================
 */
const Novedades = {
  async listar() {
    return await request('/novedades');
  },
  async obtener(id) {
    return await request(`/novedades/${id}`);
  },
  async crear(data) {
    return await request('/novedades', 'POST', data);
  },
  async actualizar(id, data) {
    return await request(`/novedades/${id}`, 'PUT', data);
  },
  async eliminar(id) {
    return await request(`/novedades/${id}`, 'DELETE');
  }
};

/**
 * ==================== PERFILES ====================
 */
const Perfiles = {
  async listar() {
    return await request('/perfiles');
  },
  async obtener(id) {
    return await request(`/perfiles/${id}`);
  },
  async crear(data) {
    return await request('/perfiles', 'POST', data);
  },
  async actualizar(id, data) {
    return await request(`/perfiles/${id}`, 'PUT', data);
  },
  async eliminar(id) {
    return await request(`/perfiles/${id}`, 'DELETE');
  }
};

/**
 * ==================== REGLAMENTACIÓN ====================
 */
const Reglamentacion = {
  async listar() {
    return await request('/reglamentacion');
  },
  async obtener(id) {
    return await request(`/reglamentacion/${id}`);
  },
  async crear(data) {
    return await request('/reglamentacion', 'POST', data);
  },
  async actualizar(id, data) {
    return await request(`/reglamentacion/${id}`, 'PUT', data);
  },
  async eliminar(id) {
    return await request(`/reglamentacion/${id}`, 'DELETE');
  }
};

/**
 * ==================== USUARIOS ====================
 */
const Usuarios = {
  async listar() {
    return await request('/usuarios');
  },
  async obtener(id) {
    return await request(`/usuarios/${id}`);
  },
  async crear(data) {
    return await request('/usuarios', 'POST', data);
  },
  async actualizar(id, data) {
    return await request(`/usuarios/${id}`, 'PUT', data);
  },
  async eliminar(id) {
    return await request(`/usuarios/${id}`, 'DELETE');
  }
};

/**
 * ==================== INSCRIPCIONES ====================
 */
const Inscripciones = {
  async listar() {
    return await request('/inscripciones');
  },
  async crear(data) {
    return await request('/inscripciones', 'POST', data);
  },
  async eliminar(id) {
    return await request(`/inscripciones/${id}`, 'DELETE');
  }
};

/**
 * ==================== CARGA DE DATOS LOCALES ====================
 * Funciones para subir datos desde los archivos JSON locales
 */

async function cargarDatosEnAPI() {
  const recursos = [
    { nombre: 'Usuarios', archivo: 'json/usuarios.json', apiModulo: Usuarios, campo: 'usuarios' },
    { nombre: 'Perfiles', archivo: 'json/perfiles.json', apiModulo: Perfiles, campo: 'perfiles' },
    { nombre: 'Carreras', archivo: 'json/carreras.json', apiModulo: Carreras, campo: null },
    { nombre: 'Materias', archivo: 'json/materias.json', apiModulo: Materias, campo: 'materias' },
    { nombre: 'Calendario', archivo: 'json/calendario.json', apiModulo: Calendario, campo: 'eventos_calendario' },
    { nombre: 'Eventos', archivo: 'json/eventos.json', apiModulo: Eventos, campo: null },
    { nombre: 'Notificaciones', archivo: 'json/notificaciones.json', apiModulo: Notificaciones, campo: 'notificaciones' },
    { nombre: 'Novedades', archivo: 'json/novedades.json', apiModulo: Novedades, campo: 'novedades' },
    { nombre: 'Reglamentación', archivo: 'json/reglamentacion.json', apiModulo: Reglamentacion, campo: 'reglamentos' }
  ];

  const resultados = {
    exitosos: [],
    errores: []
  };

  for (const recurso of recursos) {
    try {
      const response = await fetch(recurso.archivo);
      if (!response.ok) throw new Error(`No se pudo cargar ${recurso.archivo}`);
      
      let data = await response.json();
      
      // Si el JSON tiene un campo específico, extraerlo
      if (recurso.campo) {
        data = data[recurso.campo];
      }

      // Si es un array, iterar y crear cada registro
      if (Array.isArray(data)) {
        for (const item of data) {
          try {
            await recurso.apiModulo.crear(item);
            resultados.exitosos.push(`${recurso.nombre}: ${item.nombre || item.titulo || item.codigo || item.id}`);
          } catch (error) {
            resultados.errores.push(`${recurso.nombre} (${item.id}): ${error.message}`);
          }
        }
      } else {
        // Si es un objeto único, crearlo
        try {
          await recurso.apiModulo.crear(data);
          resultados.exitosos.push(`${recurso.nombre} creado`);
        } catch (error) {
          resultados.errores.push(`${recurso.nombre}: ${error.message}`);
        }
      }
    } catch (error) {
      resultados.errores.push(`${recurso.nombre}: ${error.message}`);
    }
  }

  return resultados;
}

/**
 * Función para cargar un recurso específico desde archivo local
 */
async function cargarRecursoLocal(nombreArchivo, apiModulo) {
  try {
    const response = await fetch(nombreArchivo);
    if (!response.ok) throw new Error(`No se pudo cargar ${nombreArchivo}`);
    
    let data = await response.json();

    // Detectar si es un objeto con array dentro
    const valores = Object.values(data);
    if (valores.length === 1 && Array.isArray(valores[0])) {
      data = valores[0];
    }

    if (!Array.isArray(data)) {
      data = [data];
    }

    const resultados = [];
    for (const item of data) {
      try {
        const resultado = await apiModulo.crear(item);
        resultados.push({ exito: true, item: resultado });
      } catch (error) {
        resultados.push({ exito: false, error: error.message, item });
      }
    }

    return resultados;
  } catch (error) {
    console.error(`Error cargando ${nombreArchivo}:`, error.message);
    throw error;
  }
}

// Exportar para uso en módulos (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    request,
    Calendario,
    Carreras,
    Eventos,
    Materias,
    Notificaciones,
    Novedades,
    Perfiles,
    Reglamentacion,
    Usuarios,
    Inscripciones,
    cargarDatosEnAPI,
    cargarRecursoLocal
  };
}

// Exportar a nivel global (navegador)
if (typeof window !== 'undefined') {
  window.request = request;
  window.Calendario = Calendario;
  window.Carreras = Carreras;
  window.Eventos = Eventos;
  window.Materias = Materias;
  window.Notificaciones = Notificaciones;
  window.Novedades = Novedades;
  window.Perfiles = Perfiles;
  window.Reglamentacion = Reglamentacion;
  window.Usuarios = Usuarios;
  window.Inscripciones = Inscripciones;
  window.cargarDatosEnAPI = cargarDatosEnAPI;
  window.cargarRecursoLocal = cargarRecursoLocal;
}
