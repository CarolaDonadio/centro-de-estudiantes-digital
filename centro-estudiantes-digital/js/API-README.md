# API Client - Centro de Estudiantes

## 🚀 Introducción

Cliente JavaScript para consumir la API remota del Centro de Estudiantes Digital. Incluye:

- **api-client.js**: Cliente base con autenticación Basic Auth
- **admin-data.js**: Módulo de datos para panel de administración
- **alumno-data.js**: Módulo de datos para estudiantes
- **data-sync.js**: Utilidades para sincronizar datos locales con API
- **api-utils.js**: Funciones helper para renderizar tablas y formularios

---

## 📋 Configuración

### Credenciales de API

Las credenciales están configuradas en `api-client.js`:

```javascript
const API_CONFIG = {
  baseURL: 'https://centro-de-estudiantes-api.vercel.app',
  credentials: {
    user: 'grupo1',
    pass: 'PassGrupo1'
  }
};
```

**Las credenciales NO se exponen en el HTML ni en localStorage.**

---

## 🔑 Recursos Disponibles

### 1. Usuarios
```javascript
// Listar todos
await Usuarios.listar()

// Obtener uno
await Usuarios.obtener(id)

// Crear
await Usuarios.crear({ nombre, usuario, email, password, ... })

// Actualizar
await Usuarios.actualizar(id, { nombre, email, ... })

// Eliminar
await Usuarios.eliminar(id)
```

### 2. Carreras
```javascript
await Carreras.listar()
await Carreras.obtener(id)
await Carreras.crear({ nombre, codigo })
await Carreras.actualizar(id, data)
await Carreras.eliminar(id)
```

### 3. Materias
```javascript
await Materias.listar()
await Materias.obtener(id)
await Materias.crear({ nombre, codigo, carrera_id, docente })
await Materias.actualizar(id, data)
await Materias.eliminar(id)
```

### 4. Calendario
```javascript
await Calendario.listar()
await Calendario.obtener(id)
await Calendario.crear({ fecha, titulo, tipo, color })
await Calendario.actualizar(id, data)
await Calendario.eliminar(id)
```

### 5. Eventos
```javascript
await Eventos.listar()
await Eventos.obtener(id)
await Eventos.crear({ titulo, descripcion, fecha_inicio, fecha_fin })
await Eventos.actualizar(id, data)
await Eventos.eliminar(id)
```

### 6. Notificaciones
```javascript
await Notificaciones.listar()
await Notificaciones.obtener(id)
await Notificaciones.crear({ titulo, contenido })
await Notificaciones.actualizar(id, data)
await Notificaciones.eliminar(id)
```

### 7. Novedades
```javascript
await Novedades.listar()
await Novedades.obtener(id)
await Novedades.crear({ titulo, contenido })
await Novedades.actualizar(id, data)
await Novedades.eliminar(id)
```

### 8. Perfiles
```javascript
await Perfiles.listar()
await Perfiles.obtener(id)
await Perfiles.crear({ nombre })
await Perfiles.actualizar(id, data)
await Perfiles.eliminar(id)
```

### 9. Reglamentación
```javascript
await Reglamentacion.listar()
await Reglamentacion.obtener(id)
await Reglamentacion.crear({ titulo, contenido })
await Reglamentacion.actualizar(id, data)
await Reglamentacion.eliminar(id)
```

---

## 🛠️ Módulos de Datos

### AdminData (para admin.html)

```javascript
// Instancia global disponible
const adminData = new AdminData();

// Usuarios
await adminData.obtenerUsuarios()
await adminData.crearUsuario(data)
await adminData.actualizarUsuario(id, data)
await adminData.eliminarUsuario(id)

// Materias
await adminData.obtenerMaterias()
await adminData.crearMateria(data)

// Eventos
await adminData.obtenerEventos()
await adminData.crearEvento(data)

// Novedades
await adminData.obtenerNovedades()
await adminData.crearNovedad(data)

// Reglamentación
await adminData.obtenerReglamentacion()
await adminData.crearReglamento(data)

// Control de permisos
adminData.tienePermiso('usuarios') // true/false
```

### AlumnoData (para alumnos.html)

```javascript
// Instancia global disponible
const alumnoData = new AlumnoData();

// Ver
await alumnoData.obtenerCalendario()
await alumnoData.obtenerEventos()
await alumnoData.obtenerNovedades()
await alumnoData.obtenerMaterias()
await alumnoData.obtenerMisMaterias() // Solo las suyas

// Mi información
await alumnoData.obtenerMiInfo()
await alumnoData.actualizarMiInfo({ email, telefono })
await alumnoData.cambiarPassword(actual, nueva)
```

---

## 📤 Sincronización de Datos Locales

### DataSync - Cargar datos desde JSON locales

```javascript
// Instancia global
const dataSync = new DataSync();

// Sincronizar TODO
const resultado = await dataSync.sincronizarTodo();
console.log(resultado);
// {
//   exitosos: 450,
//   errores: 12,
//   detalles: [...]
// }

// Sincronizar un recurso
await dataSync.sincronizarRecurso('Usuarios', 'json/usuarios.json', Usuarios);

// Ver resumen
await dataSync.mostrarResumen();
// { usuarios: 45, carreras: 5, materias: 120, ... }

// Limpiar todos los datos (usar con cuidado)
await dataSync.limpiarTodo();
```

### Funciones de conveniencia

```javascript
// Desde la consola del navegador:
await sincronizarDatos()    // Sincronizar todo
await verResumenDatos()     // Ver cantidad de registros
```

---

## 🎨 Utilidades para UI

### Renderizar Tablas

```javascript
// Tabla de usuarios
await renderUsuariosTable('contenedorId');

// Tabla de carreras
await renderCarrerasTable('contenedorId');

// Tabla de materias
await renderMateriasTable('contenedorId');

// Calendario
await renderCalendario('contenedorId');

// Novedades
await renderNovedades('contenedorId');
```

### Cargar Selectores

```javascript
// Llenar select con carreras
await cargarSelectCarreras('selectId');

// Llenar select con perfiles
await cargarSelectPerfiles('selectId');
```

### Mensajes

```javascript
// Mostrar éxito
mostrarExito('Usuario creado exitosamente');

// Manejar errores
manejarError(error, 'Error al crear usuario');
```

---

## ⚠️ Manejo de Errores

Todos los módulos usan try/catch. Los errores se loguean en consola y se pueden capturar:

```javascript
try {
  const usuarios = await Usuarios.listar();
} catch (error) {
  console.error('Error:', error.message);
  // Error: HTTP 401: Unauthorized
}
```

---

## 🔒 Seguridad

- ✅ Credenciales NO hardcodeadas en HTML
- ✅ Credenciales NO guardadas en localStorage  
- ✅ Basic Auth con HTTPS
- ✅ Validación de permisos por rol
- ✅ No se exponen datos sensibles en la consola

---

## 📱 Uso en HTML

### admin.html

```html
<script src="js/api-client.js"></script>
<script src="js/admin/admin-data.js"></script>
<script src="js/data-sync.js"></script>
<script src="js/api-utils.js"></script>
```

### alumnos.html

```html
<script src="js/api-client.js"></script>
<script src="js/alumno-data.js"></script>
<script src="js/api-utils.js"></script>
```

---

## 💡 Ejemplos de Uso

### Crear un usuario

```javascript
try {
  const nuevoUsuario = await Usuarios.crear({
    nombre: 'María González',
    usuario: 'maria123',
    email: 'maria@isfdyt57.edu.ar',
    password: 'password123',
    perfil_id: 1,
    carrera_id: 1
  });
  console.log('✓ Usuario creado:', nuevoUsuario);
} catch (error) {
  console.error('✗ Error:', error.message);
}
```

### Actualizar datos del alumno

```javascript
try {
  await alumnoData.actualizarMiInfo({
    email: 'nuevo@email.com',
    telefono: '1234567890'
  });
  mostrarExito('Datos actualizados');
} catch (error) {
  manejarError(error, 'Error al actualizar');
}
```

### Sincronizar datos desde local a API

```javascript
console.log('Iniciando sincronización...');
const resultado = await sincronizarDatos();
console.log(`✓ ${resultado.exitosos} registros creados`);
console.log(`✗ ${resultado.errores} errores`);
```

---

## 🐛 Debugging

Abre la consola del navegador (F12) y prueba:

```javascript
// Ver resumen de datos
await verResumenDatos();

// Listar todos los usuarios
const usuarios = await Usuarios.listar();
console.table(usuarios);

// Listar todas las materias
const materias = await Materias.listar();
console.table(materias);

// Ver información del usuario actual
const miInfo = await alumnoData.obtenerMiInfo();
console.log(miInfo);
```

---

## 📚 Estructura de Archivos

```
js/
├── api-client.js          ← Cliente base (CRUD genérico)
├── admin/
│   └── admin-data.js      ← Módulo para admins
├── alumno-data.js         ← Módulo para alumnos
├── data-sync.js           ← Sincronización de datos
├── api-utils.js           ← Utilidades para UI
├── app.js                 ← Lógica de alumnos.html
├── admin-auth.js          ← Autenticación del admin
├── login.js               ← Lógica de login
└── logout.js              ← Lógica de logout
```

---

## ✨ Características

- ✅ CRUD completo para 9 recursos
- ✅ Async/await (sin callbacks)
- ✅ Manejo robusto de errores
- ✅ Control de permisos por rol
- ✅ Sincronización de datos locales
- ✅ Utilidades para renderizar UI
- ✅ Sin dependencias externas
- ✅ Código documentado

---

**Última actualización**: Mayo 2026
