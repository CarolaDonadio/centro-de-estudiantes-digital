/**
 * ALUMNO DATA - Gestión de datos para estudiantes
 * Los alumnos pueden ver: calendario, eventos, novedades, materias, notificaciones
 */

class AlumnoData {
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

  // ==================== CALENDARIO ====================
  async obtenerCalendario() {
    try {
      return await Calendario.listar();
    } catch (error) {
      console.error('Error al obtener calendario:', error);
      throw error;
    }
  }

  async obtenerEventoCalendario(id) {
    try {
      return await Calendario.obtener(id);
    } catch (error) {
      console.error('Error al obtener evento:', error);
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

  async obtenerEvento(id) {
    try {
      return await Eventos.obtener(id);
    } catch (error) {
      console.error('Error al obtener evento:', error);
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

  async obtenerNovedad(id) {
    try {
      return await Novedades.obtener(id);
    } catch (error) {
      console.error('Error al obtener novedad:', error);
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

  async obtenerMateria(id) {
    try {
      return await Materias.obtener(id);
    } catch (error) {
      console.error('Error al obtener materia:', error);
      throw error;
    }
  }

  /**
   * Obtener solo las materias del alumno actual
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
  async obtenerNotificaciones() {
    try {
      return await Notificaciones.listar();
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  }

  async obtenerNotificacion(id) {
    try {
      return await Notificaciones.obtener(id);
    } catch (error) {
      console.error('Error al obtener notificación:', error);
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

  async obtenerReglamento(id) {
    try {
      return await Reglamentacion.obtener(id);
    } catch (error) {
      console.error('Error al obtener reglamento:', error);
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

  async obtenerCarrera(id) {
    try {
      return await Carreras.obtener(id);
    } catch (error) {
      console.error('Error al obtener carrera:', error);
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

  // ==================== MI INFORMACIÓN ====================
  
  /**
   * Obtener datos del alumno actual
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
   * Actualizar mi información (solo datos permitidos)
   */
  async actualizarMiInfo(data) {
    if (!this.session) throw new Error('No hay sesión activa');
    
    try {
      // Solo permitir actualizar ciertos campos
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
   * Cambiar contraseña del alumno
   */
  async cambiarPassword(passwordActual, passwordNueva) {
    if (!this.session) throw new Error('No hay sesión activa');
    
    try {
      if (!passwordActual || !passwordNueva) {
        throw new Error('Las contraseñas son requeridas');
      }

      if (passwordNueva.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
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

// Crear instancia global
const alumnoData = new AlumnoData();

// Exponer a nivel global (navegador)
if (typeof window !== 'undefined') {
  window.alumnoData = alumnoData;
}
