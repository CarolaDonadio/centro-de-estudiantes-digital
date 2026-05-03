```
Instituto Superior de Formación Docente y Técnica N°
Tecnicatura Superior en Ciencia de Datos e Inteligencia Artificial
```
## PROYECTO INTEGRADOR

# Centro de Estudiantes

# Digital

### Documento de Especificación del Proyecto

Año Académico 2025
Materias: Técnicas de Programación (1er Sem.) + Aproximación al Campo Laboral (2do Sem.)


## ÍNDICE DE CONTENIDOS

- 1. Descripción del Proyecto
- 2. Objetivos
- 3. Alcance y Módulos
   - 3.1 Módulos Obligatorios...............................................................................
   - 3.2 Módulos Opcionales.................................................................................
- 4. Perfiles de Usuario
- 5. Modelo de Datos
- 6. División por Semestre
   - 6.1 Primer Semestre (Frontend)..................................................................
   - 6.2 Segundo Semestre (Backend)...............................................................
- 7. Tecnologías
- 8. Metodología de Trabajo
- 9. Entregables
- 10. Criterios de Evaluación


## 1. Descripción del Proyecto

El proyecto "Centro de Estudiantes Digital" consiste en el desarrollo de una plataforma
web que permita centralizar la comunicación y gestión de información académica del
instituto. La plataforma servirá como punto de encuentro digital entre alumnos,
docentes y el centro de estudiantes.
El proyecto se desarrolla en dos etapas integradas a lo largo del año académico:

- Primer Semestre: Desarrollo del frontend completo con HTML, CSS y JavaScript,
consumiendo una API mock con datos simulados en JSON.
- Segundo Semestre: Migración al backend con CodeIgniter 4 y MySQL,
implementando persistencia real, autenticación y seguridad.
💡 **Integración Curricular**
Este proyecto integra los contenidos de Técnicas de Programación (JavaScript, APIs, DOM)
con Administración de BBDD (MySQL, SQL, normalización) y Aproximación al Campo
Laboral (metodologías ágiles, trabajo en equipo).

### 1.1 Contexto del Problema

Actualmente, la comunicación entre el centro de estudiantes, los docentes y los
alumnos se realiza de forma dispersa: grupos de WhatsApp, correos electrónicos,
carteleras físicas y avisos verbales. Esto genera:

- Información fragmentada y difícil de encontrar
- Pérdida de novedades importantes
- Dificultad para coordinar eventos
- Falta de un repositorio centralizado de reglamentos

### 1.2 Solución Propuesta

Una plataforma web accesible desde cualquier dispositivo que permita:

- Publicar y consultar novedades categorizadas
- Visualizar el calendario académico con fechas de exámenes y eventos
- Acceder a reglamentos y documentación oficial
- Inscribirse a eventos organizados por el centro de estudiantes
- Gestionar la información según el perfil del usuario


## 2. Objetivos

### 2.1 Objetivos Generales

- Desarrollar una aplicación web completa utilizando tecnologías modernas de
frontend y backend
- Aplicar metodologías ágiles de desarrollo de software (Scrum/Kanban)
- Integrar conocimientos de múltiples materias en un producto funcional
- Simular un entorno de trabajo profesional con roles definidos

### 2.2 Objetivos Específicos - 1er Semestre

- Diseñar interfaces de usuario responsivas y accesibles
- Implementar interactividad con JavaScript (DOM, eventos, validaciones)
- Crear y consumir una API REST mock con datos JSON
- Aplicar versionado de código con Git y GitHub
- Trabajar en equipo con división de tareas y seguimiento

### 2.3 Objetivos Específicos - 2do Semestre

- Migrar el frontend a un framework MVC (CodeIgniter 4)
- Diseñar e implementar una base de datos normalizada en MySQL
- Implementar autenticación y autorización por roles
- Desarrollar APIs REST reales con validaciones del lado servidor
- Aplicar buenas prácticas de seguridad (CSRF, XSS, SQL injection)
- Realizar pruebas y documentar el sistema


## 3. Alcance y Módulos

### 3.1 Módulos Obligatorios...............................................................................

**Módulo 1: Gestión de Usuarios**
Sistema de autenticación y autorización con cuatro perfiles diferenciados. En el primer
semestre se simula con JSON; en el segundo se implementa con CI4 Shield.

```
Funcionalidad Alumno Docente Delegado Admin
Registro/Login ✓ ✓ ✓ ✓
Ver perfil propio ✓ ✓ ✓ ✓
Editar perfil propio ✓ ✓ ✓ ✓
Gestionar usuarios — — — ✓
Asignar roles — — — ✓
```
**Módulo 2: Novedades**
Sistema de publicación de noticias y avisos con categorización, adjuntos y filtros.

- Categorías: Académico, Social, Institucional, Urgente
- Posibilidad de destacar/fijar publicaciones
- Filtros por carrera, materia, fecha
- Adjuntos: imágenes y documentos PDF
- Permisos: Docentes publican para sus materias; Delegados publican generales

**Módulo 3: Calendario Académico**
Visualización de fechas importantes del año académico.

- Fechas de exámenes finales y parciales
- Períodos de inscripción
- Eventos institucionales
- Feriados y recesos
- Vista mensual y semanal
- Filtros por carrera/materia

**Módulo 4: Reglamentación**
Repositorio centralizado de documentos oficiales.

- Categorías: Régimen académico, Convivencia, Becas, Centro de estudiantes
- Versionado de documentos
- Búsqueda por palabras clave
- Sección de Preguntas Frecuentes (FAQ)


**Módulo 5: Eventos**
Gestión de eventos organizados por el centro de estudiantes.

- Creación de eventos con fecha, descripción y cupo
- Inscripción online de alumnos
- Lista de inscriptos (visible para organizadores)
- Estado del evento: Abierto, Cerrado, Finalizado


### 3.2 Módulos Opcionales.................................................................................

Para equipos que completen los módulos obligatorios antes del cierre:

**Módulo 6: Encuestas (Opcional)**

- Crear encuestas con diferentes tipos de preguntas
- Participación anónima o identificada
- Visualización de resultados

**Módulo 7: Galería de Fotos (Opcional)**

- Álbumes por evento
- Carga múltiple de imágenes
- Visualización tipo lightbox

**Módulo 8: Materias y Cursada (Opcional)**

- Integración con base de datos de Admin BBDD
- Ver materias inscriptas
- Horarios de cursada
- Estado de regularidad


## 4. Perfiles de Usuario

### 4.1 Alumno

Usuario básico del sistema. Puede consultar información y participar en eventos.

```
Capacidad Descripción
Ver novedades Accede al feed de novedades filtrado por su carrera
Consultar calendario Ve fechas de exámenes y eventos
Ver reglamentos Descarga documentos oficiales
Inscribirse a eventos Se anota en eventos con cupo disponible
Editar perfil Modifica sus datos de contacto
```
### 4.2 Docente

Puede publicar información relacionada con sus materias.

```
Capacidad Descripción
Todo lo de Alumno Hereda las capacidades básicas
Publicar novedades Crea avisos para sus materias
Cargar fechas de examen Agrega fechas al calendario
Ver lista de alumnos Consulta inscriptos a sus materias
```
### 4.3 Delegado / Centro de Estudiantes

Representa al centro de estudiantes. Gestiona eventos y comunicación general.

```
Capacidad Descripción
Todo lo de Alumno Hereda las capacidades básicas
Publicar novedades generales Avisos para toda la comunidad
Crear/gestionar eventos Organiza actividades del centro
Ver inscriptos a eventos Controla participación
Moderar contenido Puede ocultar publicaciones inapropiadas
```
### 4.4 Administrador

Control total del sistema. Gestiona usuarios y configuración.

```
Capacidad Descripción
Gestión de usuarios Crear, editar, activar/desactivar usuarios
```

Asignar roles Cambiar el perfil de cualquier usuario
Gestionar categorías Crear/editar categorías de novedades
Gestionar reglamentos Subir y versionar documentos
Configuración general Ajustes del sistema
Ver auditoría Consultar logs de acciones


## 5. Modelo de Datos

El siguiente modelo de datos soporta todas las funcionalidades del sistema. En el
primer semestre se simula con archivos JSON; en el segundo se implementa en
MySQL.

### 5.1 Diagrama de Entidades

**Entidades Principales**

```
Entidad Descripción Campos Clave
Usuario Usuarios del sistema id, dni, nombre, email, password_hash,
perfil_id, carrera_id, activo
Perfil Roles del sistema id, nombre, descripcion
Carrera Carreras del instituto id, codigo, nombre
Materia Materias de cada carrera id, codigo, nombre, carrera_id
Novedad Publicaciones del sistema id, titulo, contenido, categoria_id,
autor_id, fecha, destacada, materia_id
Categoria Categorías de novedades id, nombre, color, icono
Evento Eventos organizados id, titulo, descripcion, fecha_inicio,
fecha_fin, cupo, autor_id, estado
Inscripcion_Evento Alumnos inscriptos id, evento_id, usuario_id,
fecha_inscripcion
Calendario Fechas académicas id, titulo, tipo, fecha, materia_id,
descripcion
Reglamento Documentos oficiales id, titulo, categoria, archivo, version,
fecha
```
### 5.2 Esquema SQL (Extracto)

**SQL**
1 │ -- Tabla de Perfiles
2 │ CREATE TABLE Perfil (
3 │ id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
4 │ nombre VARCHAR(50) NOT NULL UNIQUE,
5 │ descripcion VARCHAR(200)
6 │ ) ENGINE=InnoDB;
7 │
8 │ -- Tabla de Usuarios
9 │ CREATE TABLE Usuario (
10 │ id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
11 │ dni CHAR(8) NOT NULL UNIQUE,
12 │ nombre VARCHAR(100) NOT NULL,
13 │ email VARCHAR(120) NOT NULL UNIQUE,
14 │ password_hash VARCHAR(255) NOT NULL,


15 │ perfil_id INT UNSIGNED NOT NULL,
16 │ carrera_id BIGINT UNSIGNED,
17 │ activo BOOLEAN DEFAULT TRUE,
18 │ created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
19 │ CONSTRAINT fk_usuario_perfil FOREIGN KEY (perfil_id) REFERENCES Perfil(id),
20 │ CONSTRAINT fk_usuario_carrera FOREIGN KEY (carrera_id) REFERENCES
Carrera(id_carrera)
21 │ ) ENGINE=InnoDB;
22 │
23 │ -- Tabla de Novedades
24 │ CREATE TABLE Novedad (
25 │ id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
26 │ titulo VARCHAR(200) NOT NULL,
27 │ contenido TEXT NOT NULL,
28 │ categoria_id INT UNSIGNED NOT NULL,
29 │ autor_id BIGINT UNSIGNED NOT NULL,
30 │ materia_id BIGINT UNSIGNED,
31 │ destacada BOOLEAN DEFAULT FALSE,
32 │ fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
33 │ CONSTRAINT fk_novedad_autor FOREIGN KEY (autor_id) REFERENCES Usuario(id),
34 │ INDEX idx_novedad_fecha (fecha DESC)
35 │ ) ENGINE=InnoDB;
36 │
37 │ -- Tabla de Eventos
38 │ CREATE TABLE Evento (
39 │ id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
40 │ titulo VARCHAR(200) NOT NULL,
41 │ descripcion TEXT,
42 │ fecha_inicio DATETIME NOT NULL,
43 │ fecha_fin DATETIME,
44 │ cupo INT UNSIGNED,
45 │ autor_id BIGINT UNSIGNED NOT NULL,
46 │ estado ENUM('abierto','cerrado','finalizado') DEFAULT 'abierto',
47 │ CONSTRAINT fk_evento_autor FOREIGN KEY (autor_id) REFERENCES Usuario(id)
48 │ ) ENGINE=InnoDB;
49 │
50 │ -- Inscripciones a Eventos
51 │ CREATE TABLE Inscripcion_Evento (
52 │ id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
53 │ evento_id BIGINT UNSIGNED NOT NULL,
54 │ usuario_id BIGINT UNSIGNED NOT NULL,
55 │ fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
56 │ UNIQUE KEY uq_inscripcion (evento_id, usuario_id),
57 │ CONSTRAINT fk_inscevento_evento FOREIGN KEY (evento_id) REFERENCES Evento(id),
58 │ CONSTRAINT fk_inscevento_usuario FOREIGN KEY (usuario_id) REFERENCES
Usuario(id)
59 │ ) ENGINE=InnoDB;


## 6. División por Semestre

### 6.1 Primer Semestre - Frontend + API Mock

Materia: Técnicas de Programación

```
Sprint Semanas Entregables
Sprint 1 1-2 Setup del proyecto, diseño UI/UX, maquetas, estructura HTML
base
Sprint 2 3-4 Estilos CSS responsivos, componentes visuales, navegación
Sprint 3 5-6 API Mock (JSON Server o archivos), login simulado, listado de
novedades
Sprint 4 7-8 Calendario interactivo (JS), filtros dinámicos
Sprint 5 9-10 Módulo de eventos, formularios con validación JS
Sprint 6 11-12 Integración completa, testing manual, documentación, demo
```
**Tecnologías 1er Semestre:**

- HTML5 semántico
- CSS3 (Flexbox, Grid) o framework como Tailwind/Bootstrap
- JavaScript vanilla (ES6+)
- JSON como fuente de datos mock
- Git/GitHub para versionado
- Opcional: JSON Server para simular API REST

**Estructura de la API Mock
JSON**
1 │ // Archivo: /api/data.json
2 │ {
3 │ "usuarios": [
4 │ { "id": 1, "dni": "12345678", "nombre": "Juan Pérez",
5 │ "email": "juan@instituto.edu", "perfil": "alumno", "carrera_id": 1 },
6 │ { "id": 2, "dni": "87654321", "nombre": "Prof. García",
7 │ "email": "garcia@instituto.edu", "perfil": "docente" }
8 │ ],
9 │ "novedades": [
10 │ { "id": 1, "titulo": "Inscripción abierta",
11 │ "contenido": "...", "categoria": "academico",
12 │ "autor_id": 2, "fecha": "2025-03-15", "destacada": true }
13 │ ],
14 │ "eventos": [
15 │ { "id": 1, "titulo": "Jornada de bienvenida",
16 │ "fecha_inicio": "2025-03-20T10:00", "cupo": 50, "estado": "abierto" }
17 │ ]
18 │ }


### 6.2 Segundo Semestre - Backend CI4 + MySQL

Materia: Aproximación al Campo Laboral

```
Sprint Semanas Entregables
Sprint 1 1-2 Setup CI4, migraciones DB, seeders con datos de prueba
Sprint 2 3-4 Autenticación con CI4 Shield, sistema de roles
Sprint 3 5-6 CRUD de novedades con permisos, API REST
Sprint 4 7-8 Gestión de eventos, inscripciones con validación
Sprint 5 9-10 Calendario integrado con BBDD, reportes SQL
Sprint 6 11-12 Seguridad, testing, optimización, documentación, demo final
```
**Tecnologías 2do Semestre:**

- CodeIgniter 4 (PHP 8.x)
- MySQL/MariaDB con InnoDB
- XAMPP/WAMP como entorno de desarrollo
- CI4 Shield para autenticación
- PHPUnit para testing
- GitHub Actions para CI/CD básico

**Integración con Base de Datos de Admin BBDD**
El esquema se integra con las tablas ya diseñadas en la materia Administración de
BBDD:

- Carrera (id_carrera, nombre, codigo)
- Alumno → se extiende a Usuario con perfil
- Profesor → se integra como Usuario con perfil docente
- Materia (si se implementa el módulo opcional)


## 7. Tecnologías

```
Categoría 1er Semestre 2do Semestre
Frontend HTML5, CSS3, JavaScript
ES6+
```
```
Vistas CI4 (PHP), CSS, JS
```
```
Backend — (mock JSON) CodeIgniter 4, PHP 8.x
Base de Datos Archivos JSON MySQL 8 / MariaDB
Autenticación Simulada (localStorage) CI4 Shield
Versionado Git + GitHub Git + GitHub + CI/CD
Metodología Scrum/Kanban Scrum/Kanban
IDE VS Code VS Code
Servidor Local Live Server / http-server XAMPP + Spark
```

## 8. Metodología de Trabajo

### 8.1 Organización del Equipo

Cada equipo está compuesto por 5 integrantes con roles definidos:

```
Rol Responsabilidades
Project Manager (PM) Planifica sprints, coordina equipo, remueve impedimentos,
comunica con docente
Frontend Developer (x2) Diseño UI/UX, maquetación, estilos, interactividad JS
Backend Developer API mock (1er sem), CI4 + MySQL (2do sem), validaciones
QA / Documentación Casos de prueba, testing, documentación técnica y de usuario
```
### 8.2 Ceremonias Ágiles

- Planning: Al inicio de cada sprint (30-45 min)
- Daily: Reunión breve de seguimiento (10-15 min, puede ser asíncrona)
- Review: Demo al final del sprint
- Retrospectiva: Qué mejorar, qué mantener

### 8.3 Tablero Kanban

```
Columna Criterio de Entrada Criterio de Salida WIP
Backlog Historia definida Priorizada y estimada —
To Do Criterios de aceptación claros Asignada a un dev —
In Progress Branch creado PR abierto 2/dev
Code Review PR listo, CI pasa Aprobado 1/rev
QA Desplegable Tests pasados 3
Done Aprobado por PM Mergeado —
```
### 8.4 Versionado con Git

- Rama main: código estable, protegida
- Rama develop: integración (opcional)
- Ramas feature/xxx: desarrollo de funcionalidades
- Pull Requests obligatorios con al menos 1 revisor
- Commits siguiendo Conventional Commits: feat:, fix:, docs:, etc.


## 9. Entregables

### 6.1 Primer Semestre (Frontend)..................................................................

```
Entregable Descripción Formato
Repositorio GitHub Código fuente con historial de commits Link al repo
Aplicación funcional Frontend desplegable (GitHub Pages o
similar)
```
#### URL

```
API Mock Archivos JSON con datos de prueba En repositorio
Documentación README con instrucciones de instalación Markdown
Demo Presentación del producto funcionando Video o en vivo
```
### 6.2 Segundo Semestre (Backend)...............................................................

```
Entregable Descripción Formato
Repositorio GitHub Código CI4 + migraciones + seeds Link al repo
Base de datos Esquema SQL + datos de prueba Archivo .sql
Aplicación funcional Sistema completo corriendo en XAMPP Demo local
Documentación técnica Arquitectura, APIs, modelo de datos Markdown/PDF
Manual de usuario Guía de uso por perfil PDF
Plan de pruebas Casos ejecutados y resultados Documento
Presentación final Demo + defensa del proyecto Slides + demo
```

## 10. Criterios de Evaluación

### 10.1 Rúbrica General

```
Criterio Peso Descripción
Funcionalidad 30% El sistema cumple con los requisitos definidos
Calidad de código 20% Código limpio, organizado, buenas prácticas
Diseño UI/UX 15% Interfaz usable, accesible, responsiva
Trabajo en equipo 15% Uso de Git, distribución de tareas, comunicación
Documentación 10% README, comentarios, manual de usuario
Presentación/Demo 10% Claridad, manejo del tiempo, respuestas
```
### 10.2 Escala de Calificación

```
Nota Descripción
10 Supera las expectativas, funcionalidades extra implementadas
8-9 Cumple todos los requisitos con buena calidad
6-7 Cumple requisitos mínimos con algunas deficiencias
4-5 Cumple parcialmente, requiere correcciones importantes
1-3 No cumple con los requisitos mínimos
⚠️ Importante
La evaluación es tanto grupal como individual. Se considerará la participación activa en
commits, PRs y reuniones.
```

