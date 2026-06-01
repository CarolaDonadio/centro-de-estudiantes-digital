/**
 * ADMIN DATA - Gestión de datos para el panel de administración
 * Maneja CRUD de: usuarios, perfiles, carreras, materias, 
 * calendario, eventos, notificaciones, novedades, reglamentación
 */

class AdminData {
  constructor() {
    this.session = this.getSession();
  }

  getSession() {
    try {
      return JSON.parse(localStorage.getItem('cedSession'));
    } catch {
      return null;
    }
  }

  // ==================== USUARIOS ====================
  async obtenerUsuarios() {
    try {
      return await Usuarios.listar();
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  async obtenerUsuario(id) {
    try {
      return await Usuarios.obtener(id);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

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

  async actualizarUsuario(id, data) {
    try {
      return await Usuarios.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  async eliminarUsuario(id) {
    try {
      return await Usuarios.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  // ==================== PERFILES ====================
  async obtenerPerfiles() {
    try {
      return await Perfiles.listar();
    } catch (error) {
      console.error('Error al obtener perfiles:', error);
      throw error;
    }
  }

  async crearPerfil(data) {
    try {
      if (!data.nombre) throw new Error('El nombre del perfil es requerido');
      return await Perfiles.crear(data);
    } catch (error) {
      console.error('Error al crear perfil:', error);
      throw error;
    }
  }

  async actualizarPerfil(id, data) {
    try {
      return await Perfiles.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }

  async eliminarPerfil(id) {
    try {
      return await Perfiles.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar perfil:', error);
      throw error;
    }
  }

  // ==================== CARRERAS ====================
  async obtenerCarreras() {
    try {
      return await Carreras.listar();
    } catch (error) {
      console.error('Error al obtener carreras:', error);
      throw error;
    }
  }

  async crearCarrera(data) {
    try {
      if (!data.nombre || !data.codigo) throw new Error('Nombre y código son requeridos');
      return await Carreras.crear(data);
    } catch (error) {
      console.error('Error al crear carrera:', error);
      throw error;
    }
  }

  async actualizarCarrera(id, data) {
    try {
      return await Carreras.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar carrera:', error);
      throw error;
    }
  }

  async eliminarCarrera(id) {
    try {
      return await Carreras.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar carrera:', error);
      throw error;
    }
  }

  // ==================== MATERIAS ====================
  async obtenerMaterias() {
    try {
      return await Materias.listar();
    } catch (error) {
      console.error('Error al obtener materias:', error);
      throw error;
    }
  }

  async crearMateria(data) {
    try {
      if (!data.nombre || !data.codigo) throw new Error('Nombre y código son requeridos');
      return await Materias.crear(data);
    } catch (error) {
      console.error('Error al crear materia:', error);
      throw error;
    }
  }

  async actualizarMateria(id, data) {
    try {
      return await Materias.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar materia:', error);
      throw error;
    }
  }

  async eliminarMateria(id) {
    try {
      return await Materias.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar materia:', error);
      throw error;
    }
  }

  // ==================== CALENDARIO ====================
  async obtenerCalendario() {
    try {
      return await Calendario.listar();
    } catch (error) {
      console.error('Error al obtener calendario:', error);
      throw error;
    }
  }

  async crearEventoCalendario(data) {
    try {
      if (!data.fecha || !data.titulo) throw new Error('Fecha y título son requeridos');
      return await Calendario.crear(data);
    } catch (error) {
      console.error('Error al crear evento de calendario:', error);
      throw error;
    }
  }

  async actualizarEventoCalendario(id, data) {
    try {
      return await Calendario.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar evento de calendario:', error);
      throw error;
    }
  }

  async eliminarEventoCalendario(id) {
    try {
      return await Calendario.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar evento de calendario:', error);
      throw error;
    }
  }

  // ==================== EVENTOS ====================
  async obtenerEventos() {
    try {
      return await Eventos.listar();
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw error;
    }
  }

  async crearEvento(data) {
    try {
      if (!data.titulo) throw new Error('El título es requerido');
      return await Eventos.crear(data);
    } catch (error) {
      console.error('Error al crear evento:', error);
      throw error;
    }
  }

  async actualizarEvento(id, data) {
    try {
      return await Eventos.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      throw error;
    }
  }

  async eliminarEvento(id) {
    try {
      return await Eventos.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      throw error;
    }
  }

  // ==================== NOTIFICACIONES ====================
  async obtenerNotificaciones() {
    try {
      return await Notificaciones.listar();
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  }

  async crearNotificacion(data) {
    try {
      if (!data.titulo) throw new Error('El título es requerido');
      return await Notificaciones.crear(data);
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  }

  async actualizarNotificacion(id, data) {
    try {
      return await Notificaciones.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      throw error;
    }
  }

  async eliminarNotificacion(id) {
    try {
      return await Notificaciones.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  }

  // ==================== NOVEDADES ====================
  async obtenerNovedades() {
    try {
      return await Novedades.listar();
    } catch (error) {
      console.error('Error al obtener novedades:', error);
      throw error;
    }
  }

  async crearNovedad(data) {
    try {
      if (!data.titulo) throw new Error('El título es requerido');
      return await Novedades.crear(data);
    } catch (error) {
      console.error('Error al crear novedad:', error);
      throw error;
    }
  }

  async actualizarNovedad(id, data) {
    try {
      return await Novedades.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar novedad:', error);
      throw error;
    }
  }

  async eliminarNovedad(id) {
    try {
      return await Novedades.eliminar(id);
    } catch (error) {
      console.error('Error al eliminar novedad:', error);
      throw error;
    }
  }

  // ==================== REGLAMENTACIÓN ====================
  async obtenerReglamentacion() {
    try {
      return await Reglamentacion.listar();
    } catch (error) {
      console.error('Error al obtener reglamentación:', error);
      throw error;
    }
  }

  async crearReglamento(data) {
    try {
      if (!data.titulo) throw new Error('El título es requerido');
      return await Reglamentacion.crear(data);
    } catch (error) {
      console.error('Error al crear reglamento:', error);
      throw error;
    }
  }

  async actualizarReglamento(id, data) {
    try {
      return await Reglamentacion.actualizar(id, data);
    } catch (error) {
      console.error('Error al actualizar reglamento:', error);
      throw error;
    }
  }

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
