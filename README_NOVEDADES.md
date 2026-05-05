# 🎯 Sistema de Novedades - Centro de Estudiantes Digital

## 📌 Descripción Rápida

Sistema completo de **novedades/avisos** con **control de acceso por rol de usuario**.

- ✅ **Tomadas del JSON** original: `centro-estudiantes-digital/json/novedades.json`
- ✅ **Modelo ampliado** con control de permisos por rol
- ✅ **4 roles implementados:** Alumno, Docente, Delegado, Admin
- ✅ **Módulo JavaScript reutilizable** sin dependencias externas
- ✅ **Documentación completa** + 8 ejemplos prácticos

---

## 📂 Estructura de Archivos

```
centro-de-estudiantes-digital.worktrees/copilot-novedades-json-modelo-aplicacion/
│
├── ✅ NOVEDADES_MODELO.md                 ← ESPECIFICACIÓN COMPLETA (400+ líneas)
├── ✅ IMPLEMENTACION_NOVEDADES.md         ← GUÍA DE INTEGRACIÓN (350+ líneas)
├── ✅ README_NOVEDADES.md                 ← ESTE ARCHIVO
│
├── centro-estudiantes-digital/
│   ├── json/
│   │   └── ✅ novedades.json              ← DATOS AMPLIADOS CON PERMISOS
│   │
│   └── js/
│       ├── ✅ novedades-filtro.js         ← MÓDULO PRINCIPAL (320 líneas)
│       └── ✅ ejemplo-uso-novedades.js    ← 8 EJEMPLOS PRÁCTICOS
```

---

## 🚀 Inicio Rápido (3 Pasos)

### Paso 1: Entender el Modelo
```bash
👉 Lee primero: NOVEDADES_MODELO.md
   - Qué es visibilidad
   - Qué es puede_crear
   - Permisos por rol
   - Validaciones
```

### Paso 2: Ver Ejemplos
```bash
👉 Revisa: ejemplo-uso-novedades.js
   - 8 casos de uso
   - Copy-paste listos
```

### Paso 3: Integrar
```bash
👉 Sigue: IMPLEMENTACION_NOVEDADES.md
   - 3 pasos de integración
   - Testing manual
```

---

## 📊 Resumen del Modelo

### Campos Nuevos en Novedades

| Campo | Tipo | Ejemplo | Descripción |
|-------|------|---------|-------------|
| `visibilidad` | String | "public" | Quién puede ver: public, carrera, materia, delegados, admin |
| `puede_crear` | Array | ["admin", "docente"] | Roles que pueden crear este tipo |
| `requiere_carrera` | Boolean | false | Si filtra por carrera_id |
| `requiere_materia` | Boolean | false | Si filtra por materia_id |

### Ejemplo Completo

```json
{
  "id": 2,
  "titulo": "Workshop de Python",
  "contenido": "3 jornadas de capacitación...",
  "categoria_id": 2,
  "categoria": "Eventos",
  "autor_id": 5,
  "autor": "Centro de Estudiantes",
  "carrera_id": 3,
  "materia_id": null,
  "destacada": true,
  "fecha": "2026-04-19T14:00:00",
  "adjunto": null,
  "icono": "event",
  
  "visibilidad": "carrera",           // ← NUEVO: Solo alumnos de carrera 3
  "puede_crear": ["admin", "delegado"],  // ← NUEVO: Admin o Delegado crean
  "requiere_carrera": true,              // ← NUEVO: Filtra por carrera
  "requiere_materia": false              // ← NUEVO: No requiere materia
}
```

---

## 🔐 Permisos por Rol

### Lectura (Quién Ve)

```
Visibilidad     Alumno  Docente  Delegado  Admin
─────────────────────────────────────────────────
"public"          ✅      ✅       ✅       ✅
"carrera"*        ✅      ✅       ✅       ✅
"materia"*        ✅      ✅       ✅       ✅
"delegados"       ❌      ✅       ✅       ✅
"admin"           ❌      ❌       ❌       ✅
```
*Requiere coincidencia de carrera/materia

### Creación (Quién Crea)

```
Puede Crear          Alumno  Docente  Delegado  Admin
──────────────────────────────────────────────────────
["admin"]              ❌      ❌        ❌       ✅
["docente"]            ❌      ✅        ❌       ✅
["delegado"]           ❌      ❌        ✅       ✅
["docente", "delegado"]❌      ✅        ✅       ✅
```

---

## 💻 Uso del Módulo JavaScript

### Función 1: Filtrar Novedades
```javascript
import { filtrarNovedadesParaUsuario } from './novedades-filtro.js';

const usuario = {
  rol: 'alumno',
  carrera_id: 3,
  materias: [1, 5, 7]
};

const visibles = filtrarNovedadesParaUsuario(todasLasNovedades, usuario);
// ✅ Retorna solo novedades que el alumno puede ver
```

### Función 2: Validar Creación
```javascript
import { validarNovedadCreada } from './novedades-filtro.js';

const validacion = validarNovedadCreada(novedad, usuario);
if (validacion.valido) {
  // Guardar
} else {
  console.log(validacion.errores);  // Array de mensajes
}
```

### Función 3: Renderizar
```javascript
import { generarHTMLNovedad, ordenarNovedades } from './novedades-filtro.js';

const ordenadas = ordenarNovedades(novedades);  // Destacadas primero
const html = generarHTMLNovedad(novedad, true);
container.insertAdjacentHTML('beforeend', html);
```

---

## 📚 Documentación Disponible

| Archivo | Contenido | Para Quién |
|---------|-----------|-----------|
| **NOVEDADES_MODELO.md** | Especificación técnica completa del sistema | Diseñadores, Desarrolladores |
| **IMPLEMENTACION_NOVEDADES.md** | Guía paso a paso de integración | Desarrolladores frontend |
| **ejemplo-uso-novedades.js** | 8 casos de uso listos para copiar | Todos |
| **novedades-filtro.js** | Código del módulo (320 líneas) | Desarrolladores |
| **novedades.json** | Datos con permisos configurados | Todos |

---

## ✅ Validaciones Implementadas

- ✅ Campos obligatorios (título, contenido, categoría)
- ✅ Longitud máxima de título (200 caracteres)
- ✅ Validación de rol en `puede_crear`
- ✅ Validación condicional de carrera y materia
- ✅ Verificación de docentes en materias correctas
- ✅ XSS prevention (escape HTML)

---

## 🧪 Testing Manual

### Test 1: Login Alumno
```
1. Login con credenciales de alumno
2. Ir a novedades
3. ✅ Verificar que ve: públicas + su carrera
4. ❌ Verificar que NO ve: delegados, admin
5. ❌ Verificar que NO puede crear
```

### Test 2: Login Docente
```
1. Login con docentes
2. ✅ Puede crear para sus materias
3. ❌ No puede crear para materias ajenas
4. ✅ Ve todo lo del alumno + delegados
```

### Test 3: Login Delegado
```
1. Login con delegado
2. ✅ Puede crear eventos del centro
3. ✅ Ve todo menos admin
4. ✅ Botones de moderación activos
```

### Test 4: Login Admin
```
1. Login con admin
2. ✅ Ve TODAS las novedades
3. ✅ Puede crear cualquier tipo
4. ✅ Acceso a editar/eliminar
```

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:**

- **Frontend:** Las validaciones aquí son **para UX solamente**
- **Backend (Semestre 2):** Validar NUEVAMENTE en servidor
- **No confiar** en rol desde cliente (sessionStorage)
- **Obtener rol** desde BD después de autenticación

---

## 📋 Checklist de Implementación

- [ ] Leer `NOVEDADES_MODELO.md` completamente
- [ ] Revisar ejemplos en `ejemplo-uso-novedades.js`
- [ ] Copiar `novedades-filtro.js` al proyecto
- [ ] Actualizar `auth.js` para guardar usuario en sessionStorage
- [ ] Integrar filtrado en página de novedades
- [ ] Crear/actualizar formulario con validaciones
- [ ] Testing con 4 roles diferentes
- [ ] Validar respeto a CLAUDE.md
- [ ] Preparar para migración backend (Semestre 2)

---

## 🎯 Próximos Pasos

### Corto Plazo (1er Semestre)
- Integración en `novedades.html`
- Formulario de creación
- UI para filtrar por categoría
- Búsqueda por texto

### Largo Plazo (2do Semestre)
- Migrar a tabla MySQL
- CRUD en CodeIgniter 4
- Replicar validaciones en servidor
- Implementar auditoría
- Soft deletes (ocultar, no eliminar)

---

## 📞 Referencia Rápida

```javascript
// Importar
import { 
  filtrarNovedadesParaUsuario,      // Filtrar visibles
  puedeVerNovedad,                   // Verificar acceso individual
  puedeCrearNovedad,                 // Validar creación
  validarNovedadCreada,              // Validación completa
  ordenarNovedades,                  // Destacadas primero
  generarHTMLNovedad,                // Renderizar card
  buscarNovedades,                   // Búsqueda
  agruparPorCategoria                // Agrupar
} from './novedades-filtro.js';

// Usuario tipo
const usuario = {
  id: 42,
  rol: 'alumno',              // 'alumno' | 'docente' | 'delegado' | 'admin'
  carrera_id: 3,
  materias: [1, 5, 7]
};

// Usar
const visibles = filtrarNovedadesParaUsuario(novedades, usuario);
const valido = validarNovedadCreada(novedad, usuario);
```

---

## ✨ Respeto a Estándares del Proyecto

✅ Sin repetición (DRY)  
✅ Responsabilidad única por archivo  
✅ ESModules (import/export)  
✅ Sin lógica en HTML  
✅ Nombres: kebab-case archivos, camelCase funciones  
✅ Validaciones centralizadas  
✅ HTML reutilizable (generarHTMLNovedad)  
✅ **Sin dependencias externas** (JavaScript vanilla)  
✅ Accesibilidad mínima (HTML semántico)  

---

## 📖 Lectura Recomendada (Orden)

1. **Este archivo** (5 min) - Visión general
2. **NOVEDADES_MODELO.md** (20 min) - Especificación técnica
3. **ejemplo-uso-novedades.js** (10 min) - Casos prácticos
4. **IMPLEMENTACION_NOVEDADES.md** (15 min) - Integración
5. **novedades-filtro.js** (10 min) - Código fuente

**Total:** ~60 minutos para comprensión completa

---

## 🎓 Para Estudiantes

Este es un **ejemplo real de desarrollo profesional:**

- ✅ Especificación clara (NOVEDADES_MODELO.md)
- ✅ Código limpio y modular (novedades-filtro.js)
- ✅ Documentación exhaustiva (3 archivos MD)
- ✅ Ejemplos prácticos (8 casos)
- ✅ Testing manual (4 escenarios)
- ✅ Escalabilidad futura (notas Semestre 2)

**Esto es lo que encontrarás en empresas profesionales.**

---

## ❓ FAQ

**P: ¿Puedo usar esto sin modificar el resto del código?**  
R: Sí, es completamente independiente. Solo llamar las funciones.

**P: ¿Necesito instalar dependencias?**  
R: No, JavaScript vanilla puro. Solo copiar el archivo .js.

**P: ¿Se puede testear sin login?**  
R: Sí, ver ejemplos en `ejemplo-uso-novedades.js` para simular usuarios.

**P: ¿Qué pasa si alguien truquea sessionStorage?**  
R: Frontend puede parecer pirata. Backend debe validar TODO (Semestre 2).

---

## 🏁 Estado

✅ **COMPLETO Y DOCUMENTADO**

Listo para:
- ✅ Integración inmediata (Semestre 1)
- ✅ Migración a backend (Semestre 2)
- ✅ Escalabilidad futura

---

**Última actualización:** 2026-05-05  
**Autor:** GitHub Copilot CLI  
**Estado:** ✅ Entregado
