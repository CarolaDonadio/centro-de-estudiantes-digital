# Centro de Estudiantes Digital — ISFDyT 57

Portal web para centralizar información académica del Instituto Superior de Formación Docente y Técnica N.° 57 "Juana Paula Manso".

## 📌 Estado actual
- Proyecto frontend completo de la primera fase.
- App principal ubicada en `centro-estudiantes-digital/index.html`.
- El `index.html` raíz duplicado se eliminó para evitar confusiones.

## 🚀 Cómo ejecutar
Este proyecto consume datos con `fetch()` desde archivos JSON, por lo que requiere un servidor local.

### Opción 1: Python
```powershell
cd centro-estudiantes-digital
python -m http.server 8000
```
Abrir `http://localhost:8000`.

### Opción 2: Live Server en VS Code
1. Abrir la carpeta `centro-estudiantes-digital`.
2. Usar *Open with Live Server* sobre `index.html`.

## 📁 Estructura principal
```
centro-estudiantes-digital/
├── index.html
├── css/
├── js/
├── json/
├── img/
└── pages/
```

## ✅ Módulos implementados
- Gestión de usuarios y perfiles
- Novedades con categorías y filtros
- Calendario académico interactivo
- Eventos con inscripción y cupos
- Reglamentación con buscador de documentos
- Panel administrador con CRUD de carreras, usuarios y más

## 🎯 Alcance del primer semestre
- Frontend con HTML5 semántico, CSS3 y JavaScript Vanilla
- API mock basada en JSON con endpoints simulados
- Responsive design y accesibilidad básica
- Drawer lateral, búsquedas y filtros dinámicos

## 📌 Notas importantes
- El archivo raíz `index.html` duplicado fue eliminado.
- La navegación principal del prototipo se encuentra en `centro-estudiantes-digital/index.html`.
- El proyecto incluye documentación adicional en:
  - `01_Proyecto_Integrador_Centro_Estudiantes.md`
  - `02_Guia_Primer_Semestre_Frontend.md`
  - `API-README.md`
  - `IMPLEMENTACION-BACKEND.md`

## 🧪 Recomendaciones para el entregable
- Verificar que `centro-estudiantes-digital/index.html` abra correctamente con servidor local.
- Incluir este `README.md` en la entrega final.
- Revisar que no existan registros de `index.html` duplicados en la raíz.
