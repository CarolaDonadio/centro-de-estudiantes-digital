/**
 * ejemplo-uso-novedades.js
 * Ejemplos prácticos de cómo usar el módulo novedades-filtro.js
 * 
 * NO incluir este archivo en producción; es solo referencia/documentación
 */

import {
  filtrarNovedadesParaUsuario,
  puedeVerNovedad,
  puedeCrearNovedad,
  validarNovedadCreada,
  ordenarNovedades,
  generarHTMLNovedad,
  buscarNovedades,
  agruparPorCategoria
} from './novedades-filtro.js';

// ============================================================
// EJEMPLO 1: Cargar y filtrar novedades según rol
// ============================================================

async function cargarNovedadesDelServidor() {
  // En primer semestre: fetch a archivos JSON
  const respuesta = await fetch('/json/novedades.json');
  const datos = await respuesta.json();
  return datos.novedades;
}

async function mostrarNovedadesAlUsuario() {
  // Simular usuario actual en sesión
  const usuarioActual = {
    id: 42,
    nombre: 'Juan Pérez',
    rol: 'alumno',         // alumno, docente, delegado, admin
    carrera_id: 3,         // Carrera de Datos
    materias: [1, 5, 7]    // Inscripto en estas materias
  };

  const todasLasNovedades = await cargarNovedadesDelServidor();
  
  // FILTRAR: Solo novedades que Juan puede ver
  const novedadesVisibles = filtrarNovedadesParaUsuario(
    todasLasNovedades,
    usuarioActual
  );

  // ORDENAR: Destacadas primero, luego por fecha
  const novedadesOrdenadas = ordenarNovedades(novedadesVisibles);

  console.log(`✅ Juan puede ver ${novedadesOrdenadas.length} de ${todasLasNovedades.length} novedades`);

  return novedadesOrdenadas;
}

// ============================================================
// EJEMPLO 2: Verificar visibilidad individual
// ============================================================

function verificarAcceso() {
  const novedadAcademica = {
    id: 1,
    titulo: 'Inscripción abierta',
    visibilidad: 'public'
  };

  const novedadCarrera = {
    id: 2,
    titulo: 'Workshop de Python',
    visibilidad: 'carrera',
    carrera_id: 3,
    requiere_carrera: true
  };

  const usuarioAlumno = {
    rol: 'alumno',
    carrera_id: 3,
    materias: []
  };

  const usuarioOtraCarrera = {
    rol: 'alumno',
    carrera_id: 1,
    materias: []
  };

  console.log('🔍 Verificación de acceso:');
  console.log('  Alumno Carrera 3 → Novedad pública:', puedeVerNovedad(novedadAcademica, usuarioAlumno));
  console.log('  Alumno Carrera 3 → Novedad Carrera 3:', puedeVerNovedad(novedadCarrera, usuarioAlumno));
  console.log('  Alumno Carrera 1 → Novedad Carrera 3:', puedeVerNovedad(novedadCarrera, usuarioOtraCarrera));
}

// ============================================================
// EJEMPLO 3: Validar antes de crear novedad
// ============================================================

function validarYCrearNovedad() {
  const usuarioDocente = {
    id: 10,
    rol: 'docente',
    carrera_id: 3,
    materias: [1, 5]
  };

  const novedadPropuesta = {
    titulo: 'Cambio de fecha del parcial',
    contenido: 'El examen se traslada al viernes.',
    categoria_id: 1,
    pode_crear: ['docente'],
    requiere_materia: true,
    materia_id: 5  // Materia que el docente enseña
  };

  const validacion = validarNovedadCreada(novedadPropuesta, usuarioDocente);

  if (validacion.valido) {
    console.log('✅ Novedad validada correctamente');
    // Proceder a guardar
    enviarAlServidor(novedadPropuesta);
  } else {
    console.log('❌ Errores de validación:');
    validacion.errores.forEach(err => console.log('  -', err));
  }
}

// ============================================================
// EJEMPLO 4: Verificar permisos de creación
// ============================================================

function verificarPermisosCreacion() {
  const tiposNovedad = [
    { titulo: 'Novedad pública', puede_crear: ['admin'] },
    { titulo: 'Novedad académica', puede_crear: ['admin', 'docente'] },
    { titulo: 'Evento del centro', puede_crear: ['admin', 'delegado'] }
  ];

  const usuarios = [
    { nombre: 'Admin', rol: 'admin' },
    { nombre: 'Prof. García', rol: 'docente', materias: [1] },
    { nombre: 'Juan (Delegado)', rol: 'delegado' },
    { nombre: 'María (Alumna)', rol: 'alumno' }
  ];

  console.log('📋 Matriz de permisos:\n');
  tiposNovedad.forEach(tipo => {
    console.log(`${tipo.titulo}: puede_crear = [${tipo.puede_crear.join(', ')}]`);
    usuarios.forEach(usuario => {
      const puede = puedeCrearNovedad(usuario, tipo);
      const simbolo = puede ? '✅' : '❌';
      console.log(`  ${simbolo} ${usuario.nombre} (${usuario.rol})`);
    });
    console.log('');
  });
}

// ============================================================
// EJEMPLO 5: Renderizar lista de novedades en HTML
// ============================================================

async function renderizarNovedadesEnPagina() {
  const novedades = await cargarNovedadesDelServidor();
  const container = document.getElementById('lista-novedades');

  if (!container) {
    console.warn('No se encontró elemento #lista-novedades');
    return;
  }

  // Limpiar
  container.innerHTML = '';

  // Generar HTML para cada novedad
  novedades.forEach(novedad => {
    const html = generarHTMLNovedad(novedad, false);
    container.insertAdjacentHTML('beforeend', html);
  });

  console.log(`✅ Renderizadas ${novedades.length} novedades`);
}

// ============================================================
// EJEMPLO 6: Buscar y filtrar
// ============================================================

function buscarYFiltrar() {
  const usuarioAlumno = {
    rol: 'alumno',
    carrera_id: 3,
    materias: [1, 5, 7]
  };

  cargarNovedadesDelServidor().then(todasLasNovedades => {
    // Paso 1: Filtrar por rol
    let novedades = filtrarNovedadesParaUsuario(todasLasNovedades, usuarioAlumno);
    console.log(`Después de filtrar por rol: ${novedades.length} novedades`);

    // Paso 2: Buscar por término
    novedades = buscarNovedades(novedades, 'Python');
    console.log(`Después de buscar "Python": ${novedades.length} novedades`);

    // Paso 3: Agrupar por categoría
    const grupos = agruparPorCategoria(novedades);
    console.log('Agrupadas por categoría:', Object.keys(grupos));

    // Paso 4: Mostrar resultados
    Object.entries(grupos).forEach(([catId, items]) => {
      console.log(`  Categoría ${catId}: ${items.length} novedades`);
    });
  });
}

// ============================================================
// EJEMPLO 7: Caso de uso completo - Panel de Alumnos
// ============================================================

async function panelAlumnos() {
  console.log('🎓 PANEL DE ALUMNOS\n');

  const usuarioAlumno = {
    id: 123,
    nombre: 'María González',
    rol: 'alumno',
    carrera_id: 3,
    materias: [1, 5, 7]
  };

  const novedades = await cargarNovedadesDelServidor();
  const visibles = filtrarNovedadesParaUsuario(novedades, usuarioAlumno);
  const ordenadas = ordenarNovedades(visibles);

  console.log(`${usuarioAlumno.nombre} (${usuarioAlumno.rol})`);
  console.log(`Carrera ID: ${usuarioAlumno.carrera_id}`);
  console.log(`Novedades disponibles: ${ordenadas.length}\n`);

  ordenadas.slice(0, 3).forEach(nov => {
    console.log(`📌 "${nov.titulo}"`);
    console.log(`   Categoría: ${nov.categoria}`);
    console.log(`   Autor: ${nov.autor}`);
    console.log(`   Fecha: ${new Date(nov.fecha).toLocaleDateString('es-AR')}\n`);
  });
}

// ============================================================
// EJEMPLO 8: Caso de uso completo - Panel de Delegados
// ============================================================

async function panelDelegados() {
  console.log('👥 PANEL DE DELEGADOS\n');

  const usuarioDelegado = {
    id: 999,
    nombre: 'Centro de Estudiantes',
    rol: 'delegado',
    carrera_id: null,
    materias: []
  };

  const novedades = await cargarNovedadesDelServidor();
  const visibles = filtrarNovedadesParaUsuario(novedades, usuarioDelegado);

  console.log(`Rol: ${usuarioDelegado.rol}`);
  console.log(`Novedades visibles: ${visibles.length}`);
  console.log(`Puede crear: ${puedeCrearNovedad(usuarioDelegado, { puede_crear: ['delegado'] }) ? 'SÍ' : 'NO'}\n`);

  // Verificar qué tipos puede crear
  const tipos = ['admin', 'delegado', 'docente', 'alumno'];
  console.log('Permisos de creación:');
  tipos.forEach(rol => {
    const puede = puedeCrearNovedad(usuarioDelegado, { puede_crear: [rol] });
    console.log(`  ${puede ? '✅' : '❌'} ${rol}`);
  });
}

// ============================================================
// Exportar para testing
// ============================================================

export {
  cargarNovedadesDelServidor,
  mostrarNovedadesAlUsuario,
  verificarAcceso,
  validarYCrearNovedad,
  verificarPermisosCreacion,
  renderizarNovedadesEnPagina,
  buscarYFiltrar,
  panelAlumnos,
  panelDelegados
};

// ============================================================
// Para ejecutar en consola del navegador:
// ============================================================
// import * as ejemplos from './ejemplo-uso-novedades.js';
// await ejemplos.mostrarNovedadesAlUsuario();
// ejemplos.verificarAcceso();
// ejemplos.verificarPermisosCreacion();
