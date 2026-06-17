/**
 * API CLIENT - Centro de Estudiantes
 * Maneja todas las comunicaciones con la API remota
 * Autenticación: Basic Auth
 */

// Configuración central de la API: URL base y credenciales de acceso
const API_CONFIG = {
  baseURL: 'https://centro-de-estudiantes-api.vercel.app',
  credentials: {
    user: 'grupo1',
    pass: 'PassGrupo1'
  }
};

/**
 * Crea el encabezado (header) necesario para la autenticación Basic Auth.
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
 * Función central que realiza las peticiones HTTP (fetch).
 * Se encarga de la URL, el método, los headers de seguridad y la conversión a JSON.
 * Función genérica para hacer requests
 */
async function request(endpoint, method = 'GET', body = null) {
  try {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const options = {
      method,
      headers: getAuthHeader()
    };

    // Si enviamos datos (POST o PUT), los convertimos a una cadena de texto JSON
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    // Si la respuesta no es exitosa (ej. 404 o 500), lanzamos un error con el mensaje del servidor
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Si todo salió bien, devolvemos los datos convertidos a objeto JS
    return await response.json();
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * ==================== CALENDARIO ====================
 */
// Métodos para gestionar las fechas académicas
const Calendario = {
  // Trae todos los eventos del calendario
  async listar() {
    return await request('/calendario');
  },
  // Trae un evento específico por su ID
  async obtener(id) {
    return await request(`/calendario/${id}`);
  },
  // Crea un nuevo evento académico
  async crear(data) {
    return await request('/calendario', 'POST', data);
  },
  // Actualiza los datos de una fecha existente
  async actualizar(id, data) {
    return await request(`/calendario/${id}`, 'PUT', data);
  },
  // Borra una fecha del calendario
  async eliminar(id) {
    return await request(`/calendario/${id}`, 'DELETE');
  }
};

/**
 * ==================== CARRERAS ====================
 */
// Métodos para gestionar la oferta académica (ej. Tecnicaturas, Profesorados)
const Carreras = {
  // Lista todas las carreras
  async listar() {
    return await request('/carreras');
  },
  // Trae info de una carrera por ID
  async obtener(id) {
    return await request(`/carreras/${id}`);
  },
  // Registra una nueva carrera
  async crear(data) {
    return await request('/carreras', 'POST', data);
  },
  // Edita nombre o código de una carrera
  async actualizar(id, data) {
    return await request(`/carreras/${id}`, 'PUT', data);
  },
  // Elimina una carrera del sistema
  async eliminar(id) {
    return await request(`/carreras/${id}`, 'DELETE');
  }
};

/**
 * ==================== EVENTOS ====================
 */
// Métodos para gestionar eventos del Centro de Estudiantes
const Eventos = {
  // Lista todos los eventos publicados
  async listar() {
    return await request('/eventos');
  },
  // Detalles de un evento (lugar, cupo, etc.)
  async obtener(id) {
    return await request(`/eventos/${id}`);
  },
  // Crea y publica un nuevo evento
  async crear(data) {
    return await request('/eventos', 'POST', data);
  },
  // Modifica los datos de un evento
  async actualizar(id, data) {
    return await request(`/eventos/${id}`, 'PUT', data);
  },
  // Borra un evento
  async eliminar(id) {
    return await request(`/eventos/${id}`, 'DELETE');
  }
};

/**
 * ==================== MATERIAS ====================
 */
// Métodos para gestionar las materias de las carreras
const Materias = {
  // Lista todas las materias cargadas
  async listar() {
    return await request('/materias');
  },
  // Info de una materia (docente, días, etc.)
  async obtener(id) {
    return await request(`/materias/${id}`);
  },
  // Registra una nueva materia vinculada a una carrera
  async crear(data) {
    return await request('/materias', 'POST', data);
  },
  // Actualiza datos de cursada de una materia
  async actualizar(id, data) {
    return await request(`/materias/${id}`, 'PUT', data);
  },
  // Elimina una materia
  async eliminar(id) {
    return await request(`/materias/${id}`, 'DELETE');
  }
};

/**
 * ==================== NOTIFICACIONES ====================
 */
// Métodos para el sistema de alertas del portal
const Notificaciones = {
  // Trae el historial de notificaciones
  async listar() {
    return await request('/notificaciones');
  },
  // Obtiene una notificación específica
  async obtener(id) {
    return await request(`/notificaciones/${id}`);
  },
  // Crea y envía una notificación a los usuarios
  async crear(data) {
    return await request('/notificaciones', 'POST', data);
  },
  // Marca como leída o edita una notificación
  async actualizar(id, data) {
    return await request(`/notificaciones/${id}`, 'PUT', data);
  },
  // Borra una notificación
  async eliminar(id) {
    return await request(`/notificaciones/${id}`, 'DELETE');
  }
};

/**
 * ==================== NOVEDADES ====================
 */
// Métodos para el feed de noticias/novedades
const Novedades = {
  // Trae todas las noticias publicadas
  async listar() {
    return await request('/novedades');
  },
  // Obtiene el contenido de una noticia por ID
  async obtener(id) {
    return await request(`/novedades/${id}`);
  },
  // Publica una nueva noticia
  async crear(data) {
    return await request('/novedades', 'POST', data);
  },
  // Edita una noticia (ej. cambiar si está destacada)
  async actualizar(id, data) {
    return await request(`/novedades/${id}`, 'PUT', data);
  },
  // Elimina una noticia del feed
  async eliminar(id) {
    return await request(`/novedades/${id}`, 'DELETE');
  }
};

/**
 * ==================== PERFILES ====================
 */
// Métodos para gestionar los roles (Admin, Docente, Alumno, Delegado)
const Perfiles = {
  // Lista los tipos de perfiles disponibles
  async listar() {
    return await request('/perfiles');
  },
  // Info de un perfil específico
  async obtener(id) {
    return await request(`/perfiles/${id}`);
  },
  // Crea un nuevo tipo de rol
  async crear(data) {
    return await request('/perfiles', 'POST', data);
  },
  // Edita permisos o nombre de un rol
  async actualizar(id, data) {
    return await request(`/perfiles/${id}`, 'PUT', data);
  },
  // Elimina un rol
  async eliminar(id) {
    return await request(`/perfiles/${id}`, 'DELETE');
  }
};

/**
 * ==================== REGLAMENTACIÓN ====================
 */
// Métodos para el repositorio de documentos oficiales
const Reglamentacion = {
  // Lista todos los documentos normativos
  async listar() {
    return await request('/reglamentacion');
  },
  // Detalles de un documento y su link
  async obtener(id) {
    return await request(`/reglamentacion/${id}`);
  },
  // Sube información de un nuevo reglamento
  async crear(data) {
    return await request('/reglamentacion', 'POST', data);
  },
  // Actualiza versión o descripción de un documento
  async actualizar(id, data) {
    return await request(`/reglamentacion/${id}`, 'PUT', data);
  },
  // Quita un documento del repositorio
  async eliminar(id) {
    return await request(`/reglamentacion/${id}`, 'DELETE');
  }
};

/**
 * ==================== USUARIOS ====================
 */
// Métodos para la gestión de cuentas de usuario
const Usuarios = {
  // Lista todas las cuentas del sistema
  async listar() {
    return await request('/usuarios');
  },
  // Info de perfil de un usuario
  async obtener(id) {
    return await request(`/usuarios/${id}`);
  },
  // Crea una nueva cuenta (estudiante, docente, etc.)
  async crear(data) {
    return await request('/usuarios', 'POST', data);
  },
  // Actualiza datos (email, password, estado activo)
  async actualizar(id, data) {
    return await request(`/usuarios/${id}`, 'PUT', data);
  },
  // Borra un usuario permanentemente
  async eliminar(id) {
    return await request(`/usuarios/${id}`, 'DELETE');
  }
};

/**
 * ==================== INSCRIPCIONES ====================
 */
// Métodos para manejar el registro de alumnos a eventos
const Inscripciones = {
  // Lista todas las inscripciones realizadas
  async listar() {
    return await request('/inscripciones');
  },
  // Registra a un alumno en un evento
  async crear(data) {
    return await request('/inscripciones', 'POST', data);
  },
  // Cancela una inscripción
  async eliminar(id) {
    return await request(`/inscripciones/${id}`, 'DELETE');
  }
};

/**
 * ==================== CARGA DE DATOS LOCALES ====================
 * Funciones para subir datos desde los archivos JSON locales
 */

// Función de conveniencia que recorre todos los archivos JSON locales 
// y los sube uno por uno a la API remota.
async function cargarDatosEnAPI() {
  const recursos = [
    { nombre: 'Usuarios', archivo: '../json/usuarios.json', apiModulo: Usuarios, campo: 'usuarios' },
    { nombre: 'Perfiles', archivo: '../json/perfiles.json', apiModulo: Perfiles, campo: 'perfiles' },
    { nombre: 'Carreras', archivo: '../json/carreras.json', apiModulo: Carreras, campo: null },
    { nombre: 'Materias', archivo: '../json/materias.json', apiModulo: Materias, campo: 'materias' },
    { nombre: 'Calendario', archivo: '../json/calendario.json', apiModulo: Calendario, campo: 'eventos_calendario' },
    { nombre: 'Eventos', archivo: '../json/eventos.json', apiModulo: Eventos, campo: null },
    { nombre: 'Notificaciones', archivo: '../json/notificaciones.json', apiModulo: Notificaciones, campo: 'notificaciones' },
    { nombre: 'Novedades', archivo: '../json/novedades.json', apiModulo: Novedades, campo: 'novedades' },
    { nombre: 'Reglamentación', archivo: '../json/reglamentacion.json', apiModulo: Reglamentacion, campo: 'reglamentos' }
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
// Lee un archivo JSON específico y sube cada uno de sus elementos al módulo de la API indicado.
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

// --- EXPORTACIÓN ---
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
