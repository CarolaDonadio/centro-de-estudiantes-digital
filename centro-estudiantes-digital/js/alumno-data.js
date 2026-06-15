/**
 * ALUMNO DATA - Gestión de datos para estudiantes
 * Los alumnos pueden ver: calendario, eventos, novedades, materias, notificaciones
 */

class AlumnoData {
  constructor() {
    // Al instanciar la clase, recuperamos automáticamente la sesión del usuario logueado
    this.session = this.getSession();
  }

  // Método privado para leer los datos de sesión desde el localStorage
  getSession() {
    try {
      return JSON.parse(localStorage.getItem('cedSession'));
    } catch {
      return null;
    }
  }

  // ==================== CALENDARIO ====================
  
  // Trae la lista completa de fechas académicas (exámenes, feriados, etc.)
  async obtenerCalendario() {
    try {
      return await Calendario.listar();
    } catch (error) {
      console.error('Error al obtener calendario:', error);
      throw error;
    }
  }

  // Trae los detalles de una sola fecha del calendario
  async obtenerEventoCalendario(id) {
    try {
      return await Calendario.obtener(id);
    } catch (error) {
      console.error('Error al obtener evento:', error);
      throw error;
    }
  }

  // ==================== EVENTOS ====================
  
  // Trae la lista de eventos sociales y culturales organizados por el CE
  async obtenerEventos() {
    try {
      return await Eventos.listar();
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw error;
    }
  }

  // Trae la información detallada de un evento específico
  async obtenerEvento(id) {
    try {
      return await Eventos.obtener(id);
    } catch (error) {
      console.error('Error al obtener evento:', error);
      throw error;
    }
  }

  // ==================== NOVEDADES ====================
  
  // Trae el feed de noticias y avisos del instituto
  async obtenerNovedades() {
    try {
      return await Novedades.listar();
    } catch (error) {
      console.error('Error al obtener novedades:', error);
      throw error;
    }
  }

  // Trae una noticia en particular por su ID
  async obtenerNovedad(id) {
    try {
      return await Novedades.obtener(id);
    } catch (error) {
      console.error('Error al obtener novedad:', error);
      throw error;
    }
  }

  // ==================== MATERIAS ====================
  
  // Trae el listado general de todas las materias del sistema
  async obtenerMaterias() {
    try {
      return await Materias.listar();
    } catch (error) {
      console.error('Error al obtener materias:', error);
      throw error;
    }
  }

  // Trae la información de una materia específica (docente, horarios, etc.)
  async obtenerMateria(id) {
    try {
      return await Materias.obtener(id);
    } catch (error) {
      console.error('Error al obtener materia:', error);
      throw error;
    }
  }

  /**
   * Filtra la lista general para devolver solo las materias de la carrera del alumno
   */
  async obtenerMisMateria() {
    try {
      if (!this.session?.carrera_id) {
        throw new Error('No hay carrera asociada');
      }
      
      const todasLasMaterias = await this.obtenerMaterias();
      return todasLasMaterias.filter(m => m.carrera_id === this.session.carrera_id);
    } catch (error) {
      console.error('Error al obtener mis materias:', error);
      throw error;
    }
  }

  // ==================== NOTIFICACIONES ====================
  
  // Trae las alertas y avisos directos para el usuario
  async obtenerNotificaciones() {
    try {
      return await Notificaciones.listar();
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  }

  // Obtiene los detalles de una notificación recibida
  async obtenerNotificacion(id) {
    try {
      return await Notificaciones.obtener(id);
    } catch (error) {
      console.error('Error al obtener notificación:', error);
      throw error;
    }
  }

  // ==================== REGLAMENTACIÓN ====================
  
  // Trae el repositorio de documentos y normativas oficiales
  async obtenerReglamentacion() {
    try {
      return await Reglamentacion.listar();
    } catch (error) {
      console.error('Error al obtener reglamentación:', error);
      throw error;
    }
  }

  // Obtiene el link o datos de un reglamento específico
  async obtenerReglamento(id) {
    try {
      return await Reglamentacion.obtener(id);
    } catch (error) {
      console.error('Error al obtener reglamento:', error);
      throw error;
    }
  }

  // ==================== CARRERAS ====================
  
  // Trae el listado de todas las carreras que ofrece el ISFDyT 57
  async obtenerCarreras() {
    try {
      return await Carreras.listar();
    } catch (error) {
      console.error('Error al obtener carreras:', error);
      throw error;
    }
  }

  // Trae la info de una carrera (nombre, código, descripción)
  async obtenerCarrera(id) {
    try {
      return await Carreras.obtener(id);
    } catch (error) {
      console.error('Error al obtener carrera:', error);
      throw error;
    }
  }

  // ==================== PERFILES ====================
  
  // Trae los roles definidos en el sistema (usado para etiquetas visuales)
  async obtenerPerfiles() {
    try {
      return await Perfiles.listar();
    } catch (error) {
      console.error('Error al obtener perfiles:', error);
      throw error;
    }
  }

  // ==================== MI INFORMACIÓN ====================
  
  /**
   * Pide a la API los datos actualizados del perfil del alumno logueado
   */
  async obtenerMiInfo() {
    if (!this.session) throw new Error('No hay sesión activa');
    
    try {
      return await Usuarios.obtener(this.session.id);
    } catch (error) {
      console.error('Error al obtener mi información:', error);
      throw error;
    }
  }

  /**
   * Envía cambios al perfil (el alumno solo puede editar email, tel y avatar)
   */
  async actualizarMiInfo(data) {
    if (!this.session) throw new Error('No hay sesión activa');
    
    try {
      // Filtro de seguridad: el alumno no puede cambiarse el rol o la carrera solo
      const permitidos = ['email', 'telefono', 'avatar'];
      const datosActualizados = {};
      
      permitidos.forEach(campo => {
        if (data[campo] !== undefined) {
          datosActualizados[campo] = data[campo];
        }
      });

      if (Object.keys(datosActualizados).length === 0) {
        throw new Error('No hay datos válidos para actualizar');
      }

      return await Usuarios.actualizar(this.session.id, datosActualizados);
    } catch (error) {
      console.error('Error al actualizar mi información:', error);
      throw error;
    }
  }

  /**
   * Procesa la solicitud de cambio de clave del estudiante
   */
  async cambiarPassword(passwordActual, passwordNueva) {
    if (!this.session) throw new Error('No hay sesión activa');
    
    try {
      // Validaciones básicas de integridad
      if (!passwordActual || !passwordNueva) {
        throw new Error('Las contraseñas son requeridas');
      }

      // Validación de longitud mínima (regla de negocio del frontend)
      if (passwordNueva.length < 4) {
        throw new Error('La contraseña debe tener al menos 4 caracteres');
      }

      return await Usuarios.actualizar(this.session.id, {
        password: passwordNueva,
        password_anterior: passwordActual
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }
}

// Creamos la instancia única para que todo el sitio del alumno la use
const alumnoData = new AlumnoData();

// Exponemos el objeto al objeto 'window' para que sea accesible desde cualquier script
if (typeof window !== 'undefined') {
  window.alumnoData = alumnoData;
}
