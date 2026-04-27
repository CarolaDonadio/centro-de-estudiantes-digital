# centro-de-estudiantes-digital
Proyecto Integrador | Tec. Sup. Ciencia de Datos e IA | 1° Año | 2026

# Centro de Estudiantes Digital
**Proyecto Integrador · Tec. Sup. Ciencia de Datos e IA · 1° Año · 2026**

---

## 🗂️ Estructura del proyecto (mejorada)

```
centro-de-estudiantes-digital/
├── index.html              ← Landing pública
├── alumnos.html            ← Dashboard estudiante (post-login)
├── css/
│   ├── tokens.css          ← ⭐ Design tokens (ÚNICA fuente de verdad)
│   ├── styles.css          ← Estilos globales y utilidades
│   ├── components.css      ← Todos los componentes reutilizables
│   └── responsive.css      ← Media queries y adaptaciones
├── js/
│   └── app.js              ← Lógica: sidebar, calendario, tabs, filtros, toasts
├── pages/
│   ├── docentes.html       ← Dashboard docente (post-login)
│   ├── login.html          ← Formulario de acceso
│   ├── noticias.html       ← Listado de novedades
│   ├── servicios.html      ← Servicios estudiantiles
│   ├── contacto.html       ← Formulario de contacto
│   ├── comisiones.html     ← Comisiones del CE
│   ├── eventos.html        ← Calendario de eventos
│   ├── becas.html          ← Información de becas
│   └── reglamento.html     ← Documentos reglamentarios
└── api/
    └── ...                 ← Endpoints o mocks de datos
```

---

## ✅ Cambios realizados respecto al repo original

### 1. `css/tokens.css` — **Archivo nuevo (sugerencia principal)**
El repo original tenía `:root { }` repetido en `styles.css` y también inline en `docentes.html`.
Ahora existe **un único archivo** con todas las variables. Ventajas:
- Cambiar un color impacta en todo el proyecto de una vez
- Evita inconsistencias entre páginas
- Facilita crear un "modo oscuro" en el futuro

### 2. `css/styles.css` — **Limpiado**
- Solo contiene reset, body, tipografía, animaciones y utilidades
- Todos los colores usan `var(--ce-*)` sin ningún hexadecimal hardcodeado
- Agregada clase `.sr-only` para accesibilidad con lectores de pantalla

### 3. `css/components.css` — **Refactorizado completo**
- Eliminado el bloque de botones comentado (`/*...*/`) que quedó sin limpiar
- Todos los colores, radios y transiciones usan variables de `tokens.css`
- Agregados 18 componentes documentados con índice al inicio del archivo
- Agregadas clases de estado para chips de acceso (`ac-active`, `ac-inactive`, `ac-never`)
- Agregadas clases de stat cards para dashboards

### 4. `css/responsive.css` — **Expandido significativamente**
El original tenía **1 media query** (`max-width: 575px`). Ahora tiene:
- Tablet (`max-width: 991px`) — sidebar off-canvas con overlay
- Mobile L (`max-width: 767px`) — ajuste de hero, stats, comunicado
- Mobile S (`max-width: 575px`) — hero, botones, cards
- `@media print` — oculta navegación al imprimir
- `@media (prefers-reduced-motion)` — deshabilita animaciones para usuarios que lo necesitan

### 5. `js/app.js` — **Reescrito desde cero**
El original tenía solo:
```js
document.addEventListener("DOMContentLoaded", () => {
  console.log("App inicializada");
});
```
Ahora tiene 8 módulos reales:
1. **Sidebar móvil** — toggle + overlay + cierre con tecla `Escape` + manejo de foco
2. **Calendario mini** — navegación por mes, marcado de días con eventos y clases
3. **Novedades** — marcar leída/no leída con actualización del badge del sidebar
4. **Tabs genéricos** — funciona para cualquier `.tab-btn` + `.tab-content` en la página
5. **Filtros de tabla** — por estado de acceso y por materia (alumnos)
6. **Toast notifications** — sistema de alertas accesible con `aria-live`
7. **Fecha/hora en topbar** — actualización automática cada 60s
8. **IntersectionObserver** — anima `.anim` solo cuando entra al viewport

### 6. `index.html` — **Rutas internas corregidas**
Todos los `href="#"` ahora apuntan a páginas reales del proyecto:
- `href="pages/noticias.html"` en lugar de `href="#"`
- `href="pages/login.html"` en el botón de login
- `href="pages/contacto.html"`, `href="pages/comisiones.html"`, etc.

### 7. `pages/docentes.html` — **Migrado a CSS externo**
El original tenía más de 150 líneas de CSS inline en un `<style>` tag.  
Ahora el archivo solo importa `tokens.css` + `styles.css` + `components.css` + `responsive.css`.  
Beneficios:
- El navegador cachea los CSS y las páginas cargan más rápido
- Un cambio de estilo impacta a todas las páginas a la vez
- El HTML es mucho más legible

---

## 🎨 Sistema de diseño — Paleta accesible para daltonismo

| Variable          | Valor     | Uso                          |
|-------------------|-----------|------------------------------|
| `--ce-navy`       | `#003366` | Identidad principal, textos  |
| `--ce-amber`      | `#E6A817` | Acento, CTAs, notificaciones |
| `--ce-amber-dk`   | `#B5820D` | Hover sobre elementos ámbar  |
| `--ce-slate`      | `#1A2A3A` | Texto principal              |
| `--ce-fog`        | `#F2F4F7` | Fondos de sección            |
| `--ce-border`     | `#C9D4E0` | Bordes generales             |

**Por qué esta paleta:** El par navy + ámbar es distinguible en los tres tipos de daltonismo más comunes (deuteranopia, protanopia, tritanopia). Se evita el par rojo/verde como indicador semántico principal.

**Refuerzo por forma:** Cada indicador visual tiene además una forma diferente (punto redondo, triángulo, cuadrado, borde punteado/rayado/sólido) para no depender únicamente del color.

---

## 🚀 Sugerencias adicionales para continuar el proyecto

### Corto plazo (próximas entregas)
- [ ] Crear `pages/login.html` con formulario de autenticación y validación JS
- [ ] Crear `pages/noticias.html` con listado dinámico de novedades
- [ ] Crear `alumnos.html` con el mismo patrón de dashboard (sidebar + topbar)
- [ ] Conectar el calendario a datos reales desde `api/`

### Mediano plazo
- [ ] Agregar `localStorage` para persistir estado de novedades leídas
- [ ] Implementar modo oscuro usando la variable `--ce-sidebar` como base
- [ ] Agregar un archivo `api/novedades.json` con datos mock y fetch desde JS
- [ ] Crear componente de "búsqueda" en novedades y reglamentación

### Para el proyecto integrador
- [ ] Documentar en el README cómo conectar la API de Ciencia de Datos
- [ ] Agregar visualizaciones de datos (Chart.js) para el dashboard docente
- [ ] Implementar un sistema de roles (alumno / docente) con redirección automática post-login

---

## 📋 Cómo incluir los CSS en cada página

```html
<!-- En páginas en la raíz (index.html, alumnos.html) -->
<link rel="stylesheet" href="css/tokens.css" />
<link rel="stylesheet" href="css/styles.css" />
<link rel="stylesheet" href="css/components.css" />
<link rel="stylesheet" href="css/responsive.css" />

<!-- En páginas dentro de /pages/ -->
<link rel="stylesheet" href="../css/tokens.css" />
<link rel="stylesheet" href="../css/styles.css" />
<link rel="stylesheet" href="../css/components.css" />
<link rel="stylesheet" href="../css/responsive.css" />
```

**Siempre en este orden.** `tokens.css` debe ir primero porque define las variables que usan los demás.

---

*Diseño accesible WCAG 2.1 AA · Proyecto Integrador 2026*