# Centro de Estudiantes Digital — ISFDyT N.° 57

Portal web institucional y responsive para centralizar la comunicación, documentación y gestión académica del Instituto Superior de Formación Docente y Técnica N.° 57 "Juana Paula Manso". Desarrollado como **Proyecto Integrador** anual para las materias *Técnicas de Programación* (1er Semestre) y *Aproximación al Campo Laboral* (2do Semestre) de la Tecnicatura Superior en Ciencia de Datos e Inteligencia Artificial.

## 📌 Estado Actual (Fin de la Fase 1)
- **Fase de desarrollo:** Frontend completo de la primera etapa (100% interactivo).
- **Estructura limpia:** Navegación principal unificada en `/centro-estudiantes-digital/index.html`.
- **Persistencia simulada:** Consumo dinámico de datos mediante una API Mock basada en archivos JSON y uso de `localStorage` para sesiones de usuario.

## 🎯 Alcance del Primer Semestre
El desarrollo se estructuró bajo la metodología ágil **Scrum/Kanban** a lo largo de 6 sprints biemanales, implementando:
- **UI/UX Responsive & Accesible:** Diseño adaptado siguiendo la estrategia *Mobile-First* para resoluciones desde Mobile (320px), Tablet (768px) hasta Desktop (1024px+).
- **HTML5 Semántico y CSS3 Puro:** Estructuras accesibles y componentes desacoplados.
- **JavaScript Vanilla (ES6+):** Manipulación dinámica del DOM, validación de formularios en el cliente y enrutamiento simulado.

## 📁 Estructura del Proyecto
El árbol de directorios respeta estrictamente la arquitectura modular definida en la guía de la cátedra:

centro-de-estudiantes-digital/
├── index.html                  # Aviso al usuario qeue ingresa
├── centro-estudiantes-digital/
    ├── index.html                  # Dashboard / Vista principal del usuario
    ├── css/                        # Estilos de la plataforma
    │   ├── styles.css              # Estilos base, variables de diseño y layout general
    │   ├── public.css              # Estilos específicos para la interfaz pública
    │   ├── login.css               # Diseño exclusivo de la pantalla de acceso[cite: 1]
    │   └── admin/
    │       └── modulos.css         # Estilos específicos para el panel de administración[cite: 1]
    ├── js/                         # Lógica de negocio e interactividad (JavaScript Vanilla)[cite: 1]
    │   ├── app.js                  # Inicializador y lógica global de la aplicación[cite: 1]
    │   ├── auth-guard.js           # Middleware de protección de rutas según sesión[cite: 1]
    │   ├── api-client.js           # Cliente centralizado para peticiones fetch()[cite: 1]
    │   ├── api-utils.js            # Funciones auxiliares y formateadores para la API[cite: 1]
    │   ├── data-sync.js            # Sincronización e intercambio de datos (localStorage)[cite: 1]
    │   ├── login.js                # Manejo del formulario de acceso y validaciones[cite: 1]
    │   ├── logout.js               # Destrucción de sesión y redirección segura[cite: 1]
    │   ├── alumno-data.js          # Renderizado de la información del perfil del estudiante[cite: 1]
    │   ├── calendario-store.js     # Estado y lógica del calendario interactivo[cite: 1]
    │   ├── admin-auth.js           # Validaciones de seguridad para el panel de gestión[cite: 1]
    │   └── admin/
    │       ├── admin-data.js       # Control de datos compartidos de administración[cite: 1]
    │       └── modulos.js          # Gestión dinámica de los módulos de alta/baja/modificación[cite: 1]
    ├── json/                       # API Mock (Base de datos simulada en archivos estáticos)[cite: 1]
    │   ├── usuario.json            # Datos del perfil logueado actualmente[cite: 1]
    │   ├── usuarios.json           # Listado global de credenciales y roles para testing[cite: 1]
    │   ├── perfiles.json           # Configuración de permisos por rol[cite: 1]
    │   ├── novedades.json          # Repositorio de noticias y alertas[cite: 1]
    │   ├── eventos.json            # Listado de actividades del centro con cupos[cite: 1]
    │   ├── calendario.json         # Fechas de exámenes, feriados e inscripciones[cite: 1]
    │   ├── materias.json           # Plan de estudios e información académica[cite: 1]
    │   ├── carreras.json           # Carreras vigentes en el instituto[cite: 1]
    │   ├── notificaciones.json     # Alertas internas del usuario[cite: 1]
    │   └── reglamentacion.json     # Documentos y normativas institucionales[cite: 1]
    ├── pages/                      # Vistas HTML secundarias de la aplicación[cite: 1]
    │   ├── admin.html              # Panel de gestión exclusivo para administradores y delegados[cite: 1]
    │   ├── alumnos.html            # Sección de visualización y administración de estudiantes[cite: 1]
    │   └── index.html              # Redirección o vista base del módulo de páginas[cite: 1]
    └── img/                        # Recursos multimedia y assets gráficos[cite: 1]
        ├── estudiante.png          # Avatar o recurso visual por defecto[cite: 1]
        └── favicon.svg             # Icono oficial de la pestaña del navegador[cite: 1]

## ✅ Módulos Core Implementados
De acuerdo al pliego de especificaciones del proyecto, se cubrieron los siguientes módulos obligatorios:

1. **Gestión de Usuarios y Roles:** Autenticación simulada que discrimina capacidades según 4 perfiles específicos (`Alumno`, `Docente`, `Delegado` y `Administrador`).
2. **Sistema de Novedades:** Feed interactivo con noticias filtrables por categoría (`Académico`, `Social`, `Institucional`, `Urgente`) y soporte para publicaciones destacadas.
3. **Calendario Académico Interactivo:** Renderizado mensual dinámico de fechas clave (exámenes parciales/finales, inscripciones, feriados) con controles de navegación entre meses.
4. **Gestión de Eventos:** Catálogo de actividades organizadas por el Centro de Estudiantes con validación de formularios, inscripciones en tiempo real con control de cupo disponible y retroalimentación (*feedback visual*) al usuario.
5. **Reglamentación y FAQ:** Repositorio centralizado de documentos oficiales con buscador semántico integrado.

## 🚀 Cómo ejecutar el proyecto

Este proyecto está desarrollado con **JavaScript Vanilla (ES6+)** y utiliza la API Fetch (`fetch()`) para consumir los archivos de datos de la API Mock ubicados en la carpeta `json/` (como `novedades.json`, `calendario.json` o `usuarios.json`). 

Debido a las políticas de seguridad de los navegadores modernos (restricciones de CORS para el protocolo `file://`), **no es posible ejecutar la aplicación abriendo el archivo HTML directamente con un doble clic**. Es mandatorio levantar un servidor web local.

A continuación, se detallan las opciones disponibles para poner en marcha el entorno local:

### Opción 1: VS Code - Live Server (Recomendada)
Esta es la alternativa más sencilla si utilizás Visual Studio Code como entorno de desarrollo:
1. Abrí la carpeta principal del proyecto (`centro-estudiantes-digital/`) en tu editor de código.
2. Si aún no la tenés, instalá la extensión **Live Server** desde el *Marketplace*.
3. Buscá el archivo `index.html` raíz en el explorador de archivos.
4. Hacé clic derecho sobre él y seleccioná **Open with Live Server**.
5. La aplicación se abrirá automáticamente en tu navegador predeterminado en la dirección `http://127.0.0.1:5500`.

### Opción 2: Python HTTP Server (Consola/Terminal)
Si disponés de Python instalado en tu sistema, podés iniciar un servidor instantáneo desde cualquier terminal (PowerShell, CMD o Bash):
1. Abrí tu terminal y navegá hasta la carpeta del proyecto:
   ```bash
   cd centro-estudiantes-digital
Inicializá el módulo de servidor nativo indicando el puerto de tu preferencia:
   python -m http.server 8000

Abrí tu navegador web e ingresá a la URL: http://localhost:8000

Opción 3: Node.js (http-server)
Si preferís trabajar con el entorno de Node.js, podés utilizar el paquete global http-server:

Instalá la herramienta de manera global (si no la tenés instalada):
   npm install -g http-server
   
Parate dentro de la carpeta centro-estudiantes-digital y ejecutá:

   http-server -p 8080
Accedé mediante http://localhost:8080 en tu navegador.

📌 Nota importante sobre el flujo de navegación: Al iniciar el servidor local, la plataforma cargará directamente el archivo index.html de la raíz, que actúa como el Dashboard interactivo principal. A partir de allí, el sistema se encarga de gestionar la protección de rutas con el archivo js/auth-guard.js, evaluando si hay un usuario válido activo en el localStorage antes de permitir la navegación hacia las vistas de /pages/alumnos.html o /pages/admin.html.

## 🏁 Conclusión Final

La culminación de esta primera fase consolida el desarrollo de una interfaz modular, intuitiva y completamente alineada con las necesidades de comunicación y gestión del **ISFDyT N.° 57**. A través del uso de estándares modernos de desarrollo en el frontend (HTML5 semántico, CSS3 desacoplado y JavaScript ES6+), el equipo no solo ha logrado materializar las historias de usuario clave planteadas en el pliego de especificaciones, sino que también ha establecido cimientos de arquitectura limpios mediante la estructuración de almacenes de datos asincrónicos (API Mock en archivos JSON) y capas de seguridad tempranas en el cliente (como el middleware interactivo `auth-guard.js`).

Este Proyecto Integrador ha servido como un puente crítico para experimentar los desafíos técnicos reales de la ingeniería de software: desde el diseño estratégico *Mobile-First* y la adaptabilidad responsive en entornos multipantalla, hasta el control de flujo de datos asíncronos y la gestión dinámica del estado de la sesión. 

La robustez visual y lógica obtenida al cierre de este ciclo nos sitúa en una posición óptima para afrontar con éxito la segunda etapa del proyecto. El desacoplamiento logrado en la lógica de persistencia simulada garantizará una transición fluida y eficiente durante el próximo semestre, facilitando la migración del almacenamiento estático hacia un modelo de base de datos relacional robusto en MySQL y la sustitución de la lógica del cliente por servicios controladores dinámicos bajo el framework CodeIgniter 4.
