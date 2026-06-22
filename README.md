# Centro de Estudiantes Digital — ISFDyT 57

Portal web para centralizar la gestión académica y estudiantil del Instituto Superior de Formación Docente y Técnica N.° 57 "Juana Paula Manso".

## 📌 Estado actual

- Proyecto frontend completo — Fase 1 finalizada.
- Tres portales diferenciados por rol: **Landing pública**, **Panel de alumnos** y **Panel de administración**.
- Consume datos desde una **API REST remota** (`https://centro-de-estudiantes-api.vercel.app`) con autenticación Basic Auth, complementada con archivos JSON locales para datos estáticos o de respaldo.

## 🚀 Cómo ejecutar

Este proyecto usa `fetch()` para consumir datos, por lo que **requiere un servidor local** (no funciona abriendo los archivos con `file://`).

### Opción 1: Python

```powershell
cd centro-estudiantes-digital
python -m http.server 8000
```

Abrir `http://localhost:8000`.

### Opción 2: Live Server en VS Code

1. Abrir la carpeta `centro-estudiantes-digital`.
2. Usar _Open with Live Server_ sobre `index.html`.

## 👤 Credenciales de prueba

| Usuario     | Contraseña  | Rol            | Acceso                    |
|-------------|-------------|----------------|---------------------------|
| `santiago`  | `1234`      | Alumno         | `pages/alumnos.html`      |
| `alumno`    | `alumno`    | Alumno         | `pages/alumnos.html`      |
| `docente`   | `docente`   | Docente        | `pages/admin.html`        |
| `delegado`  | `delegado`  | Delegado       | `pages/admin.html`        |
| `admin`     | `admin`     | Administrador  | `pages/admin.html`        |

## 📁 Estructura del proyecto

```
centro-estudiantes-digital/
├── index.html                  # Landing pública (Centro de Estudiantes)
├── css/
│   ├── styles.css              # Estilos del portal interno (alumnos/admin)
│   ├── public.css              # Estilos de la landing pública
│   ├── login.css               # Card de login y modal
│   └── admin/
│       └── modulos.css         # Estilos específicos del panel de administración
├── js/
│   ├── api-client.js           # Cliente HTTP para la API REST (CRUD de todos los recursos)
│   ├── app.js                  # Lógica principal del portal de alumnos
│   ├── login.js                # Autenticación y redirección por rol
│   ├── logout.js               # Cierre de sesión centralizado
│   ├── auth-guard.js           # Guard de rutas para páginas protegidas
│   ├── alumno-data.js          # Capa de datos para el perfil alumno
│   ├── data-sync.js            # Herramienta para sincronizar JSON locales con la API
│   ├── api-utils.js            # Funciones de renderizado de tablas y selectores
│   ├── calendario-store.js     # Store localStorage para eventos del calendario por rol
│   ├── test-api.js             # Scripts de prueba y cheatsheet para la consola
│   └── admin/
│       ├── admin-data.js       # Capa de datos y control de permisos para el panel admin
│       └── modulos.js          # Datos mock de los módulos del panel de administración
├── json/
│   ├── usuario.json            # Perfil del alumno logueado (datos de ejemplo)
│   ├── usuarios.json           # Lista de usuarios para autenticación local
│   ├── carreras.json           # Catálogo de carreras del instituto
│   ├── materias.json           # Materias con docentes, horarios y notas
│   ├── calendario.json         # Fechas académicas y tipos de eventos
│   ├── eventos.json            # Eventos del Centro de Estudiantes con cupos
│   ├── novedades.json          # Noticias y avisos con categorías y colores
│   ├── notificaciones.json     # Alertas del sistema para el usuario
│   ├── perfiles.json           # Roles del sistema
│   └── reglamentacion.json     # Documentos normativos con links y palabras clave
├── pages/
│   ├── alumnos.html            # Dashboard del alumno (sidebar + drawers + grid)
│   ├── admin.html              # Panel de administración / docente / delegado
│   └── index.html              # Redirección a la landing raíz
└── img/
    ├── favicon.svg
    └── estudiante.png          # Ilustración decorativa del hero
```

## ✅ Módulos implementados

### Portal de alumnos (`alumnos.html`)

- **Perfil**: datos personales, progreso académico y cambio de contraseña.
- **Mis Materias**: listado con asistencia, notas y estado (Regular / En riesgo / Libre), con filtros.
- **Calendario Académico**: vista mensual con puntos de eventos, lista de fechas y filtros por tipo.
- **Mis Inscripciones**: materias cursadas y mesas de examen del turno activo.
- **Mi Carrera**: plan de estudios completo con avance por año, accesos rápidos y progreso general.
- **Centro de Estudiantes**: comisión directiva, próximos eventos y datos de contacto.
- **Novedades**: feed con filtros por categoría, carrera, materia y rango de fechas.
- **Reglamentación**: buscador de documentos oficiales con filtros por tipo y categoría.
- **Notificaciones**: panel desplegable con marcado de leídas.
- **Inscripción a eventos**: desde las tarjetas de la grilla principal con actualización en tiempo real.

### Panel de administración (`admin.html`)

Accesible para los roles **Admin**, **Docente** y **Delegado**, con permisos diferenciados:

| Módulo           | Admin | Docente | Delegado |
|------------------|:-----:|:-------:|:--------:|
| Mi Perfil        | ✓     | ✓       | ✓        |
| Usuarios y Roles | ✓     |         |          |
| Carreras         | ✓     | ✓       |          |
| Novedades        | ✓     | ✓       | ✓        |
| Calendario       | ✓     | ✓       |          |
| Eventos          | ✓     | ✓       | ✓        |
| Reglamentación   | ✓     |         |          |

Cada módulo incluye CRUD completo, búsquedas, confirmación de acciones destructivas (modal con tipeo "CONFIRMAR") y toast de feedback.

## 🔌 API REST

El cliente (`js/api-client.js`) se conecta a `https://centro-de-estudiantes-api.vercel.app` con autenticación Basic Auth. Los recursos disponibles son:

`/usuarios` · `/perfiles` · `/carreras` · `/materias` · `/calendario` · `/eventos` · `/notificaciones` · `/novedades` · `/reglamentacion` · `/inscripciones`

Todos exponen los métodos `GET`, `POST`, `PUT` y `DELETE`.

Para sincronizar los JSON locales con la API, ejecutar en la consola del navegador:

```js
await sincronizarDatos()    // Carga todos los JSON hacia la API
await verResumenDatos()     // Muestra conteos por recurso
mostrarCheatsheet()         // Lista todos los comandos disponibles
```

## 🎯 Alcance — Fase 1

- Frontend con HTML5 semántico, CSS3 y JavaScript Vanilla (sin frameworks).
- Sistema de diseño propio con tokens CSS, tipografías _Bricolage Grotesque_ y _Manrope_.
- Consumo de API REST real con fallback a datos JSON locales.
- Autenticación simulada por rol con `localStorage`, guard de rutas y redirección automática.
- Calendario con store en `localStorage` (`calendario-store.js`) para persistir eventos creados por usuarios.
- Responsive design completo con sidebar hamburguesa en móvil.
- Accesibilidad básica (roles ARIA, labels, navegación por teclado).

## 🔮 Fase 2 (pendiente)

- Backend con **CodeIgniter 4** y base de datos **MySQL**.
- Reemplazar el store `localStorage` del calendario por endpoints REST.
- Implementar sesiones con JWT o tokens seguros.
- Panel de auditoría real con tabla en base de datos.
- Inscripciones persistentes en servidor.

## 📌 Notas importantes

- El archivo `pages/index.html` es una redirección automática a la landing raíz.
- La navegación principal del prototipo parte de `centro-estudiantes-digital/index.html`.
- Los datos de `fallback` embebidos en `app.js` (`window.__FALLBACK_DATA__`) permiten visualizar el portal sin servidor, pero con funcionalidad limitada.
