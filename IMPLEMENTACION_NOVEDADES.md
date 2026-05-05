# Guía de Implementación: Sistema de Novedades por Rol

## 📋 Contenido Entregado

### 1. **Datos Ampliados** (`centro-estudiantes-digital/json/novedades.json`)
El archivo JSON original ahora incluye campos de control de acceso:
- `visibilidad`: Define quién puede ver cada novedad
- `puede_crear`: Array de roles que pueden crear este tipo
- `requiere_carrera`: Si filtra por carrera del usuario
- `requiere_materia`: Si filtra por materia inscripta

**Cambios:**
```json
{
  "id": 1,
  "titulo": "...",
  "contenido": "...",
  // ... campos originales ...
  "visibilidad": "public",           // ← NUEVO
  "puede_crear": ["admin", "docente"],  // ← NUEVO
  "requiere_carrera": false,            // ← NUEVO
  "requiere_materia": false             // ← NUEVO
}
```

---

### 2. **Documentación del Modelo** (`NOVEDADES_MODELO.md`)

Especificación completa del sistema con:
- ✅ Definición de campos
- ✅ Enumeraciones (`visibilidad`, `puede_crear`)
- ✅ Permisos por rol (Alumno, Docente, Delegado, Admin)
- ✅ Matrices de visibilidad y creación
- ✅ Ejemplos de configuración
- ✅ Validaciones requeridas

**Consultar este archivo para:**
- Entender qué ve cada rol
- Definir nuevos tipos de novedades
- Implementar validaciones en el backend (Semestre 2)

---

### 3. **Módulo JavaScript Reutilizable** (`centro-estudiantes-digital/js/novedades-filtro.js`)

Implementación de toda la lógica de permisos sin dependencias externas.

#### Funciones Principales:

**A. Filtrar Novedades**
```javascript
import { filtrarNovedadesParaUsuario } from './novedades-filtro.js';

const usuarioActual = {
  rol: 'alumno',
  carrera_id: 3,
  materias: [1, 5, 7]
};

const novedades = await fetch('/json/novedades.json').then(r => r.json());
const visibles = filtrarNovedadesParaUsuario(novedades.novedades, usuarioActual);
// ✅ Retorna solo novedades que el alumno puede ver
```

**B. Validar Creación**
```javascript
import { puedeCrearNovedad, validarNovedadCreada } from './novedades-filtro.js';

const usuario = { rol: 'docente', materias: [1, 5] };
const novedad = {
  titulo: 'Cambio de fecha',
  puede_crear: ['docente'],
  requiere_materia: true,
  materia_id: 5
};

const puede = puedeCrearNovedad(usuario, novedad); // ✅ true
const validacion = validarNovedadCreada(novedad, usuario);
if (validacion.valido) {
  // Guardar novedad
} else {
  console.log(validacion.errores); // Array de errores
}
```

**C. Ordenar y Buscar**
```javascript
import { ordenarNovedades, buscarNovedades } from './novedades-filtro.js';

const ordenadas = ordenarNovedades(novedades);  // Destacadas primero
const resultados = buscarNovedades(ordenadas, 'Python'); // Búsqueda por texto
```

**D. Renderizar HTML**
```javascript
import { generarHTMLNovedad } from './novedades-filtro.js';

const html = generarHTMLNovedad(novedad, mostrarBotones);
container.insertAdjacentHTML('beforeend', html);
```

---

### 4. **Ejemplos de Uso** (`centro-estudiantes-digital/js/ejemplo-uso-novedades.js`)

Archivo con 8 ejemplos prácticos listos para copiar-pegar:

1. ✅ Cargar y filtrar novedades según rol
2. ✅ Verificar visibilidad individual
3. ✅ Validar antes de crear novedad
4. ✅ Verificar permisos de creación
5. ✅ Renderizar lista en HTML
6. ✅ Buscar y filtrar combinado
7. ✅ Caso completo: Panel de Alumnos
8. ✅ Caso completo: Panel de Delegados

**Ejecutar en consola del navegador:**
```javascript
import * as ejemplos from './ejemplo-uso-novedades.js';
await ejemplos.mostrarNovedadesAlUsuario();
```

---

## 🚀 Cómo Integrar en tu Proyecto

### Paso 1: Actualizar la Sesión del Usuario

En tu módulo de autenticación (`js/auth.js`), guardar datos del usuario:

```javascript
// Después de login exitoso
const usuario = {
  id: 42,
  nombre: 'Juan Pérez',
  rol: 'alumno',              // alumno, docente, delegado, admin
  carrera_id: 3,              // ID de su carrera
  materias: [1, 5, 7]         // IDs de materias inscriptas (si es docente/alumno)
};

sessionStorage.setItem('usuario_actual', JSON.stringify(usuario));
```

### Paso 2: Cargar Novedades Filtradas

En el componente donde muestres novedades:

```javascript
import { filtrarNovedadesParaUsuario, ordenarNovedades } from './novedades-filtro.js';

async function mostrarNovedades() {
  const respuesta = await fetch('/json/novedades.json');
  const datos = await respuesta.json();
  
  const usuario = JSON.parse(sessionStorage.getItem('usuario_actual'));
  const filtradas = filtrarNovedadesParaUsuario(datos.novedades, usuario);
  const ordenadas = ordenarNovedades(filtradas);
  
  // Renderizar en el DOM
  renderizar(ordenadas);
}
```

### Paso 3: Validar Formulario de Creación

En el formulario para crear novedades:

```javascript
import { validarNovedadCreada } from './novedades-filtro.js';

const formCrear = document.getElementById('form-crear-novedad');
formCrear.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const novedad = {
    titulo: formCrear.titulo.value,
    contenido: formCrear.contenido.value,
    categoria_id: formCrear.categoria.value,
    puede_crear: ['docente', 'admin'], // Según tipo
    requiere_materia: true,
    materia_id: formCrear.materia?.value
  };
  
  const usuario = JSON.parse(sessionStorage.getItem('usuario_actual'));
  const validacion = validarNovedadCreada(novedad, usuario);
  
  if (!validacion.valido) {
    mostrarErrores(validacion.errores);
    return;
  }
  
  enviarAlServidor(novedad);
});
```

---

## 📊 Matriz de Decisión Rápida

### ¿Qué ve cada rol?

| Tipo de Novedad | Alumno | Docente | Delegado | Admin |
|-----------------|--------|---------|----------|-------|
| `visibilidad: "public"` | ✅ | ✅ | ✅ | ✅ |
| `visibilidad: "carrera"` + coincide carrera | ✅ | ✅ | ✅ | ✅ |
| `visibilidad: "materia"` + inscripto | ✅ | ✅ | ✅ | ✅ |
| `visibilidad: "delegados"` | ❌ | ✅ | ✅ | ✅ |
| `visibilidad: "admin"` | ❌ | ❌ | ❌ | ✅ |

### ¿Quién puede crear?

| Tipo | Alumno | Docente | Delegado | Admin |
|------|--------|---------|----------|-------|
| `puede_crear: ["admin"]` | ❌ | ❌ | ❌ | ✅ |
| `puede_crear: ["docente"]` | ❌ | ✅ | ❌ | ✅ |
| `puede_crear: ["delegado"]` | ❌ | ❌ | ✅ | ✅ |
| `puede_crear: ["docente", "delegado"]` | ❌ | ✅ | ✅ | ✅ |

---

## 🧪 Testing Manual

### Test 1: Login como Alumno
```
1. Abrir navegador en incógnito
2. Ir a login.html
3. Introducir credenciales de alumno
4. Ir a novedades.html
5. Verificar que SOLO ve novedades públicas y de su carrera
6. Intentar crear novedad → Debe estar deshabilitado
```

### Test 2: Login como Docente
```
1. Login con docente
2. Ir a novedades.html
3. Verificar que ve todo lo que ve alumno + delegados
4. Intentar crear novedad académica para su materia → Permitido
5. Intentar crear para materia que no enseña → Debe mostrar error
```

### Test 3: Login como Delegado
```
1. Login con delegado
2. Ir a novedades.html
3. Verificar que ve todo excepto admin
4. Intentar crear evento del centro → Permitido
5. Intentar crear algo marcado como admin-only → Debe mostrar error
```

### Test 4: Login como Admin
```
1. Login con admin
2. Ir a novedades.html (o panel admin)
3. Verificar que ve TODAS las novedades
4. Poder crear cualquier tipo de novedad
5. Ver opciones de editar/eliminar
```

---

## 🔐 Seguridad - Implementación Backend (Semestre 2)

⚠️ **IMPORTANTE:** Todo lo anterior es validación **frontend**. 

En el **segundo semestre** con CodeIgniter 4:

1. **Replicar todas las validaciones en servidor**
   - No confiar en datos del cliente
   - Verificar permisos en cada request

2. **Usar middleware de autenticación**
   - Validar token JWT o sesión
   - Asignar rol desde BD, no desde cliente

3. **Usar políticas de autorización**
   ```php
   // CodeIgniter 4 Example
   if (!$this->authorize('crear_novedad', $novedad)) {
     return $this->response->setStatusCode(403);
   }
   ```

4. **Auditoría**
   - Registrar quién creó/editó/eliminó
   - Timestamp de cada acción

---

## 📝 Próximos Pasos

### Corto Plazo (1er Semestre)
- [ ] Integrar módulo en página de novedades
- [ ] Crear UI para filtrar por categoría
- [ ] Implementar búsqueda
- [ ] Crear formulario de creación (con validaciones)
- [ ] Testing manual completo

### Largo Plazo (2do Semestre)
- [ ] Migrar `novedades.json` a tabla MySQL `Novedades`
- [ ] Implementar CRUD en CodeIgniter 4
- [ ] Replicar validaciones en servidor
- [ ] Implementar auditoría
- [ ] Agregar soft deletes (marcar como oculta)
- [ ] Caché de novedades públicas

---

## 📞 Referencia Rápida

| Pregunta | Dónde Consultar |
|----------|-----------------|
| ¿Qué campos tiene una novedad? | `NOVEDADES_MODELO.md` → Estructura de Datos |
| ¿Quién puede ver esto? | `NOVEDADES_MODELO.md` → Matriz de Visibilidad |
| ¿Cómo filtrar por rol? | `novedades-filtro.js` → `filtrarNovedadesParaUsuario()` |
| ¿Cómo validar creación? | `novedades-filtro.js` → `validarNovedadCreada()` |
| ¿Ejemplos completos? | `ejemplo-uso-novedades.js` |
| ¿Cómo implementar? | Este archivo, Paso 1-3 |

---

## 📦 Archivos Entregados

```
centro-de-estudiantes-digital/
├── json/
│   └── novedades.json          ← Ampliado con campos de control
├── js/
│   ├── novedades-filtro.js     ← Módulo principal (400 líneas)
│   └── ejemplo-uso-novedades.js ← 8 ejemplos prácticos
├── NOVEDADES_MODELO.md         ← Especificación completa (400 líneas)
└── IMPLEMENTACION_NOVEDADES.md ← Esta guía
```

---

## ✅ Checklist de Implementación

- [ ] Revisar `NOVEDADES_MODELO.md` para entender el modelo
- [ ] Copiar `novedades-filtro.js` al proyecto
- [ ] Revisar ejemplos en `ejemplo-uso-novedades.js`
- [ ] Actualizar `auth.js` para guardar usuario en sessionStorage
- [ ] Integrar filtrado en página de novedades
- [ ] Crear formulario de creación con validaciones
- [ ] Testing manual con diferentes roles
- [ ] Preparar para migración a backend en Semestre 2
