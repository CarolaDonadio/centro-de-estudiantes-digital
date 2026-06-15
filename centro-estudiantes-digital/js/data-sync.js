/**
 * DATA SYNC - Sincronización de datos locales con API remota
 * Permite cargar datos desde JSON locales hacia la API
 * Este script es principalmente una herramienta de desarrollo para poblar la API
 * con datos de prueba de forma masiva.
 */

class DataSync {
  constructor() {
    // Inicializa un objeto para almacenar los resultados de la sincronización (éxitos, errores, detalles).
    this.resultados = {
      exitosos: 0,
      errores: 0,
      detalles: []
    };
  }

  /**
   * Sincroniza todos los recursos definidos desde sus archivos JSON locales hacia la API remota.
   * Es el método principal para iniciar una carga masiva de datos.
   */
  async sincronizarTodo() {
    console.log('🔄 Iniciando sincronización completa de datos...');
    // Reinicia los contadores de resultados antes de cada sincronización.
    this.resultados = { exitosos: 0, errores: 0, detalles: [] };

    const tareas = [
      { nombre: 'Perfiles', archivo: '../json/perfiles.json', modulo: Perfiles },
      { nombre: 'Carreras', archivo: '../json/carreras.json', modulo: Carreras },
      { nombre: 'Usuarios', archivo: '../json/usuarios.json', modulo: Usuarios },
      { nombre: 'Materias', archivo: '../json/materias.json', modulo: Materias },
      { nombre: 'Calendario', archivo: '../json/calendario.json', modulo: Calendario },
      { nombre: 'Eventos', archivo: '../json/eventos.json', modulo: Eventos },
      { nombre: 'Notificaciones', archivo: '../json/notificaciones.json', modulo: Notificaciones },
      { nombre: 'Novedades', archivo: '../json/novedades.json', modulo: Novedades },
      { nombre: 'Reglamentación', archivo: '../json/reglamentacion.json', modulo: Reglamentacion }
    ];

    // Itera sobre cada tarea (recurso) y llama a sincronizarRecurso para cada uno.
    for (const tarea of tareas) {
      await this.sincronizarRecurso(tarea.nombre, tarea.archivo, tarea.modulo);
    }

    // Muestra un resumen final de la sincronización en la consola.
    console.log('✅ Sincronización completada', this.resultados);
    return this.resultados;
  }

  /**
   * Sincroniza un recurso específico (ej. "Usuarios") desde un archivo JSON local.
   * @param {string} nombre - Nombre del recurso (ej. "Usuarios").
   * @param {string} archivo - Ruta al archivo JSON local (ej. '../json/usuarios.json').
   * @param {object} modulo - Objeto del cliente API (ej. `Usuarios`) con el método `crear`.
   */
  async sincronizarRecurso(nombre, archivo, modulo) {
    console.log(`📦 Sincronizando ${nombre}...`);
    
    try {
      const datos = await this.cargarJSON(archivo);
      
      // Si los datos cargados no son un array, se emite una advertencia y se omite el recurso.
      if (!Array.isArray(datos)) {
        console.warn(`⚠️  ${nombre} no es un array, omitiendo`);
        return;
      }

      // Itera sobre cada elemento del array de datos y lo intenta crear en la API.
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
      // Captura errores al cargar el archivo JSON o al procesar el recurso.
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
   * Carga un archivo JSON desde una URL (ruta local).
   * @param {string} archivo - Ruta al archivo JSON.
   * @returns {Array} - Un array de objetos JSON.
   */
  async cargarJSON(archivo) {
    const response = await fetch(archivo);
    // Si la respuesta HTTP no es exitosa (ej. 404), lanza un error.
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    let data = await response.json();
    
    // Maneja casos donde el JSON puede ser un objeto que contiene un array (ej. { "materias": [...] }).
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const valores = Object.values(data);
      // Si el objeto tiene una única propiedad que es un array, extrae ese array.
      if (valores.length === 1 && Array.isArray(valores[0])) {
        data = valores[0];
      }
    }

    return Array.isArray(data) ? data : [data];
  }

  /**
   * Elimina todos los datos de todos los módulos en la API.
   * Es una función destructiva, útil para reiniciar la base de datos de prueba.
   */
  async limpiarTodo() {
    if (!confirm('⚠️  ¿Deseas eliminar TODOS los datos de la API? Esta acción no se puede deshacer.')) {
      // Pide confirmación al usuario antes de proceder.
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

    // Itera sobre cada módulo, lista sus elementos y los elimina uno por uno.
    for (const { nombre, modulo } of modulos) {
      try {
        const items = await modulo.listar();
        // Itera sobre los elementos obtenidos y los elimina.
        for (const item of items) {
          // Intenta eliminar cada item y registra el éxito o el error.
          try {
            await modulo.eliminar(item.id);
            this.resultados.exitosos++;
          } catch (error) {
            this.resultados.errores++;
          }
        }
        console.log(`✓ ${nombre} limpiado`);
      // Captura errores si no se puede listar o eliminar un módulo completo.
      } catch (error) {
        console.error(`✗ Error limpiando ${nombre}:`, error.message);
      }
    }

    console.log('✅ Limpieza completada', this.resultados);
    return this.resultados;
  }

  /**
   * Obtiene un resumen de la cantidad de elementos en cada módulo de la API.
   * @returns {object} - Un objeto donde las claves son los nombres de los módulos y los valores son las cantidades.
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

    // Para cada módulo, intenta listar sus elementos y cuenta cuántos hay.
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
   * Muestra el resumen de datos en la consola del navegador como una tabla.
   */
  async mostrarResumen() {
    const resumen = await this.obtenerResumen();
    console.table(resumen);
    return resumen;
  }
}

// Crea una instancia global de DataSync para que sea accesible en toda la aplicación.
const dataSync = new DataSync();

// --- Funciones de conveniencia globales ---
// Estas funciones son atajos para llamar a los métodos de la instancia `dataSync`
// de forma más sencilla desde la consola del navegador o desde otros scripts.

async function sincronizarDatos() {
  return await dataSync.sincronizarTodo();
}

async function limpiarDatos() {
  return await dataSync.limpiarTodo();
}

async function verResumenDatos() {
  return await dataSync.mostrarResumen();
}

// --- Exportación global ---
// Hace que la instancia `dataSync` y las funciones de conveniencia estén disponibles
// como propiedades del objeto `window` en el navegador.
if (typeof window !== 'undefined') {
  window.dataSync = dataSync;
  window.sincronizarDatos = sincronizarDatos;
  window.limpiarDatos = limpiarDatos;
  window.verResumenDatos = verResumenDatos;
}
