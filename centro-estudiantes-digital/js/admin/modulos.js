'use strict';

/**
 * Datos mock para los 5 módulos obligatorios del proyecto.
 * En Fase 2 estos datos vendrán de endpoints CodeIgniter 4.
 */
window.MODULOS_DATA = {

  'mod-novedades': {
    titulo: 'Novedades',
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linejoin="round"/><path d="M14 2v6h6" stroke-linejoin="round"/><path d="M16 13H8M16 17H8M10 9H8" stroke-linecap="round"/></svg>',
    descripcion: 'Publicación de noticias y avisos con categorización: Académico, Social, Institucional y Urgente.',
    items: [
      { titulo: 'Cambio de aula para parcial', detalle: 'Académico · Carlos Mendoza · 02/05/2026', estado: 'Publicado', estadoClase: 'activo' },
      { titulo: 'Inscripción a finales abierta', detalle: 'Académico · Coordinación · 01/05/2026', estado: 'Publicado', estadoClase: 'activo' },
      { titulo: 'Torneo de fútbol intercátedra', detalle: 'Social · Federico Núñez · 28/04/2026', estado: 'Publicado', estadoClase: 'activo' },
      { titulo: 'Mantenimiento del campus virtual', detalle: 'Institucional · Administración · 25/04/2026', estado: 'Publicado', estadoClase: 'activo' },
      { titulo: 'Suspensión de actividades 9/5', detalle: 'Urgente · Dirección · 20/04/2026', estado: 'Destacado', estadoClase: 'cerrado' }
    ]
  },

  'mod-calendario': {
    titulo: 'Calendario Académico',
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/></svg>',
    descripcion: 'Fechas importantes del año académico: exámenes, inscripciones, feriados y recesos.',
    items: [
      { titulo: 'Primer parcial — Programación I', detalle: '12/05/2026 · Examen parcial', estado: 'Examen', estadoClase: 'cerrado' },
      { titulo: 'Cierre inscripción finales julio', detalle: '15/05/2026 · Período de inscripción', estado: 'Inscripción', estadoClase: 'abierto' },
      { titulo: 'Día de la Revolución de Mayo', detalle: '25/05/2026 · Feriado nacional', estado: 'Feriado', estadoClase: 'finalizado' },
      { titulo: 'Segundo parcial — Base de Datos', detalle: '01/06/2026 · Examen parcial', estado: 'Examen', estadoClase: 'cerrado' },
      { titulo: 'Día de la Bandera', detalle: '20/06/2026 · Feriado nacional', estado: 'Feriado', estadoClase: 'finalizado' },
      { titulo: 'Inicio receso invernal', detalle: '06/07/2026 · Receso académico', estado: 'Receso', estadoClase: 'finalizado' }
    ]
  },

  'mod-reglamentacion': {
    titulo: 'Reglamentación',
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke-linejoin="round"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke-linejoin="round"/></svg>',
    descripcion: 'Repositorio centralizado de documentos oficiales con versionado y búsqueda por palabras clave.',
    items: [
      { titulo: 'Régimen Académico 2026', detalle: 'Régimen académico · v3.1 · Publicado 15/04/2026', estado: 'Vigente', estadoClase: 'activo' },
      { titulo: 'Reglamento de Convivencia', detalle: 'Convivencia · v2.0 · Publicado 02/03/2026', estado: 'Vigente', estadoClase: 'activo' },
      { titulo: 'Régimen de Becas 2026', detalle: 'Becas · v1.0 · Publicado 20/02/2026', estado: 'Vigente', estadoClase: 'activo' },
      { titulo: 'Estatuto Centro de Estudiantes', detalle: 'Centro de estudiantes · v4.2 · Publicado 10/01/2026', estado: 'Vigente', estadoClase: 'activo' }
    ]
  },

  'mod-eventos': {
    titulo: 'Eventos',
    icono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke-linejoin="round"/><path d="M4 22v-7" stroke-linecap="round"/></svg>',
    descripcion: 'Gestión de eventos del centro de estudiantes con inscripción online y control de cupos.',
    items: [
      { titulo: 'Hackathon ISFDyT 2026', detalle: '20/05/2026 · Aula Magna · 42/60 inscriptos', estado: 'Abierto', estadoClase: 'abierto' },
      { titulo: 'Charla: IA en la educación', detalle: '10/05/2026 · Sala de conferencias · 55/80 inscriptos', estado: 'Abierto', estadoClase: 'abierto' },
      { titulo: 'Torneo de programación', detalle: '15/04/2026 · Lab 2 · 30/30 inscriptos', estado: 'Cerrado', estadoClase: 'cerrado' },
      { titulo: 'Jornada de integración', detalle: '10/03/2026 · Patio central · 120/150 inscriptos', estado: 'Finalizado', estadoClase: 'finalizado' }
    ]
  }
};
