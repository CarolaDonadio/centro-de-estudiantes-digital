/**
 * TESTING & EJEMPLOS - API Client
 * Copiar estos comandos en la consola del navegador (F12) para probar
 */

// ============================================================
// 1. SINCRONIZAR DATOS DESDE JSON LOCALES
// ============================================================

console.log('=== SINCRONIZAR DATOS LOCALES ===');
console.log('Ejecutar en consola:');
console.log('await sincronizarDatos()');
console.log('');

// Función de ejemplo:
async function testSincronizar() {
  console.log('🔄 Iniciando sincronización de datos...');
  try {
    const resultado = await dataSync.sincronizarTodo();
    console.log('✅ Sincronización completada');
    console.log('Exitosos:', resultado.exitosos);
    console.log('Errores:', resultado.errores);
    console.table(resultado.detalles.slice(0, 10)); // Primeros 10
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ============================================================
// 2. PRUEBAS DE CRUD - USUARIOS
// ============================================================

async function testUsuarios() {
  console.log('\n=== PRUEBAS: USUARIOS ===');
  
  try {
    // Listar
    console.log('📋 Listando usuarios...');
    const usuarios = await Usuarios.listar();
    console.log(`✓ Total: ${usuarios.length} usuarios`);
    console.table(usuarios.slice(0, 5));

    // Obtener uno
    if (usuarios.length > 0) {
      console.log('\n👤 Obteniendo usuario específico...');
      const usuario = await Usuarios.obtener(usuarios[0].id);
      console.table([usuario]);
    }

    // Crear
    console.log('\n➕ Creando usuario de prueba...');
    const nuevoUsuario = await Usuarios.crear({
      nombre: 'Test Usuario ' + Date.now(),
      usuario: 'test' + Date.now(),
      email: 'test@example.com',
      password: 'test123',
      perfil_id: 1,
      carrera_id: 1,
      dni: '12345678'
    });
    console.log('✓ Usuario creado:', nuevoUsuario);

    // Actualizar
    if (nuevoUsuario && nuevoUsuario.id) {
      console.log('\n✏️  Actualizando usuario...');
      const actualizado = await Usuarios.actualizar(nuevoUsuario.id, {
        nombre: 'Usuario Actualizado'
      });
      console.log('✓ Usuario actualizado:', actualizado);

      // Eliminar
      console.log('\n🗑️  Eliminando usuario...');
      await Usuarios.eliminar(nuevoUsuario.id);
      console.log('✓ Usuario eliminado');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ============================================================
// 3. PRUEBAS DE CRUD - MATERIAS
// ============================================================

async function testMaterias() {
  console.log('\n=== PRUEBAS: MATERIAS ===');
  
  try {
    console.log('📋 Listando materias...');
    const materias = await Materias.listar();
    console.log(`✓ Total: ${materias.length} materias`);
    console.table(materias.slice(0, 5));

    console.log('\n➕ Creando materia de prueba...');
    const nuevaMateria = await Materias.crear({
      nombre: 'Materia Test ' + Date.now(),
      codigo: 'TEST' + Math.floor(Math.random() * 1000),
      carrera_id: 1,
      docente: 'Docente Test'
    });
    console.log('✓ Materia creada:', nuevaMateria);

    if (nuevaMateria && nuevaMateria.id) {
      console.log('\n🗑️  Eliminando materia...');
      await Materias.eliminar(nuevaMateria.id);
      console.log('✓ Materia eliminada');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ============================================================
// 4. PRUEBAS DE CRUD - CALENDARIO
// ============================================================

async function testCalendario() {
  console.log('\n=== PRUEBAS: CALENDARIO ===');
  
  try {
    console.log('📅 Listando eventos del calendario...');
    const eventos = await Calendario.listar();
    console.log(`✓ Total: ${eventos.length} eventos`);
    console.table(eventos.slice(0, 5));

    console.log('\n➕ Creando evento de calendario...');
    const nuevoEvento = await Calendario.crear({
      fecha: new Date().toISOString().split('T')[0],
      titulo: 'Evento de Prueba ' + Date.now(),
      tipo: 'evento',
      color: '#4A67C9'
    });
    console.log('✓ Evento creado:', nuevoEvento);

    if (nuevoEvento && nuevoEvento.id) {
      console.log('\n🗑️  Eliminando evento...');
      await Calendario.eliminar(nuevoEvento.id);
      console.log('✓ Evento eliminado');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ============================================================
// 5. PRUEBAS - MÓDULO ADMIN
// ============================================================

async function testAdminData() {
  console.log('\n=== PRUEBAS: ADMIN DATA ===');
  
  try {
    console.log('📋 Obtener usuarios (módulo admin)...');
    const usuarios = await adminData.obtenerUsuarios();
    console.log(`✓ Total: ${usuarios.length}`);

    console.log('\n📋 Obtener carreras...');
    const carreras = await adminData.obtenerCarreras();
    console.log(`✓ Total: ${carreras.length}`);
    console.table(carreras);

    console.log('\n📋 Obtener materias...');
    const materias = await adminData.obtenerMaterias();
    console.log(`✓ Total: ${materias.length}`);

    console.log('\n🔐 Verificar permisos...');
    console.log('¿Tiene permiso para usuarios?', adminData.tienePermiso('usuarios'));
    console.log('¿Tiene permiso para reglamentación?', adminData.tienePermiso('reglamentacion'));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ============================================================
// 6. PRUEBAS - MÓDULO ALUMNO
// ============================================================

async function testAlumnoData() {
  console.log('\n=== PRUEBAS: ALUMNO DATA ===');
  
  try {
    console.log('📅 Obtener calendario...');
    const calendario = await alumnoData.obtenerCalendario();
    console.log(`✓ Total: ${calendario.length} eventos`);
    console.table(calendario.slice(0, 3));

    console.log('\n🎓 Obtener mis materias...');
    const misMaterias = await alumnoData.obtenerMisMaterias();
    console.log(`✓ Total: ${misMaterias.length} materias`);
    console.table(misMaterias);

    console.log('\n📰 Obtener novedades...');
    const novedades = await alumnoData.obtenerNovedades();
    console.log(`✓ Total: ${novedades.length} novedades`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ============================================================
// 7. PRUEBAS - UTILIDADES UI
// ============================================================

async function testUIUtils() {
  console.log('\n=== PRUEBAS: UI UTILS ===');
  
  try {
    // Cargar select
    console.log('📍 Cargando selectores...');
    await cargarSelectCarreras('selectCarrera');
    console.log('✓ Select de carreras cargado');

    // Mostrar éxito
    mostrarExito('Test de mensaje de éxito');
    console.log('✓ Mensaje mostrado');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ============================================================
// 8. COMANDO MAESTRO - EJECUTAR TODO
// ============================================================

async function runAllTests() {
  console.clear();
  console.log('🧪 INICIANDO PRUEBAS COMPLETAS\n');
  
  await testSincronizar();
  await new Promise(r => setTimeout(r, 1000));
  
  await testUsuarios();
  await new Promise(r => setTimeout(r, 1000));
  
  await testMaterias();
  await new Promise(r => setTimeout(r, 1000));
  
  await testCalendario();
  await new Promise(r => setTimeout(r, 1000));
  
  await testAdminData();
  await new Promise(r => setTimeout(r, 1000));
  
  await testAlumnoData();
  
  console.log('\n✅ PRUEBAS COMPLETADAS');
}

// ============================================================
// 9. CHEATSHEET - RESUMEN DE COMANDOS
// ============================================================

function mostrarCheatsheet() {
  console.clear();
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║        API CLIENT - CHEATSHEET DE COMANDOS                    ║
╚════════════════════════════════════════════════════════════════╝

🔄 SINCRONIZACIÓN
─────────────────────────────────────────────────────────────────
  await sincronizarDatos()
  await verResumenDatos()
  
📋 USUARIOS
─────────────────────────────────────────────────────────────────
  await Usuarios.listar()
  await Usuarios.obtener(1)
  await Usuarios.crear({nombre, usuario, email, password})
  await Usuarios.actualizar(1, {nombre})
  await Usuarios.eliminar(1)

🎓 MATERIAS
─────────────────────────────────────────────────────────────────
  await Materias.listar()
  await Materias.crear({nombre, codigo, carrera_id})
  
📅 CALENDARIO
─────────────────────────────────────────────────────────────────
  await Calendario.listar()
  await Calendario.crear({fecha, titulo, tipo, color})

🎉 EVENTOS
─────────────────────────────────────────────────────────────────
  await Eventos.listar()
  await Eventos.crear({titulo, descripcion, fecha_inicio})

👥 MÁS RECURSOS
─────────────────────────────────────────────────────────────────
  Carreras, Novedades, Notificaciones, Perfiles, Reglamentacion

🧪 PRUEBAS
─────────────────────────────────────────────────────────────────
  await runAllTests()           // Ejecutar todas las pruebas
  await testUsuarios()          // Pruebas de usuarios
  await testMaterias()          // Pruebas de materias
  await testCalendario()        // Pruebas de calendario
  await testAdminData()         // Pruebas del módulo admin
  await testAlumnoData()        // Pruebas del módulo alumno

💾 ADMIN DATA
─────────────────────────────────────────────────────────────────
  await adminData.obtenerUsuarios()
  await adminData.crearUsuario(data)
  await adminData.tienePermiso('usuarios')

👤 ALUMNO DATA
─────────────────────────────────────────────────────────────────
  await alumnoData.obtenerCalendario()
  await alumnoData.obtenerMisMaterias()
  await alumnoData.obtenerMiInfo()
  await alumnoData.actualizarMiInfo({email})

🎨 UI UTILS
─────────────────────────────────────────────────────────────────
  await renderUsuariosTable('id')
  await cargarSelectCarreras('id')
  mostrarExito('Mensaje')
  manejarError(error, 'Contexto')

═════════════════════════════════════════════════════════════════
  Más info: Ver API-README.md
═════════════════════════════════════════════════════════════════
  `);
}

// Mostrar cheatsheet al cargar
setTimeout(() => {
  console.log('💡 Escribe: mostrarCheatsheet() para ver los comandos disponibles');
}, 500);

// Exponer funciones a nivel global (navegador)
if (typeof window !== 'undefined') {
  window.testSincronizar = testSincronizar;
  window.testUsuarios = testUsuarios;
  window.testMaterias = testMaterias;
  window.testCalendario = testCalendario;
  window.testAdminData = testAdminData;
  window.testAlumnoData = testAlumnoData;
  window.testUIUtils = testUIUtils;
  window.runAllTests = runAllTests;
  window.mostrarCheatsheet = mostrarCheatsheet;
}
