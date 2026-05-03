# 🎓 Centro de Estudiantes Digital — ISFDyT 57

Portal académico unificado que conecta alumnos, docentes y el Centro de Estudiantes del Instituto Superior de Formación Docente y Técnica N.° 57 "Juana Paula Manso".

> **Fase 1 del proyecto**: Frontend con HTML5 semántico, CSS3 y JavaScript Vanilla (ES6+). Los datos se simulan con una API Mock basada en archivos JSON.

---

## 📁 Estructura del proyecto

```
centro-estudiantes-digital/
├── index.html              # Dashboard principal (Sprint 1)
├── css/
│   └── styles.css          # Estilos responsivos + animaciones (Sprint 2)
├── js/
│   └── app.js              # Lógica: fetch JSON, drawer, calendario, filtros (Sprint 3-5)
├── json/                   # API Mock — estos JSON se consumen por fetch()
│   ├── usuario.json        # Datos del estudiante logueado
│   ├── novedades.json      # Feed con categorías (Módulo 2)
│   ├── eventos.json        # Eventos CE con cupos (Módulo 5)
│   ├── calendario.json     # Exámenes, feriados, inscripciones (Módulo 3)
│   └── reglamentacion.json # Documentos oficiales (Módulo 4)
└── README.md               # Este archivo
```

---

## 🚀 Cómo correr el proyecto localmente

La app consume JSON vía `fetch()`, así que **necesitás un servidor local** (no funciona con `file://` por políticas CORS del navegador).

### Opción 1 — Python (recomendado, viene preinstalado)
```bash
cd centro-estudiantes-digital
python3 -m http.server 8000
# Abrir http://localhost:8000
```

### Opción 2 — Node (si tenés instalado)
```bash
npx serve .
```

### Opción 3 — Extensión Live Server en VSCode
1. Instalá **Live Server** (Ritwick Dey).
2. Click derecho sobre `index.html` → *Open with Live Server*.

---

## 🎨 Sistema de diseño

### Paleta
| Token | Hex | Uso |
|---|---|---|
| `--brand-700` | `#2C3E87` | Primario — títulos, logo |
| `--brand-500` | `#4A67C9` | Botones, acentos |
| `--brand-300` | `#8FA3E3` | Periwinkle — decoraciones |
| `--accent-amber` | `#F5A623` | Destacados académicos |
| `--accent-coral` | `#E67E5B` | Eventos sociales, errores |
| `--accent-green` | `#3DAA6A` | Estados positivos, becas |
| `--accent-violet` | `#8B5CF6` | Eventos CE |

### Tipografía
- **Display**: [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) (400–800) — títulos, números grandes.
- **Body**: [Manrope](https://fonts.google.com/specimen/Manrope) (300–700) — texto corrido, UI.

### Principios
- **Glassmorphism sutil** en sidebar y header (`backdrop-filter: blur`).
- **Animaciones con stagger** al cargar (`animation-delay: var(--delay)`).
- **Micro-interacciones**: elevación al hover, tooltip lateral en sidebar.
- **Drawer lateral** entra de izquierda a derecha con `cubic-bezier(0.25, 1, 0.3, 1)` y fondo difuminado.

---

## 🧭 Los 6 botones del sidebar

| # | Icono | Acción | Drawer abierto |
|---|---|---|---|
| 1 | 👤 Usuario | Mi Perfil | Avatar, legajo, DNI, carrera, progreso |
| 2 | 📰 Líneas | Novedades | Listado completo + buscador |
| 3 | 📅 Calendario | Calendario Académico | Vista mensual interactiva con filtros |
| 4 | ⭐ Estrella | Eventos CE | Lista con cupos + formulario de inscripción |
| 5 | 📄 Documento | Reglamentación | Repositorio con buscador por palabras clave |
| 6 | 🚪 Salir | Sesión | Cambiar contraseña + Cerrar sesión |

> **Hover**: aparece un tooltip lateral con el nombre del botón.
> **Click**: se abre el drawer lateral con fondo difuminado (blur 14px).
> **Cerrar**: clic fuera, botón ✕ o tecla `Escape`.

---

## 📊 Módulos implementados (Fase 1)

| Módulo | Descripción | Estado |
|---|---|---|
| M1 — Gestión de Usuarios | Perfiles: Alumno, Docente, Delegado, Admin | ✅ Frontend |
| M2 — Novedades | Categorías, filtros, archivos adjuntos, buscador | ✅ Frontend |
| M3 — Calendario | Vista mensual interactiva con exámenes/feriados/inscripciones | ✅ Frontend |
| M4 — Reglamentación | Repositorio con buscador por palabras clave | ✅ Frontend |
| M5 — Eventos | Creación con cupo + inscripciones online | ✅ Frontend |

---

## 🗃️ Modelo de datos (base para Fase 2 — MySQL/MariaDB)

```sql
-- Tabla Usuario
CREATE TABLE usuario (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  dni             VARCHAR(15) UNIQUE NOT NULL,
  nombre          VARCHAR(100) NOT NULL,
  email           VARCHAR(120) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  perfil_id       INT NOT NULL,
  carrera_id      INT,
  activo          TINYINT(1) DEFAULT 1,
  FOREIGN KEY (perfil_id)  REFERENCES perfil(id),
  FOREIGN KEY (carrera_id) REFERENCES carrera(id)
);

-- Tabla Perfil
CREATE TABLE perfil (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  nombre      VARCHAR(50) NOT NULL,
  descripcion TEXT
);

-- Tabla Novedad
CREATE TABLE novedad (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  titulo        VARCHAR(200) NOT NULL,
  contenido     TEXT NOT NULL,
  categoria_id  INT NOT NULL,
  autor_id      INT NOT NULL,
  materia_id    INT,
  destacada     TINYINT(1) DEFAULT 0,
  fecha         DATETIME NOT NULL,
  FOREIGN KEY (autor_id) REFERENCES usuario(id)
);

-- Tabla Evento
CREATE TABLE evento (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  titulo       VARCHAR(200) NOT NULL,
  descripcion  TEXT,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin    DATETIME NOT NULL,
  cupo         INT NOT NULL,
  autor_id     INT NOT NULL,
  estado       ENUM('activo','cancelado','finalizado') DEFAULT 'activo',
  FOREIGN KEY (autor_id) REFERENCES usuario(id)
);

-- Tabla intermedia Inscripcion_Evento
CREATE TABLE inscripcion_evento (
  evento_id         INT NOT NULL,
  usuario_id        INT NOT NULL,
  fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (evento_id, usuario_id),
  FOREIGN KEY (evento_id)  REFERENCES evento(id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
```

---

## 🌿 Convenciones Git

- Rama `main`: código estable y desplegable.
- Ramas `feature/xxx`: nuevas funcionalidades.
- Ramas `fix/xxx`: corrección de bugs.
- Integración **obligatoriamente por Pull Request**.
- Mensajes siguiendo [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar drawer lateral con animación spring
fix: corregir alineación del avatar en mobile
docs: actualizar README con instrucciones de setup
style: ajustar paleta de colores del calendario
refactor: extraer helpers de fecha a módulo utils
```

---

## 🔜 Roadmap Fase 2 (Backend)

- **Sprint 1**: Setup CodeIgniter 4 + PHP 8.x, migraciones, seeders.
- **Sprint 2**: Autenticación y roles con CI4 Shield.
- **Sprint 3**: CRUD de novedades con API REST.
- **Sprint 4**: Gestión de eventos e inscripciones.
- **Sprint 5**: Calendario conectado a BD + reportes.
- **Sprint 6**: Hardening (CSRF, SQL Injection) + PHPUnit.

---

## 👤 Usuario de prueba actual (hardcodeado en `json/usuario.json`)

```
Nombre:    Santiago Chiale
Legajo:    2024-0342
Perfil:    Alumno
Carrera:   Ciencias de Datos e IA
```

Para cambiar de usuario, editá directamente ese JSON (o más adelante, cuando tengamos backend, usá el login).
