/**
 * ADMIN DATA - Gestión de datos para el panel de administración
 * Maneja CRUD de: usuarios, perfiles, carreras, materias, 
 * calendario, eventos, notificaciones, novedades, reglamentación
 */

class AdminData {
  constructor() {
    // Recupera la sesión del administrador al crear la instancia
    this.session = this.getSession();
  }

  // Lee los datos de sesión guardados en el navegador por el login
  getSession() {
    try {
      return JSON.parse(localStorage.getItem('cedSession'));
    } catch {
      return null;
    }
  }

  // ==================== USUARIOS ====================
  // Pide a la API la lista completa de usuarios (alumnos, docentes, etc.)
  async obtenerUsuarios() {
    try {
      return await Usuarios.listar();
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  // Busca un usuario específico por su ID único
  async obtenerUsuario(id) {
    try {
      return await Usuarios.obtener(id);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  // Envía los datos a la API para crear un nuevo usuario con validación previa
  async crearUsuario(data) {
    try {
      // Validación mínima
      if (!data.usuario || !data.email || !data.password) {
        throw new Error('Usuario, email y contraseña son requeridos');
      }
      return await Usuarios.crear(data);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // Modifica los datos de un usuario existente
  async actualizarUsuario(id, data) {
    try {
      return await Usuarios.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Borra permanentemente un usuario del sistema
  async eliminarUsuario(id) {
    try {
      return await Usuarios.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  // ==================== PERFILES ====================
  // Obtiene los roles del sistema (Admin, Docente, Alumno, Delegado)
  async obtenerPerfiles() {
    try {
      return await Perfiles.listar();
    } catch (error) {
      console.error('Error al obtener perfiles:', error);
      throw error;
    }
  }

  // Crea un nuevo tipo de perfil o rol
  async crearPerfil(data) {
    try {
      if (!data.nombre) throw new Error('El nombre del perfil es requerido');
      return await Perfiles.crear(data);
    } catch (error) {
      console.error('Error al crear perfil:', error);
      throw error;
    }
  }

  // Actualiza el nombre o descripción de un rol
  async actualizarPerfil(id, data) {
    try {
      return await Perfiles.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }

  // Elimina un rol del sistema
  async eliminarPerfil(id) {
    try {
      return await Perfiles.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar perfil:', error);
      throw error;
    }
  }

  // ==================== CARRERAS ====================
  // Trae todas las carreras que dicta el instituto
  async obtenerCarreras() {
    try {
      return await Carreras.listar();
    } catch (error) {
      console.error('Error al obtener carreras:', error);
      throw error;
    }
  }

  // Registra una nueva carrera en la oferta académica
  async crearCarrera(data) {
    try {
      if (!data.nombre || !data.codigo) throw new Error('Nombre y código son requeridos');
      return await Carreras.crear(data);
    } catch (error) {
      console.error('Error al crear carrera:', error);
      throw error;
    }
  }

  // Cambia el nombre o código de una carrera existente
  async actualizarCarrera(id, data) {
    try {
      return await Carreras.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar carrera:', error);
      throw error;
    }
  }

  // Quita una carrera de la base de datos
  async eliminarCarrera(id) {
    try {
      return await Carreras.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar carrera:', error);
      throw error;
    }
  }

  // ==================== MATERIAS ====================
  // Lista todas las materias de todas las carreras
  async obtenerMaterias() {
    try {
      return await Materias.listar();
    } catch (error) {
      console.error('Error al obtener materias:', error);
      throw error;
    }
  }

  // Crea una materia nueva vinculándola a una carrera
  async crearMateria(data) {
    try {
      if (!data.nombre || !data.codigo) throw new Error('Nombre y código son requeridos');
      return await Materias.crear(data);
    } catch (error) {
      console.error('Error al crear materia:', error);
      throw error;
    }
  }

  // Edita los datos de una materia (nombre, docente asignado, etc.)
  async actualizarMateria(id, data) {
    try {
      return await Materias.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar materia:', error);
      throw error;
    }
  }

  // Elimina una materia
  async eliminarMateria(id) {
    try {
      return await Materias.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar materia:', error);
      throw error;
    }
  }

  // ==================== CALENDARIO ====================
  // Obtiene todas las fechas del calendario académico
  async obtenerCalendario() {
    try {
      return await Calendario.listar();
    } catch (error) {
      console.error('Error al obtener calendario:', error);
      throw error;
    }
  }

  // Crea una nueva fecha (examen, feriado, inscripción)
  async crearEventoCalendario(data) {
    try {
      if (!data.fecha || !data.titulo) throw new Error('Fecha y título son requeridos');
      return await Calendario.crear(data);
    } catch (error) {
      console.error('Error al crear evento de calendario:', error);
      throw error;
    }
  }

  // Modifica una fecha ya existente en el calendario
  async actualizarEventoCalendario(id, data) {
    try {
      return await Calendario.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar evento de calendario:', error);
      throw error;
    }
  }

  // Quita una fecha del calendario
  async eliminarEventoCalendario(id) {
    try {
      return await Calendario.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar evento de calendario:', error);
      throw error;
    }
  }

  // ==================== EVENTOS ====================
  // Obtiene los eventos sociales/culturales del Centro de Estudiantes
  async obtenerEventos() {
    try {
      return await Eventos.listar();
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw error;
    }
  }

  // Publica un nuevo evento para que los alumnos se inscriban
  async crearEvento(data) {
    try {
      if (!data.titulo) throw new Error('El título es requerido');
      return await Eventos.crear(data);
    } catch (error) {
      console.error('Error al crear evento:', error);
      throw error;
    }
  }

  // Actualiza datos de un evento (lugar, fecha, cupo)
  async actualizarEvento(id, data) {
    try {
      return await Eventos.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      throw error;
    }
  }

  // Elimina un evento y sus inscripciones
  async eliminarEvento(id) {
    try {
      return await Eventos.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      throw error;
    }
  }

  // ==================== NOTIFICACIONES ====================
  // Trae el historial de notificaciones del sistema
  async obtenerNotificaciones() {
    try {
      return await Notificaciones.listar();
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  }

  // Envía una nueva notificación a los usuarios
  async crearNotificacion(data) {
    try {
      if (!data.titulo) throw new Error('El título es requerido');
      return await Notificaciones.crear(data);
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  }

  // Edita una notificación enviada
  async actualizarNotificacion(id, data) {
    try {
      return await Notificaciones.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      throw error;
    }
  }

  // Borra una notificación
  async eliminarNotificacion(id) {
    try {
      return await Notificaciones.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  }

  // ==================== NOVEDADES ====================
  // Trae todas las noticias publicadas en el feed
  async obtenerNovedades() {
    try {
      return await Novedades.listar();
    } catch (error) {
      console.error('Error al obtener novedades:', error);
      throw error;
    }
  }

  // Crea y publica una nueva noticia o aviso
  async crearNovedad(data) {
    try {
      if (!data.titulo) throw new Error('El título es requerido');
      return await Novedades.crear(data);
    } catch (error) {
      console.error('Error al crear novedad:', error);
      throw error;
    }
  }

  // Edita el contenido de una novedad
  async actualizarNovedad(id, data) {
    try {
      return await Novedades.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar novedad:', error);
      throw error;
    }
  }

  // Elimina una novedad del sistema
  async eliminarNovedad(id) {
    try {
      return await Novedades.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar novedad:', error);
      throw error;
    }
  }

  // ==================== REGLAMENTACIÓN ====================
  // Lista todos los documentos normativos cargados
  async obtenerReglamentacion() {
    try {
      return await Reglamentacion.listar();
    } catch (error) {
      console.error('Error al obtener reglamentación:', error);
      throw error;
    }
  }

  // Sube la información de un nuevo reglamento (título, link, etc.)
  async crearReglamento(data) {
    try {
      if (!data.titulo) throw new Error('El título es requerido');
      return await Reglamentacion.crear(data);
    } catch (error) {
      console.error('Error al crear reglamento:', error);
      throw error;
    }
  }

  // Actualiza la información de un reglamento existente
  async actualizarReglamento(id, data) {
    try {
      return await Reglamentacion.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar reglamento:', error);
      throw error;
    }
  }

  // Borra un reglamento del repositorio
  async eliminarReglamento(id) {
    try {
      return await Reglamentacion.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar reglamento:', error);
      throw error;
    }
  }

  // ==================== UTILIDADES ====================
  
  /**
   * Carga todos los datos locales en la API
   */
  async cargarTodosDatos() {
    try {
      return await cargarDatosEnAPI();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      throw error;
    }
  }

  /**
   * Carga un recurso específico desde archivo local
   */
  async cargarRecurso(nombreArchivo, apiModulo) {
    try {
      return await cargarRecursoLocal(nombreArchivo, apiModulo);
    } catch (error) {
      console.error(`Error al cargar ${nombreArchivo}:`, error);
      throw error;
    }
  }

  /**
   * Valida permisos del usuario actual
   */
  tienePermiso(recurso) {
    if (!this.session) return false;
    
    const rol = this.session.rol?.toLowerCase();
    
    // Admin tiene todos los permisos
    if (rol === 'admin' || rol === 'administrador') return true;
    
    // Docente puede acceder a: usuarios, materias, notificaciones, eventos
    if (rol === 'docente') {
      return ['usuarios', 'materias', 'notificaciones', 'eventos', 'carreras'].includes(recurso);
    }
    
    // Delegado puede acceder a: eventos, notificaciones, novedades
    if (rol === 'delegado') {
      return ['eventos', 'notificaciones', 'novedades'].includes(recurso);
    }
    
    return false;
  }
}

// Crear instancia global
const adminData = new AdminData();

// Exponer a nivel global (navegador)
if (typeof window !== 'undefined') {
  window.adminData = adminData;
}
