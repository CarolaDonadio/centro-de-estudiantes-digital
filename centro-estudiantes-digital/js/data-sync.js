/**
 * DATA SYNC - Sincronización de datos locales con API remota
 * Permite cargar datos desde JSON locales hacia la API
 */

class DataSync {
  constructor() {
    this.resultados = {
      exitosos: 0,
      errores: 0,
      detalles: []
    };
  }

  /**
   * Sincronizar todos los recursos desde archivos locales
   */
  async sincronizarTodo() {
    console.log('🔄 Iniciando sincronización completa de datos...');
    this.resultados = { exitosos: 0, errores: 0, detalles: [] };

    const tareas = [
      { nombre: 'Perfiles', archivo: 'json/perfiles.json', modulo: Perfiles },
      { nombre: 'Carreras', archivo: 'json/carreras.json', modulo: Carreras },
      { nombre: 'Usuarios', archivo: 'json/usuarios.json', modulo: Usuarios },
      { nombre: 'Materias', archivo: 'json/materias.json', modulo: Materias },
      { nombre: 'Calendario', archivo: 'json/calendario.json', modulo: Calendario },
      { nombre: 'Eventos', archivo: 'json/eventos.json', modulo: Eventos },
      { nombre: 'Notificaciones', archivo: 'json/notificaciones.json', modulo: Notificaciones },
      { nombre: 'Novedades', archivo: 'json/novedades.json', modulo: Novedades },
      { nombre: 'Reglamentación', archivo: 'json/reglamentacion.json', modulo: Reglamentacion }
    ];

    for (const tarea of tareas) {
      await this.sincronizarRecurso(tarea.nombre, tarea.archivo, tarea.modulo);
    }

    console.log('✅ Sincronización completada', this.resultados);
    return this.resultados;
  }

  /**
   * Sincronizar un recurso específico
   */
  async sincronizarRecurso(nombre, archivo, modulo) {
    console.log(`📦 Sincronizando ${nombre}...`);
    
    try {
      const datos = await this.cargarJSON(archivo);
      
      if (!Array.isArray(datos)) {
        console.warn(`⚠️  ${nombre} no es un array, omitiendo`);
        return;
      }

      for (const item of datos) {
        try {
          await modulo.crear(item);
          this.resultados.exitosos++;
          this.resultados.detalles.push({
            tipo: 'éxito',
            recurso: nombre,
            id: item.id,
            mensaje: `${item.nombre || item.titulo || item.codigo || 'Sin nombre'}`
          });
        } catch (error) {
          this.resultados.errores++;
          this.resultados.detalles.push({
            tipo: 'error',
            recurso: nombre,
            id: item.id,
            mensaje: error.message
          });
        }
      }

      console.log(`✓ ${nombre} sincronizado`);
    } catch (error) {
      console.error(`✗ Error en ${nombre}:`, error.message);
      this.resultados.errores++;
      this.resultados.detalles.push({
        tipo: 'error',
        recurso: nombre,
        mensaje: `Error al cargar archivo: ${error.message}`
      });
    }
  }

  /**
   * Cargar archivo JSON
   */
  async cargarJSON(archivo) {
    const response = await fetch(archivo);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    let data = await response.json();
    
    // Si es un objeto con un campo que contiene array
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const valores = Object.values(data);
      if (valores.length === 1 && Array.isArray(valores[0])) {
        data = valores[0];
      }
    }

    return Array.isArray(data) ? data : [data];
  }

  /**
   * Limpiar todos los datos de la API (útil para testing)
   */
  async limpiarTodo() {
    if (!confirm('⚠️  ¿Deseas eliminar TODOS los datos de la API? Esta acción no se puede deshacer.')) {
      return;
    }

    console.log('🗑️  Limpiando datos de API...');
    this.resultados = { exitosos: 0, errores: 0, detalles: [] };

    const modulos = [
      { nombre: 'Usuarios', modulo: Usuarios },
      { nombre: 'Materias', modulo: Materias },
      { nombre: 'Calendario', modulo: Calendario },
      { nombre: 'Eventos', modulo: Eventos },
      { nombre: 'Notificaciones', modulo: Notificaciones },
      { nombre: 'Novedades', modulo: Novedades },
      { nombre: 'Carreras', modulo: Carreras },
      { nombre: 'Perfiles', modulo: Perfiles },
      { nombre: 'Reglamentación', modulo: Reglamentacion }
    ];

    for (const { nombre, modulo } of modulos) {
      try {
        const items = await modulo.listar();
        for (const item of items) {
          try {
            await modulo.eliminar(item.id);
            this.resultados.exitosos++;
          } catch (error) {
            this.resultados.errores++;
          }
        }
        console.log(`✓ ${nombre} limpiado`);
      } catch (error) {
        console.error(`✗ Error limpiando ${nombre}:`, error.message);
      }
    }

    console.log('✅ Limpieza completada', this.resultados);
    return this.resultados;
  }

  /**
   * Obtener un resumen de los datos en la API
   */
  async obtenerResumen() {
    const resumen = {};

    const modulos = [
      { nombre: 'usuarios', modulo: Usuarios },
      { nombre: 'carreras', modulo: Carreras },
      { nombre: 'materias', modulo: Materias },
      { nombre: 'calendario', modulo: Calendario },
      { nombre: 'eventos', modulo: Eventos },
      { nombre: 'notificaciones', modulo: Notificaciones },
      { nombre: 'novedades', modulo: Novedades },
      { nombre: 'perfiles', modulo: Perfiles },
      { nombre: 'reglamentación', modulo: Reglamentacion }
    ];

    for (const { nombre, modulo } of modulos) {
      try {
        const items = await modulo.listar();
        resumen[nombre] = Array.isArray(items) ? items.length : 0;
      } catch (error) {
        resumen[nombre] = 0;
      }
    }

    return resumen;
  }

  /**
   * Mostrar resumen en la consola
   */
  async mostrarResumen() {
    const resumen = await this.obtenerResumen();
    console.table(resumen);
    return resumen;
  }
}

// Crear instancia global
const dataSync = new DataSync();

// Funciones de conveniencia
async function sincronizarDatos() {
  return await dataSync.sincronizarTodo();
}

async function limpiarDatos() {
  return await dataSync.limpiarTodo();
}

async function verResumenDatos() {
  return await dataSync.mostrarResumen();
}

// Exponer a nivel global (navegador)
if (typeof window !== 'undefined') {
  window.dataSync = dataSync;
  window.sincronizarDatos = sincronizarDatos;
  window.limpiarDatos = limpiarDatos;
  window.verResumenDatos = verResumenDatos;
}
