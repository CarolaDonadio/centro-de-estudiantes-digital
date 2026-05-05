/**
 * test-novedades-sistema.js
 * Script para verificar que el sistema funciona correctamente
 * 
 * Ejecutar en consola del navegador después de cargar la página:
 * import * as tests from './test-novedades-sistema.js';
 * await tests.ejecutarTodosTesting();
 */

import {
  filtrarNovedadesParaUsuario,
  puedeVerNovedad,
  puedeCrearNovedad,
  validarNovedadCreada,
  ordenarNovedades,
  buscarNovedades,
  agruparPorCategoria
} from './novedades-filtro.js';

/**
 * Carga novedades del JSON
 */
async function cargarNovedades() {
  try {
    const response = await fetch('/json/novedades.json');
    const data = await response.json();
    return data.novedades;
  } catch (error) {
    console.error('❌ Error cargando novedades.json:', error);
    return [];
  }
}

/**
 * Test 1: Verificar estructura JSON
 */
export async function testEstructuraJSON() {
  console.log('\n🧪 TEST 1: ESTRUCTURA JSON');
  console.log('=' .repeat(50));
  
  const novedades = await cargarNovedades();
  
  if (novedades.length === 0) {
    console.error('❌ No se cargaron novedades');
    return false;
  }

  const camposRequeridos = [
    'id', 'titulo', 'contenido', 'categoria_id',
    'visibilidad', 'puede_crear', 'requiere_carrera', 'requiere_materia'
  ];

  let todosOk = true;
  novedades.forEach((nov, i) => {
    const camposFaltantes = camposRequeridos.filter(campo => !(campo in nov));
    if (camposFaltantes.length > 0) {
      console.error(`❌ Novedad ${i + 1} falta campos: ${camposFaltantes.join(', ')}`);
      todosOk = false;
    } else {
      console.log(`✅ Novedad ${i + 1}: ${nov.titulo.substring(0, 40)}...`);
    }
  });

  return todosOk;
}

/**
 * Test 2: Permisos de lectura por rol
 */
export async function testPermisosLectura() {
  console.log('\n🧪 TEST 2: PERMISOS DE LECTURA');
  console.log('=' .repeat(50));

  const novedades = await cargarNovedades();
  
  const roles = {
    'alumno': { rol: 'alumno', carrera_id: 3, materias: [1, 5, 7] },
    'docente': { rol: 'docente', carrera_id: 3, materias: [1, 5, 7] },
    'delegado': { rol: 'delegado', carrera_id: null, materias: [] },
    'admin': { rol: 'admin', carrera_id: null, materias: [] }
  };

  let resultado = true;

  Object.entries(roles).forEach(([nombreRol, usuario]) => {
    const visibles = filtrarNovedadesParaUsuario(novedades, usuario);
    console.log(`\n👤 ${nombreRol.toUpperCase()}:`);
    console.log(`   Total disponibles: ${visibles.length}/${novedades.length}`);
    
    visibles.forEach(nov => {
      console.log(`   ✅ ${nov.titulo.substring(0, 35)}`);
    });
  });

  return resultado;
}

/**
 * Test 3: Permisos de creación
 */
export async function testPermisosCreacion() {
  console.log('\n🧪 TEST 3: PERMISOS DE CREACIÓN');
  console.log('=' .repeat(50));

  const roles = {
    'alumno': { rol: 'alumno', materias: [] },
    'docente': { rol: 'docente', materias: [1, 5] },
    'delegado': { rol: 'delegado', materias: [] },
    'admin': { rol: 'admin', materias: [] }
  };

  const tiposNovedades = [
    { nombre: 'Novedad Pública', puede_crear: ['admin'] },
    { nombre: 'Novedad Académica', puede_crear: ['admin', 'docente'] },
    { nombre: 'Evento del Centro', puede_crear: ['admin', 'delegado'] },
    { nombre: 'Aviso de Docente', puede_crear: ['docente'], requiere_materia: true, materia_id: 5 }
  ];

  console.log('\n📊 MATRIZ DE CREACIÓN:\n');
  
  tiposNovedades.forEach(tipo => {
    console.log(`📝 ${tipo.nombre}`);
    console.log(`   Puede crear: [${tipo.puede_crear.join(', ')}]`);
    
    Object.entries(roles).forEach(([nombreRol, usuario]) => {
      const puede = puedeCrearNovedad(usuario, tipo);
      const simbolo = puede ? '✅' : '❌';
      console.log(`     ${simbolo} ${nombreRol}`);
    });
    console.log('');
  });

  return true;
}

/**
 * Test 4: Validación de novedades
 */
export async function testValidaciones() {
  console.log('\n🧪 TEST 4: VALIDACIONES');
  console.log('=' .repeat(50));

  const usuarioDocente = {
    rol: 'docente',
    materias: [1, 5]
  };

  const casos = [
    {
      nombre: 'Novedad válida',
      novedad: {
        titulo: 'Cambio de fecha',
        contenido: 'El parcial se traslada',
        categoria_id: 1,
        puede_crear: ['docente'],
        requiere_materia: true,
        materia_id: 5
      },
      esperado: true
    },
    {
      nombre: 'Novedad sin título',
      novedad: {
        titulo: '',
        contenido: 'Contenido válido',
        categoria_id: 1,
        puede_crear: ['docente']
      },
      esperado: false
    },
    {
      nombre: 'Novedad materia ajena',
      novedad: {
        titulo: 'Título válido',
        contenido: 'Contenido',
        categoria_id: 1,
        puede_crear: ['docente'],
        requiere_materia: true,
        materia_id: 99  // No enseña esta materia
      },
      esperado: false
    },
    {
      nombre: 'Título muy largo',
      novedad: {
        titulo: 'A'.repeat(250),
        contenido: 'Contenido válido',
        categoria_id: 1,
        puede_crear: ['docente']
      },
      esperado: false
    }
  ];

  let todosOk = true;
  casos.forEach(caso => {
    const validacion = validarNovedadCreada(caso.novedad, usuarioDocente);
    const resultado = validacion.valido === caso.esperado;
    const simbolo = resultado ? '✅' : '❌';
    
    console.log(`\n${simbolo} ${caso.nombre}`);
    console.log(`   Esperado: ${caso.esperado}`);
    console.log(`   Obtenido: ${validacion.valido}`);
    
    if (validacion.errores.length > 0) {
      console.log(`   Errores:`);
      validacion.errores.forEach(err => console.log(`     - ${err}`));
    }

    if (!resultado) todosOk = false;
  });

  return todosOk;
}

/**
 * Test 5: Ordenamiento
 */
export async function testOrdenamiento() {
  console.log('\n🧪 TEST 5: ORDENAMIENTO');
  console.log('=' .repeat(50));

  const novedades = await cargarNovedades();
  const ordenadas = ordenarNovedades(novedades);

  console.log('\nNovedades ordenadas (destacadas primero):');
  console.log('');
  
  ordenadas.forEach((nov, i) => {
    const destacada = nov.destacada ? '📌 DESTACADA' : '  ';
    console.log(`${i + 1}. ${destacada} - ${nov.titulo.substring(0, 40)}`);
  });

  return true;
}

/**
 * Test 6: Búsqueda
 */
export async function testBusqueda() {
  console.log('\n🧪 TEST 6: BÚSQUEDA');
  console.log('=' .repeat(50));

  const novedades = await cargarNovedades();
  const terminos = ['Python', 'beca', 'reglamento'];

  terminos.forEach(termino => {
    const resultados = buscarNovedades(novedades, termino);
    console.log(`\n🔍 Buscando: "${termino}"`);
    console.log(`   Resultados: ${resultados.length}`);
    resultados.forEach(r => console.log(`   - ${r.titulo}`));
  });

  return true;
}

/**
 * Test 7: Agrupación
 */
export async function testAgrupacion() {
  console.log('\n🧪 TEST 7: AGRUPACIÓN POR CATEGORÍA');
  console.log('=' .repeat(50));

  const novedades = await cargarNovedades();
  const grupos = agruparPorCategoria(novedades);

  Object.entries(grupos).forEach(([catId, items]) => {
    const categoria = items[0]?.categoria || 'Desconocida';
    console.log(`\n📂 ${categoria} (ID: ${catId})`);
    items.forEach(item => console.log(`   - ${item.titulo}`));
  });

  return true;
}

/**
 * Test 8: Caso completo - Panel de alumno
 */
export async function testCasoAlumno() {
  console.log('\n🧪 TEST 8: CASO COMPLETO - PANEL DE ALUMNO');
  console.log('=' .repeat(50));

  const novedades = await cargarNovedades();
  const usuario = {
    id: 123,
    nombre: 'María González',
    rol: 'alumno',
    carrera_id: 3,
    materias: [1, 5, 7]
  };

  console.log(`\n👤 Usuario: ${usuario.nombre} (${usuario.rol})`);
  console.log(`   Carrera ID: ${usuario.carrera_id}`);
  console.log(`   Materias: ${usuario.materias.join(', ')}`);

  const visibles = filtrarNovedadesParaUsuario(novedades, usuario);
  const ordenadas = ordenarNovedades(visibles);

  console.log(`\n📰 Novedades disponibles: ${ordenadas.length}/${novedades.length}\n`);

  ordenadas.forEach((nov, i) => {
    const destacada = nov.destacada ? '📌' : '  ';
    console.log(`${i + 1}. ${destacada} [${nov.categoria}] ${nov.titulo}`);
    console.log(`   Por: ${nov.autor} - ${new Date(nov.fecha).toLocaleDateString('es-AR')}`);
  });

  // Intentar crear
  const puedeCrear = puedeCrearNovedad(usuario, { puede_crear: ['alumno'] });
  console.log(`\n¿Puede crear novedades? ${puedeCrear ? '✅ Sí' : '❌ No'}`);

  return true;
}

/**
 * Test 9: Caso completo - Panel de delegado
 */
export async function testCasoDelegado() {
  console.log('\n🧪 TEST 9: CASO COMPLETO - PANEL DE DELEGADO');
  console.log('=' .repeat(50));

  const novedades = await cargarNovedades();
  const usuario = {
    id: 999,
    nombre: 'Centro de Estudiantes',
    rol: 'delegado',
    carrera_id: null,
    materias: []
  };

  console.log(`\n👤 Usuario: ${usuario.nombre} (${usuario.rol})`);

  const visibles = filtrarNovedadesParaUsuario(novedades, usuario);
  console.log(`\n📰 Novedades visibles: ${visibles.length}/${novedades.length}`);

  // Tipos que puede crear
  const tiposCreacion = [
    { nombre: 'Evento del Centro', puede_crear: ['delegado'] },
    { nombre: 'Evento por Carrera', puede_crear: ['delegado'] },
    { nombre: 'Novedad Académica', puede_crear: ['docente'] }
  ];

  console.log(`\n✏️  Permisos de creación:`);
  tiposCreacion.forEach(tipo => {
    const puede = puedeCrearNovedad(usuario, tipo);
    const simbolo = puede ? '✅' : '❌';
    console.log(`   ${simbolo} ${tipo.nombre}`);
  });

  return true;
}

/**
 * Ejecutar todos los tests
 */
export async function ejecutarTodosTesting() {
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════════════╗
║    🧪 TESTING SISTEMA DE NOVEDADES - CENTRO ESTUDIANTES  ║
║                                                          ║
║            GitHub Copilot CLI - 2026-05-05              ║
╚══════════════════════════════════════════════════════════╝
  `);

  const tests = [
    { nombre: 'testEstructuraJSON', fn: testEstructuraJSON },
    { nombre: 'testPermisosLectura', fn: testPermisosLectura },
    { nombre: 'testPermisosCreacion', fn: testPermisosCreacion },
    { nombre: 'testValidaciones', fn: testValidaciones },
    { nombre: 'testOrdenamiento', fn: testOrdenamiento },
    { nombre: 'testBusqueda', fn: testBusqueda },
    { nombre: 'testAgrupacion', fn: testAgrupacion },
    { nombre: 'testCasoAlumno', fn: testCasoAlumno },
    { nombre: 'testCasoDelegado', fn: testCasoDelegado }
  ];

  let resultados = [];

  for (const test of tests) {
    try {
      const resultado = await test.fn();
      resultados.push({ nombre: test.nombre, resultado, error: null });
    } catch (error) {
      resultados.push({ nombre: test.nombre, resultado: false, error });
    }
  }

  // Resumen final
  console.log(`\n${'═'.repeat(60)}`);
  console.log('📊 RESUMEN DE TESTING');
  console.log('═'.repeat(60));

  const exitosos = resultados.filter(r => r.resultado).length;
  const totales = resultados.length;

  resultados.forEach(r => {
    const simbolo = r.resultado ? '✅' : '❌';
    console.log(`${simbolo} ${r.nombre}`);
    if (r.error) {
      console.log(`   Error: ${r.error.message}`);
    }
  });

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✅ Exitosos: ${exitosos}/${totales}`);
  console.log(`${'═'.repeat(60)}\n`);

  if (exitosos === totales) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON! Sistema listo para usar.\n');
  } else {
    console.log('⚠️  Algunos tests fallaron. Revisar arriba.\n');
  }
}

// Auto-exportar para facilitar testing
console.log(`
✨ Módulo de testing cargado.

Ejecutar en consola:
  import * as tests from './test-novedades-sistema.js';
  await tests.ejecutarTodosTesting();
`);
