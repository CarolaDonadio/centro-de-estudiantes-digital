# CLAUDE.md — Centro de Estudiantes

## Descripción del proyecto

Aplicación web para el Centro de Estudiantes. Tiene dos secciones principales:
- **Índice público** (@./centro-estudiantes-digital/index.html): visible para cualquier visitante.
- **ABM con login** : panel de administración protegido por autenticación:
    - @./centro-estudiantes-digital/alumnos.html
    - @./centro-estudiantes-digital/docentes.html
    - @./centro-estudiantes-digital/admin.html

---

## Stack tecnológico

- **HTML5** semántico
- **CSS3** (sin frameworks, sin preprocesadores)
- **JavaScript Vanilla ES6+** (sin bibliotecas externas)
- **Bootstrap** como libreria de css

No se permite el uso de frameworks (React, Vue, Angular), ni TypeScript.

---

## Reglas de código

- Sin repetición (DRY)
- Toda función de utilidad (formatear fechas, validar campos, mostrar alertas) debe vivir en `js/utils.js` y ser importada desde los demás módulos.
- No duplicar bloques de HTML: usar `innerHTML` con templates o `<template>` tags del DOM.
- Cada archivo `.js` tiene una responsabilidad única.
- Usar `export`/`import` (ESModules) o patrón IIFE si el entorno no soporta módulos.
- No escribir lógica de negocio dentro de listeners de eventos: extraer a funciones con nombres descriptivos.


---

## Convenciones de nombrado

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Archivos | `kebab-case` | `admin-panel.js` |
| Variables y funciones JS | `camelCase` | `cargarNoticias()` |
| Clases CSS | `kebab-case` | `.card-noticia` |
| IDs HTML | `kebab-case` | `#form-login` |
| Constantes | `UPPER_SNAKE_CASE` | `MAX_ITEMS_POR_PAGINA` |

---

## Accesibilidad mínima requerida

- Todo `<img>` debe tener `alt` descriptivo.
- Formularios con `<label>` asociados mediante `for`/`id`.
- Controles interactivos accesibles con teclado (Tab, Enter, Escape).
- Jerarquía de headings correcta (`h1` → `h2` → `h3`), sin saltear niveles.
- Suficiente contraste según WCAG AA.

---

## Validaciones de formulario

- Realizadas en JS **antes** de cualquier llamada a API o submit.
- Mostrar mensajes de error junto al campo afectado, no en una alerta global.
- Función reutilizable `validarCampo(valor, reglas)` en `utils.js`.
- Campos requeridos también marcados con `required` en HTML como fallback.

---

## Guías de diseño de referencia

- @./01_Proyecto_Integrador_Centro_Estudiantes.md
- @./02_Guia_Primer_Semestre_Frontend.md

---

## Lo que NO se debe hacer

- ❌ Copiar y pegar bloques de HTML o JS similares en distintos archivos
- ❌ Escribir lógica de negocio directamente en el HTML (atributos `onclick`, `onchange`, etc.)
- ❌ Usar `var` (usar `const`/`let`)
- ❌ Mezclar responsabilidades en un mismo archivo JS
- ❌ Hardcodear colores, fuentes o tamaños fuera de las variables CSS
- ❌ Almacenar contraseñas o datos sensibles en el frontend
- ❌ Usar `alert()` / `confirm()` nativos del navegador (reemplazar con modales propios)