/* ================================================================
   STORE COMPARTIDO DEL CALENDARIO ACADÉMICO
   ----------------------------------------------------------------
   Persiste en localStorage los eventos creados por docentes,
   delegados y administradores, y los expone a TODOS los perfiles
   (incluidos los alumnos) cuando renderizan su calendario.

   En Fase 2 esta capa será reemplazada por endpoints REST de CI4.
   La forma de los datos se mantiene compatible con calendario.json
   (campos: fecha, titulo, tipo, color) más metadatos de autoría.
================================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'cedCalendarioEventos';

  /* ---------------- TIPOS PERMITIDOS POR ROL ---------------- */
  const TIPOS_CATALOGO = {
    examen:      { id: 'examen',      nombre: 'Examen',         color: '#3A5BA9' },
    clase:       { id: 'clase',       nombre: 'Clases y TPs',   color: '#0ea5e9' },
    evento:      { id: 'evento',      nombre: 'Eventos CE',     color: '#8B5CF6' },
    academico:   { id: 'academico',   nombre: 'Académico',      color: '#F5A623' },
    inscripcion: { id: 'inscripcion', nombre: 'Inscripciones',  color: '#3DAA6A' },
    feriado:     { id: 'feriado',     nombre: 'Feriado',        color: '#E67E5B' }
  };

  const TIPOS_POR_ROL = {
    docente:       ['examen', 'clase'],
    delegado:      ['evento'],
    admin:         ['examen', 'clase', 'evento', 'academico', 'inscripcion', 'feriado'],
    administrador: ['examen', 'clase', 'evento', 'academico', 'inscripcion', 'feriado']
  };

  /* ---------------- ACCESO A LOCALSTORAGE ---------------- */
  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { eventos: [], eliminadosBase: [] };
      const parsed = JSON.parse(raw);
      return {
        eventos: Array.isArray(parsed.eventos) ? parsed.eventos : [],
        eliminadosBase: Array.isArray(parsed.eliminadosBase) ? parsed.eliminadosBase : []
      };
    } catch (e) {
      console.warn('[calendario-store] No se pudo leer localStorage:', e);
      return { eventos: [], eliminadosBase: [] };
    }
  }

  function writeStore(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('[calendario-store] No se pudo escribir localStorage:', e);
      return false;
    }
  }

  /** Clave compuesta para identificar eventos base (que no tienen id) */
  function baseKey(ev) {
    return `${ev.fecha}|${ev.titulo}`;
  }

  /* ---------------- API PÚBLICA ---------------- */
  const CalendarioStore = {

    /** Devuelve solo los eventos creados por usuarios (no los del JSON base). */
    getCreados() {
      return readStore().eventos;
    },

    /** Devuelve la lista de claves de eventos base que el admin marcó como eliminados. */
    getEliminadosBase() {
      return readStore().eliminadosBase;
    },

    /**
     * Combina los eventos base del JSON con los creados por usuarios,
     * filtrando los que fueron soft-deleted por el admin.
     * @param {Array} eventosBase - lo que viene de calendario.json
     * @returns {Array} eventos listos para renderizar
     */
    mergeWithBase(eventosBase = []) {
      const { eventos, eliminadosBase } = readStore();
      const eliminadosSet = new Set(eliminadosBase);
      const base = eventosBase
        .filter(ev => !eliminadosSet.has(baseKey(ev)))
        .map(ev => ({ ...ev, origen: 'base' }));
      const creados = eventos.map(ev => ({ ...ev, origen: 'usuario' }));
      return [...base, ...creados];
    },

    /**
     * Crea un nuevo evento. Devuelve el evento creado.
     * El llamador debe validar los permisos antes con `puedeCrear`.
     */
    crear(data, autor) {
      if (!autor) throw new Error('Se requiere autor para crear un evento');
      const tipo = TIPOS_CATALOGO[data.tipo];
      if (!tipo) throw new Error(`Tipo de evento inválido: ${data.tipo}`);

      const nuevo = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        fecha: data.fecha,
        hora: data.hora || '',
        titulo: data.titulo,
        descripcion: data.descripcion || '',
        tipo: tipo.id,
        color: data.color || tipo.color,
        materia: data.materia || '',
        creado_por_id: autor.id ?? null,
        creado_por_nombre: autor.nombre || 'Desconocido',
        creado_por_rol: (autor.rol || '').toLowerCase()
      };

      const store = readStore();
      store.eventos.push(nuevo);
      writeStore(store);
      return nuevo;
    },

    /**
     * Actualiza un evento creado por usuarios.
     * @returns {boolean} true si lo actualizó
     */
    actualizar(id, cambios) {
      const store = readStore();
      const idx = store.eventos.findIndex(ev => ev.id === id);
      if (idx === -1) return false;
      const tipo = cambios.tipo ? TIPOS_CATALOGO[cambios.tipo] : null;
      store.eventos[idx] = {
        ...store.eventos[idx],
        ...cambios,
        color: cambios.color || tipo?.color || store.eventos[idx].color
      };
      writeStore(store);
      return true;
    },

    /**
     * Elimina un evento creado por usuarios.
     * @returns {boolean} true si lo eliminó
     */
    eliminar(id) {
      const store = readStore();
      const idx = store.eventos.findIndex(ev => ev.id === id);
      if (idx === -1) return false;
      store.eventos.splice(idx, 1);
      writeStore(store);
      return true;
    },

    /**
     * Marca un evento del JSON base como eliminado (soft delete).
     * Solo lo debe usar el admin.
     */
    eliminarBase(eventoBase) {
      const store = readStore();
      const key = baseKey(eventoBase);
      if (!store.eliminadosBase.includes(key)) {
        store.eliminadosBase.push(key);
        writeStore(store);
      }
      return true;
    },

    /** Reactiva un evento base previamente eliminado. */
    restaurarBase(eventoBase) {
      const store = readStore();
      const key = baseKey(eventoBase);
      store.eliminadosBase = store.eliminadosBase.filter(k => k !== key);
      writeStore(store);
      return true;
    },

    /* ---------------- HELPERS DE PERMISOS ---------------- */

    /** Tipos de evento habilitados para un rol dado. */
    tiposPermitidos(rol) {
      const r = (rol || '').toLowerCase();
      return (TIPOS_POR_ROL[r] || []).map(id => TIPOS_CATALOGO[id]);
    },

    /** ¿Puede este rol crear eventos en el calendario? */
    puedeCrear(rol) {
      return this.tiposPermitidos(rol).length > 0;
    },

    /**
     * ¿Puede este usuario editar/eliminar este evento?
     * - Admin: puede editar/eliminar cualquiera (incluidos los base)
     * - Otros roles autorizados: solo los que crearon ellos mismos
     */
    puedeEditar(evento, usuario) {
      if (!usuario) return false;
      const rol = (usuario.rol || '').toLowerCase();
      if (rol === 'admin' || rol === 'administrador') return true;
      if (evento.origen === 'base') return false;
      return evento.creado_por_id === usuario.id;
    },

    /** Devuelve el catálogo de tipos completo (para mostrar leyendas/iconos). */
    todosLosTipos() {
      return Object.values(TIPOS_CATALOGO);
    },

    /** Devuelve la definición de un tipo por id. */
    tipoInfo(id) {
      return TIPOS_CATALOGO[id] || null;
    }
  };

  /* Exportamos al window para que cualquier página lo use. */
  window.CalendarioStore = CalendarioStore;
})();
