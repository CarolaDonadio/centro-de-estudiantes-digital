# Modelo de Datos: Novedades (News System)

## Descripción General

El sistema de novedades es un módulo para publicar avisos, anuncios y comunicaciones categorizadas con **control de acceso por rol de usuario**. Cada novedad tiene permisos específicos según quién la ve y quién la puede crear.

---

## Estructura de Datos

### Objeto Novedad (en JSON)

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

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Number | ID único de la novedad |
| `titulo` | String | Título de la novedad (200 caracteres máx.) |
| `contenido` | String | Cuerpo completo del mensaje |
| `categoria_id` | Number | FK a categorías (Académico, Eventos, Becas, etc.) |
| `categoria` | String | Nombre de categoría (para referencia rápida) |
| `autor_id` | Number | FK a Usuario que la creó |
| `autor` | String | Nombre del autor (para referencia) |
| `materia_id` | Number \| null | FK a Materia si aplica (e.j: tarea de un docente) |
| `carrera_id` | Number \| null | FK a Carrera si aplica (e.j: evento de una carrera específica) |
| `destacada` | Boolean | `true` si debe mostrarse en primer lugar |
| `fecha` | ISO 8601 DateTime | Fecha/hora de publicación |
| `adjunto` | String \| null | Nombre de archivo adjunto (PDF, imagen, etc.) |
| `icono` | String | Icono CSS/emoji para la categoría |
| **`visibilidad`** | String (enum) | **Nivel de acceso** (ver tabla abajo) |
| **`puede_crear`** | String[] | **Roles que pueden crear** este tipo de novedad |
| **`requiere_carrera`** | Boolean | `true` si el alumno ve solo si coincide `carrera_id` |
| **`requiere_materia`** | Boolean | `true` si solo docentes de esa materia pueden crear |

---

## Enumeraciones

### `visibilidad` (Quién puede VER)

| Valor | Acceso Permitido | Descripción |
|-------|------------------|-------------|
| `"public"` | Todos | Visible para alumno, docente, delegado, admin |
| `"carrera"` | Por carrera | Solo alumnos/docentes de esa carrera |
| `"materia"` | Por materia | Solo alumnos/docentes de esa materia (requiere `materia_id`) |
| `"delegados"` | Delegado + Admin | Solo delegados y admin |
| `"admin"` | Solo Admin | Acceso restringido al administrador |

### `puede_crear` (Quién puede CREAR)

Array de roles que pueden publicar novedades de este tipo:
- `"admin"` → Administrador (acceso total)
- `"delegado"` → Delegado/Centro de Estudiantes
- `"docente"` → Profesor (solo para sus materias si `requiere_materia=true`)
- `"alumno"` → Alumno (muy raro; generalmente no pueden publicar)

---

## Permisos por Rol

### Alumno
**Lectura:**
- ✅ Novedades públicas (`visibilidad: "public"`)
- ✅ Novedades de su carrera (`visibilidad: "carrera"` + coincide `carrera_id`)
- ✅ Novedades de sus materias (`visibilidad: "materia"` si está inscripto)
- ❌ Novedades de delegados o admin

**Creación:**
- ❌ No puede crear novedades (excepto casos especiales)

### Docente
**Lectura:**
- ✅ Todo lo que ve alumno
- ✅ Novedades de delegados (`visibilidad: "delegados"`)
- ❌ Novedades restringidas a admin

**Creación:**
- ✅ Crear novedades académicas para sus materias (`puede_crear: ["docente"]`)
- ✅ Si la novedad tiene `requiere_materia: true`, solo puede crear para materias donde enseña

### Delegado (Centro de Estudiantes)
**Lectura:**
- ✅ Todo lo que ve docente

**Creación:**
- ✅ Crear eventos generales (`visibilidad: "public"` + `puede_crear: ["delegado"]`)
- ✅ Crear eventos por carrera (`visibilidad: "carrera"` + `puede_crear: ["delegado"]`)
- ✅ Moderar/ocultar publicaciones inapropiadas

### Admin
**Lectura:**
- ✅ **Acceso total** a todas las novedades

**Creación:**
- ✅ Crear/editar/eliminar cualquier tipo de novedad
- ✅ Gestionar categorías y permisos
- ✅ Cambiar visibilidad y destacados

---

## Matriz de Visibilidad

```
┌─────────────┬──────────┬──────────┬─────────┬────────┐
│ Visibilidad │ Alumno   │ Docente  │ Delegado│ Admin  │
├─────────────┼──────────┼──────────┼─────────┼────────┤
│ public      │ ✅ SÍ   │ ✅ SÍ   │ ✅ SÍ  │ ✅ SÍ │
│ carrera*    │ ✅ Si ok │ ✅ Si ok │ ✅ SÍ  │ ✅ SÍ │
│ materia*    │ ✅ Si ok │ ✅ Si ok │ ✅ SÍ  │ ✅ SÍ │
│ delegados   │ ❌ NO   │ ✅ SÍ   │ ✅ SÍ  │ ✅ SÍ │
│ admin       │ ❌ NO   │ ❌ NO   │ ❌ NO  │ ✅ SÍ │
└─────────────┴──────────┴──────────┴─────────┴────────┘
  * Requiere que carrera_id o materia_id coincida (o esté inscripto)
```

---

## Matriz de Creación

```
┌─────────────────────────────────────────────┬───────┬───────┬─────────┬────────┐
│ Tipo de Novedad (puede_crear)               │ Docen │ Delega│ Admin   │ Alumno │
├─────────────────────────────────────────────┼───────┼───────┼─────────┼────────┤
│ ["admin"]                                   │ ❌    │ ❌    │ ✅ SÍ  │ ❌    │
│ ["admin", "docente"]                        │ ✅    │ ❌    │ ✅ SÍ  │ ❌    │
│ ["admin", "delegado"]                       │ ❌    │ ✅    │ ✅ SÍ  │ ❌    │
│ ["admin", "docente", "delegado"]            │ ✅    │ ✅    │ ✅ SÍ  │ ❌    │
└─────────────────────────────────────────────┴───────┴───────┴─────────┴────────┘
```

---

## Ejemplos de Configuración

### 1. Noticia Académica General
```json
{
  "titulo": "Apertura de inscripciones",
  "visibilidad": "public",
  "puede_crear": ["admin", "docente"],
  "requiere_carrera": false,
  "requiere_materia": false
}
```
✅ Todos la ven | 📝 Admin y Docente pueden crear

### 2. Evento por Carrera
```json
{
  "titulo": "Workshop de Python para Ciencia de Datos",
  "carrera_id": 3,
  "visibilidad": "carrera",
  "puede_crear": ["admin", "delegado"],
  "requiere_carrera": true,
  "requiere_materia": false
}
```
✅ Solo alumnos/docentes de carrera 3 la ven | 📝 Admin y Delegado crean

### 3. Aviso de Docente (Materia Específica)
```json
{
  "titulo": "Cambio de fecha de parcial",
  "materia_id": 15,
  "visibilidad": "materia",
  "puede_crear": ["docente"],
  "requiere_carrera": false,
  "requiere_materia": true
}
```
✅ Solo alumnos inscriptos en materia 15 | 📝 Solo docente de materia 15

### 4. Comunicado Admin
```json
{
  "titulo": "Mantenimiento del sistema",
  "visibilidad": "admin",
  "puede_crear": ["admin"],
  "requiere_carrera": false,
  "requiere_materia": false
}
```
✅ Solo Admin la ve | 📝 Solo Admin

---

## Validaciones Requeridas

### Al Crear Novedad
- [ ] `titulo` no vacío, máx 200 caracteres
- [ ] `contenido` no vacío
- [ ] `categoria_id` existe en lista de categorías
- [ ] `autor_id` existe y coincide con usuario autenticado (salvo admin)
- [ ] Si `requiere_carrera: true` → `carrera_id` debe estar definido
- [ ] Si `requiere_materia: true` → `materia_id` debe estar definido
- [ ] Rol del usuario está en `puede_crear`
- [ ] Si es docente con `requiere_materia: true` → docente enseña esa materia

### Al Ver Novedades
- [ ] Filtrar por `visibilidad` y comparar con rol
- [ ] Si `visibilidad: "carrera"` → usuario tiene esa `carrera_id`
- [ ] Si `visibilidad: "materia"` → usuario inscripto en esa `materia_id`
- [ ] Si `visibilidad: "delegados"` → usuario es delegado o admin
- [ ] Si `visibilidad: "admin"` → usuario es admin

---

## Implementación en JavaScript

Ver archivo `js/novedades-filtro.js` para funciones de:
- `filtrarNovedadesParaUsuario(novedades, usuario)` → Filtra por visibilidad
- `puedeCrearNovedad(usuario, tipoNovedad)` → Valida permisos de creación
- `validarNovedadCreada(novedad, usuario)` → Valida antes de enviar
- `renderizarNovedadesConPermiso(novedades, usuario)` → Renderiza en HTML

---

## Notas

- **Backend (Semestre 2):** Implementar validaciones en servidor; esta lógica JSON es solo referencia.
- **Auditoría:** Se recomienda registrar quién creó/editó/eliminó cada novedad.
- **Moderación:** Delegados pueden marcar novedades como "ocultas" sin eliminarlas (agregar campo `oculta: boolean`).
- **Caché:** Novedades públicas pueden cachearse; las personalizadas requieren API dinámica.
