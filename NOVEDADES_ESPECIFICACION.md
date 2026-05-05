# Sistema de Novedades - Especificación Exacta

## 📋 Especificación Oficial (Proyecto Integrador)

Del documento `01_Proyecto_Integrador_Centro_Estudiantes.md`:

**Módulo 2: Novedades**  
Sistema de publicación de noticias y avisos con categorización, adjuntos y filtros.

- ✅ Categorías: **Académico, Social, Institucional, Urgente**
- ✅ Posibilidad de destacar/fijar publicaciones
- ✅ Filtros por carrera, materia, fecha
- ✅ Adjuntos: imágenes y documentos PDF
- ✅ Permisos: Docentes publican para sus materias; Delegados publican generales

---

## 🏗️ Estructura de Datos

### Objeto Novedad (JSON)

```json
{
  "id": 1,
  "titulo": "Apertura de inscripciones a mesas de exámenes de Julio",
  "contenido": "Ya se encuentra disponible el sistema de inscripción...",
  "categoria_id": 1,
  "categoria": "Académico",
  "autor_id": 2,
  "autor": "Secretaría Académica",
  "materia_id": null,
  "carrera_id": null,
  "destacada": true,
  "fecha": "2026-04-20T10:30:00",
  "adjunto": "cronograma_mesas_julio.pdf",
  "icono": "academic",
  "visibilidad": "public",
  "puede_crear": ["admin", "docente"],
  "requiere_carrera": false,
  "requiere_materia": false
}
```

### Campos Detallados

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-----------|-------------|
| `id` | Number | ✅ | Identificador único |
| `titulo` | String | ✅ | Título (máx 200 caracteres) |
| `contenido` | String | ✅ | Cuerpo del mensaje |
| `categoria_id` | Number | ✅ | FK a categorías (1-4) |
| `categoria` | String | ✅ | Nombre categoría (referencia) |
| `autor_id` | Number | ✅ | FK a Usuario |
| `autor` | String | ✅ | Nombre autor (referencia) |
| `materia_id` | Number | ❌ | FK a Materia si aplica |
| `carrera_id` | Number | ❌ | FK a Carrera si aplica |
| `destacada` | Boolean | ✅ | Fija en la parte superior |
| `fecha` | ISO 8601 | ✅ | Fecha/hora publicación |
| `adjunto` | String | ❌ | Nombre archivo (PDF/imagen) |
| `icono` | String | ✅ | Icono CSS o emoji |
| `visibilidad` | String | ✅ | public, carrera, materia, delegados, admin |
| `puede_crear` | Array | ✅ | Roles: admin, delegado, docente, alumno |
| `requiere_carrera` | Boolean | ✅ | Si filtra por carrera_id |
| `requiere_materia` | Boolean | ✅ | Si filtra por materia_id |

---

## 📂 Categorías (SEGÚN ESPECIFICACIÓN)

| ID | Nombre | Descripción | Color |
|----|--------|-------------|-------|
| 1 | **Académico** | Inscripciones, exámenes, calendarios, becas | #3A5BA9 |
| 2 | **Social** | Convivencia, bienestar, actividades sociales | #E67E5B |
| 3 | **Institucional** | Talleres, charlas, eventos del centro | #3DAA6A |
| 4 | **Urgente** | Comunicados urgentes, avisos críticos | #DC2626 |

---

## 🔐 Control de Acceso

### Visibilidad (Quién Ve)

| Valor | Acceso | Ejemplo |
|-------|--------|---------|
| `"public"` | Todos: alumno ✅, docente ✅, delegado ✅, admin ✅ | Noticia general |
| `"carrera"` | Si coincide carrera_id | Evento de carrera específica |
| `"materia"` | Si inscripto en materia_id | Aviso de un docente |
| `"delegados"` | delegado ✅, admin ✅ | Comunicado interno |
| `"admin"` | admin ✅ | Información sensible |

### Creación (Quién Crea) - SEGÚN ESPECIFICACIÓN

**Especificación:**
- ✅ Docentes publican para sus materias
- ✅ Delegados publican generales

| Rol | Puede Crear | Restricción |
|-----|-----------|-------------|
| **Alumno** | ❌ No | - |
| **Docente** | ✅ Sí | Solo para sus materias (`requiere_materia: true`) |
| **Delegado** | ✅ Sí | Novedades generales/eventos (`requiere_carrera: false`, `requiere_materia: false`) |
| **Admin** | ✅ Sí | Cualquier tipo sin restricción |

---

## 🔍 Filtros Requeridos (SEGÚN ESPECIFICACIÓN)

La especificación requiere:
- ✅ Filtros por **carrera**
- ✅ Filtros por **materia**
- ✅ Filtros por **fecha**

Implementación en el módulo:
```javascript
filtrarNovedadesParaUsuario(novedades, usuario)  // Por rol + carrera/materia
filtrarPorFecha(novedades, fechaInicio, fechaFin)
buscarNovedades(novedades, termino)
```

---

## 📎 Adjuntos (SEGÚN ESPECIFICACIÓN)

Tipos soportados:
- ✅ Imágenes: `.jpg`, `.png`, `.gif`, `.svg`
- ✅ Documentos: `.pdf`, `.doc`, `.docx`

Validación requerida:
```javascript
const extensionesPermitidas = [
  'pdf', 'jpg', 'png', 'gif', 'svg',
  'doc', 'docx'
];

function validarAdjunto(archivo) {
  const ext = archivo.split('.').pop().toLowerCase();
  return extensionesPermitidas.includes(ext);
}
```

---

## 📊 Matriz de Permisos

### Lectura por Rol

```
Visibilidad     Alumno  Docente  Delegado  Admin
───────────────────────────────────────────────
public            ✅      ✅       ✅       ✅
carrera*          ✅      ✅       ✅       ✅
materia*          ✅      ✅       ✅       ✅
delegados         ❌      ✅       ✅       ✅
admin             ❌      ❌       ❌       ✅
```

### Creación por Rol

```
Tipo de Novedad           Alumno  Docente  Delegado  Admin
──────────────────────────────────────────────────────────
Académica (para materia)    ❌      ✅        ❌       ✅
Evento del centro           ❌      ❌        ✅       ✅
Urgente                     ❌      ❌        ❌       ✅
Social                      ❌      ❌        ✅       ✅
```

---

## ✅ Validaciones Requeridas

### Al Crear Novedad

- [ ] `titulo` no vacío, máx 200 caracteres
- [ ] `contenido` no vacío
- [ ] `categoria_id` válido (1-4)
- [ ] `autor_id` coincide con usuario autenticado
- [ ] Si `requiere_carrera: true` → `carrera_id` debe estar definido
- [ ] Si `requiere_materia: true` → `materia_id` debe estar definido
- [ ] Si docente: verificar que enseña la materia
- [ ] Si adjunto: validar extensión permitida
- [ ] Rol del usuario está en `puede_crear`

### Al Ver Novedades

- [ ] Filtrar por `visibilidad`
- [ ] Si `visibilidad: "carrera"` → usuario tiene esa carrera
- [ ] Si `visibilidad: "materia"` → usuario inscripto
- [ ] Si `visibilidad: "delegados"` → usuario es delegado o admin
- [ ] Si `visibilidad: "admin"` → usuario es admin

---

## 📝 Ejemplos de Configuración

### Novedad Académica - Docente para Materia

```json
{
  "titulo": "Cambio de fecha del parcial",
  "categoria_id": 1,
  "categoria": "Académico",
  "visibilidad": "materia",
  "puede_crear": ["docente", "admin"],
  "requiere_carrera": false,
  "requiere_materia": true,
  "materia_id": 5
}
```

### Evento del Centro - Delegado

```json
{
  "titulo": "Workshop de Python",
  "categoria_id": 3,
  "categoria": "Institucional",
  "visibilidad": "carrera",
  "puede_crear": ["delegado", "admin"],
  "requiere_carrera": true,
  "requiere_materia": false,
  "carrera_id": 3
}
```

### Comunicado Urgente - Admin

```json
{
  "titulo": "Cierre de plataforma por mantenimiento",
  "categoria_id": 4,
  "categoria": "Urgente",
  "visibilidad": "public",
  "puede_crear": ["admin"],
  "requiere_carrera": false,
  "requiere_materia": false,
  "destacada": true
}
```

---

## 🚀 Implementación

Todas las funciones se encuentran en:
- **Módulo principal:** `js/novedades-filtro.js`
- **Ejemplos:** `js/ejemplo-uso-novedades.js`
- **Tests:** `js/test-novedades-sistema.js`

---

## 📎 Archivos

- `centro-estudiantes-digital/json/novedades.json` - Datos con permisos
- `centro-estudiantes-digital/js/novedades-filtro.js` - Módulo de lógica
- `centro-estudiantes-digital/js/ejemplo-uso-novedades.js` - Casos de uso
- `centro-estudiantes-digital/js/test-novedades-sistema.js` - Testing

---

**Documento conforme a:** 01_Proyecto_Integrador_Centro_Estudiantes.md (Módulo 2: Novedades)  
**Versión:** 1.1 (Actualizado para especificación exacta)  
**Rama:** rama-carola
