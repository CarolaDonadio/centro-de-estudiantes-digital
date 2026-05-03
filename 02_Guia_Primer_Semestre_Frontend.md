# GUÍA DEL PRIMER SEMESTRE

## Frontend + API Mock

## Centro de Estudiantes Digital

## Materia: Técnicas de Programación


## 1. Objetivos del Semestre

#### Al finalizar el primer semestre, el equipo habrá desarrollado el frontend completo de la

#### aplicación "Centro de Estudiantes Digital", consumiendo datos de una API mock creada

#### por el propio equipo.

- Diseñar interfaces de usuario responsivas y accesibles
- Implementar interactividad con JavaScript (DOM, eventos, fetch)
- Crear una API REST mock con datos en formato JSON
- Aplicar versionado de código con Git y GitHub
- Trabajar en equipo siguiendo metodología Scrum/Kanban

## 2. Estructura del Proyecto

**Estructura**
1 │ centro-estudiantes-digital/
2 │ ├── index.html # Página principal
3 │ ├── pages/
4 │ │ ├── login.html
5 │ │ ├── novedades.html
6 │ │ ├── calendario.html
7 │ │ ├── eventos.html
8 │ │ ├── reglamentos.html
9 │ │ └── perfil.html
10 │ ├── css/
11 │ │ ├── styles.css # Estilos globales
12 │ │ ├── components.css # Componentes reutilizables
13 │ │ └── responsive.css # Media queries
14 │ ├── js/
15 │ │ ├── app.js # Inicialización
16 │ │ ├── auth.js # Login/logout simulado
17 │ │ ├── api.js # Funciones de fetch
18 │ │ ├── novedades.js
19 │ │ ├── calendario.js
20 │ │ ├── eventos.js
21 │ │ └── utils.js # Funciones auxiliares
22 │ ├── api/
23 │ │ ├── usuarios.json
24 │ │ ├── novedades.json
25 │ │ ├── eventos.json
26 │ │ ├── calendario.json
27 │ │ └── reglamentos.json
28 │ ├── assets/
29 │ │ ├── images/
30 │ │ └── docs/
31 │ └── README.md


## 3. Cronograma de Sprints

### 3.1 Sprint 1: Setup y Diseño (Semanas 1-2)

#### Objetivos:

- Crear repositorio GitHub con estructura base
- Definir paleta de colores, tipografía, componentes
- Crear wireframes/mockups de las pantallas principales
- Implementar HTML semántico de la estructura base

#### Entregables:

- Repositorio creado con README inicial
- Guía de estilos (colores, fuentes, componentes)
- Wireframes de al menos 4 pantallas
- index.html con estructura semántica

### 3.2 Sprint 2: Maquetación CSS (Semanas 3-4)

#### Objetivos:

- Implementar estilos CSS para todas las pantallas
- Crear componentes reutilizables (cards, botones, formularios)
- Implementar diseño responsivo (mobile first)
- Crear navegación funcional entre páginas

#### Entregables:

- Todas las páginas HTML maquetadas
- CSS organizado y responsive
- Navegación funcionando

### 3.3 Sprint 3: API Mock y Auth (Semanas 5-6)

#### Objetivos:

- Crear archivos JSON con datos de prueba
- Implementar sistema de login simulado
- Cargar y mostrar listado de novedades con fetch
- Implementar filtros básicos

#### Entregables:

- API mock completa (todos los JSON)
- Login funcional con localStorage
- Listado de novedades dinámico


### 3.4 Sprint 4: Calendario (Semanas 7-8)

#### Objetivos:

- Implementar visualización de calendario mensual
- Mostrar eventos/fechas del JSON
- Implementar filtros por tipo de fecha
- Navegación entre meses

### 3.5 Sprint 5: Eventos (Semanas 9-10)

#### Objetivos:

- Mostrar listado de eventos con estado
- Implementar inscripción a eventos (simulada)
- Validación de formularios con JavaScript
- Feedback visual al usuario

### 3.6 Sprint 6: Integración y Demo (Semanas 11-12)

#### Objetivos:

- Integrar todos los módulos
- Testing manual completo
- Corregir bugs y pulir detalles
- Documentar y preparar demo


## 4. API Mock: Especificación

### 4.1 Estructura de usuarios.json

###### JSON

###### 1 │ {

2 │ "usuarios": [
3 │ {
4 │ "id": 1,
5 │ "dni": "12345678",
6 │ "nombre": "Juan Pérez",
7 │ "email": "juan.perez@instituto.edu",
8 │ "password": "123456",
9 │ "perfil": "alumno",
10 │ "carrera_id": 1,
11 │ "activo": true
12 │ },
13 │ {
14 │ "id": 2,
15 │ "dni": "87654321",
16 │ "nombre": "Prof. María García",
17 │ "email": "maria.garcia@instituto.edu",
18 │ "password": "docente123",
19 │ "perfil": "docente",
20 │ "materias": [1, 3],
21 │ "activo": true
22 │ },
23 │ {
24 │ "id": 3,
25 │ "dni": "11223344",
26 │ "nombre": "Carlos López",
27 │ "email": "carlos.lopez@instituto.edu",
28 │ "password": "delegado123",
29 │ "perfil": "delegado",
30 │ "carrera_id": 1,
31 │ "activo": true
32 │ },
33 │ {
34 │ "id": 4,
35 │ "dni": "99887766",
36 │ "nombre": "Admin Sistema",
37 │ "email": "admin@instituto.edu",
38 │ "password": "admin123",
39 │ "perfil": "admin",
40 │ "activo": true
41 │ }
42 │ ],
43 │ "perfiles": [
44 │ { "id": "alumno", "nombre": "Alumno", "permisos": ["ver_novedades",
"ver_calendario", "inscribir_eventos"] },
45 │ { "id": "docente", "nombre": "Docente", "permisos": ["ver_novedades",
"crear_novedades", "ver_calendario", "crear_fecha"] },
46 │ { "id": "delegado", "nombre": "Delegado", "permisos": ["ver_novedades",
"crear_novedades", "crear_eventos", "moderar"] },
47 │ { "id": "admin", "nombre": "Administrador", "permisos": ["*"] }
48 │ ]
49 │ }


### 4.2 Estructura de novedades.json

###### JSON

###### 1 │ {

2 │ "categorias": [
3 │ { "id": 1, "nombre": "Académico", "color": "#1F4E79", "icono": " " },📚
4 │ { "id": 2, "nombre": "Social", "color": "#70AD47", "icono": "🎉" },
5 │ { "id": 3, "nombre": "Institucional", "color": "#FFC000", "icono": " " },🏛️
6 │ { "id": 4, "nombre": "Urgente", "color": "#C00000", "icono": "⚠ " }
7 │ ],
8 │ "novedades": [
9 │ {
10 │ "id": 1,
11 │ "titulo": "Inscripción a materias del 2do cuatrimestre",
12 │ "contenido": "Se encuentra abierta la inscripción...",
13 │ "categoria_id": 1,
14 │ "autor_id": 4,
15 │ "fecha": "2025-07-15T10:00:00",
16 │ "destacada": true,
17 │ "carrera_id": null,
18 │ "materia_id": null,
19 │ "adjuntos": ["cronograma.pdf"]
20 │ },
21 │ {
22 │ "id": 2,
23 │ "titulo": "Parcial de Técnicas de Programación",
24 │ "contenido": "Recordamos que el parcial será...",
25 │ "categoria_id": 1,
26 │ "autor_id": 2,
27 │ "fecha": "2025-05-10T14:30:00",
28 │ "destacada": false,
29 │ "carrera_id": 1,
30 │ "materia_id": 1,
31 │ "adjuntos": []
32 │ }
33 │ ]
34 │ }


## 5. Código de Ejemplo

### 5.1 Sistema de Login Simulado (auth.js)

**JavaScript**
1 │ // auth.js - Sistema de autenticación simulado
2 │
3 │ const AUTH_KEY = 'centro_estudiantes_user';
4 │
5 │ async function login(email, password) {
6 │ try {
7 │ const response = await fetch('/api/usuarios.json');
8 │ const data = await response.json();
9 │
10 │ const usuario = data.usuarios.find(
11 │ u => u.email === email && u.password === password && u.activo
12 │ );
13 │
14 │ if (usuario) {
15 │ // Guardar en localStorage (sin password)
16 │ const { password: _, ...userSafe } = usuario;
17 │ localStorage.setItem(AUTH_KEY, JSON.stringify(userSafe));
18 │ return { success: true, user: userSafe };
19 │ } else {
20 │ return { success: false, error: 'Credenciales inválidas' };
21 │ }
22 │ } catch (error) {
23 │ return { success: false, error: 'Error de conexión' };
24 │ }
25 │ }
26 │
27 │ function logout() {
28 │ localStorage.removeItem(AUTH_KEY);
29 │ window.location.href = '/pages/login.html';
30 │ }
31 │
32 │ function getCurrentUser() {
33 │ const data = localStorage.getItem(AUTH_KEY);
34 │ return data? JSON.parse(data) : null;
35 │ }
36 │
37 │ function isAuthenticated() {
38 │ return getCurrentUser() !== null;
39 │ }
40 │
41 │ function hasPermission(permission) {
42 │ const user = getCurrentUser();
43 │ if (!user) return false;
44 │ if (user.perfil === 'admin') return true;
45 │ // Verificar permisos del perfil...
46 │ return false;
47 │ }
48 │
49 │ function requireAuth() {
50 │ if (!isAuthenticated()) {
51 │ window.location.href = '/pages/login.html';
52 │ }


###### 53 │ }

###### 54 │

55 │ export { login, logout, getCurrentUser, isAuthenticated, hasPermission,
requireAuth };

### 5.2 Fetch de Novedades (novedades.js)

**JavaScript**
1 │ // novedades.js - Gestión de novedades
2 │
3 │ import { getCurrentUser, hasPermission } from './auth.js';
4 │
5 │ const API_URL = '/api/novedades.json';
6 │
7 │ async function cargarNovedades(filtros = {}) {
8 │ try {
9 │ const response = await fetch(API_URL);
10 │ const data = await response.json();
11 │
12 │ let novedades = data.novedades;
13 │
14 │ // Aplicar filtros
15 │ if (filtros.categoria) {
16 │ novedades = novedades.filter(n => n.categoria_id === filtros.categoria);
17 │ }
18 │ if (filtros.carrera) {
19 │ novedades = novedades.filter(n =>
20 │ n.carrera_id === null || n.carrera_id === filtros.carrera
21 │ );
22 │ }
23 │ if (filtros.destacadas) {
24 │ novedades = novedades.filter(n => n.destacada);
25 │ }
26 │
27 │ // Ordenar por fecha descendente
28 │ novedades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
29 │
30 │ return { success: true, novedades, categorias: data.categorias };
31 │ } catch (error) {
32 │ console.error('Error cargando novedades:', error);
33 │ return { success: false, error: 'No se pudieron cargar las novedades' };
34 │ }
35 │ }
36 │
37 │ function renderNovedades(novedades, categorias, container) {
38 │ container.innerHTML = '';
39 │
40 │ if (novedades.length === 0) {
41 │ container.innerHTML = '<p class="empty">No hay novedades para mostrar</p>';
42 │ return;
43 │ }
44 │
45 │ novedades.forEach(novedad => {
46 │ const categoria = categorias.find(c => c.id === novedad.categoria_id);
47 │ const card = crearCardNovedad(novedad, categoria);
48 │ container.appendChild(card);
49 │ });
50 │ }
51 │
52 │ function crearCardNovedad(novedad, categoria) {


53 │ const card = document.createElement('article');
54 │ card.className = 'card novedad-card';
55 │ if (novedad.destacada) card.classList.add('destacada');
56 │
57 │ card.innerHTML = `
58 │ <header class="card-header">
59 │ <span class="categoria" style="background: ${categoria?.color || '#666'}">
60 │ ${categoria?.icono || ''} ${categoria?.nombre || 'General'}
61 │ </span>
62 │ <time datetime="${novedad.fecha}">
63 │ ${formatearFecha(novedad.fecha)}
64 │ </time>
65 │ </header>
66 │ <h3 class="card-title">${novedad.titulo}</h3>
67 │ <p class="card-content">${novedad.contenido}</p>
68 │ ${novedad.destacada? '<span class="badge destacada"> Destacada</span>' : ⭐
''}
69 │ `;
70 │
71 │ return card;
72 │ }
73 │
74 │ function formatearFecha(fechaISO) {
75 │ const fecha = new Date(fechaISO);
76 │ return fecha.toLocaleDateString('es-AR', {
77 │ day: 'numeric',
78 │ month: 'long',
79 │ year: 'numeric'
80 │ });
81 │ }
82 │
83 │ export { cargarNovedades, renderNovedades };


## 6. Criterios de Aceptación

### 6.1 Funcionalidades Mínimas

##### Funcionalidad Criterio de Aceptación

##### Login Usuario puede ingresar con email/password; se muestra error si falla;

##### se redirige a home si ok

##### Logout Se elimina sesión de localStorage y redirige a login

##### Listado novedades Se muestran novedades ordenadas por fecha; se ve categoría con

##### color; funcionan filtros

##### Calendario Se muestra mes actual; se ven fechas del JSON; se puede navegar

##### entre meses

##### Eventos Se listan eventos con estado; se puede inscribir si hay cupo; se

##### muestra confirmación

##### Responsive La app se ve correctamente en mobile (320px), tablet (768px) y

##### desktop (1024px+)

### 6.2 Checklist de Entrega

- Repositorio GitHub con historial de commits de todos los integrantes
- README.md con instrucciones de instalación y uso
- Todas las páginas HTML funcionando
- API mock con datos realistas
- Login/logout funcional
- Al menos 3 módulos completamente implementados
- Diseño responsive verificado
- Sin errores en consola del navegador


