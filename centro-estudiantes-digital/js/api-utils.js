/**
 * API UTILS - Utilidades y ejemplos para usar el cliente API
 * Incluye funciones helper para renderizar datos y manejar UI
 */

/**
 * Renderizar tabla de usuarios
 */
async function renderUsuariosTable(contenedorId) {
  try {
    const usuarios = await Usuarios.listar();
    const contenedor = document.getElementById(contenedorId);
    
    if (!contenedor) {
      console.error(`No se encontró elemento con id: ${contenedorId}`);
      return;
    }

    let html = `
      <table class="tabla-usuarios">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Email</th>
            <th>Perfil</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;

    usuarios.forEach(usuario => {
      html += `
        <tr>
          <td>${usuario.id}</td>
          <td>${usuario.nombre}</td>
          <td>${usuario.usuario}</td>
          <td>${usuario.email}</td>
          <td>${usuario.perfil_id}</td>
          <td>${usuario.activo ? '✓ Activo' : '✗ Inactivo'}</td>
          <td>
            <button onclick="editarUsuario(${usuario.id})" class="btn-editar">Editar</button>
            <button onclick="eliminarUsuario(${usuario.id})" class="btn-eliminar">Eliminar</button>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    contenedor.innerHTML = html;
  } catch (error) {
    console.error('Error renderizando usuarios:', error);
    document.getElementById(contenedorId).innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
}

/**
 * Renderizar tabla de carreras
 */
async function renderCarrerasTable(contenedorId) {
  try {
    const carreras = await Carreras.listar();
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    if (!carreras || carreras.length === 0) {
      contenedor.innerHTML = `
        <div class="notif-empty" style="margin-top:0; padding: 1.8rem;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round" />
          </svg>
          <p>No hay carreras registradas.</p>
        </div>
      `;
      return;
    }

    const isAdmin = typeof window !== 'undefined' && window.isAdminUser;
    let html = `
      <div class="table-wrapper">
        <table class="tabla-carreras">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Descripción</th>
              ${isAdmin ? '<th>Acciones</th>' : ''}
            </tr>
          </thead>
          <tbody>
    `;

    carreras.forEach(carrera => {
      html += `
        <tr>
          <td>${carrera.codigo || '—'}</td>
          <td>${carrera.nombre}</td>
          <td>${carrera.descripcion ? carrera.descripcion : '—'}</td>
          ${isAdmin ? `
            <td class="table-actions">
              <button type="button" class="btn-small" data-carrera-edit data-carrera-id="${carrera.id}" aria-label="Editar ${carrera.nombre}">Editar</button>
              <button type="button" class="btn-small btn-small--danger" data-carrera-delete data-carrera-id="${carrera.id}" aria-label="Eliminar ${carrera.nombre}">Eliminar</button>
            </td>
          ` : ''}
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    contenedor.innerHTML = html;
  } catch (error) {
    console.error('Error renderizando carreras:', error);
    document.getElementById(contenedorId).innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
}

/**
 * Renderizar tabla de materias
 */
async function renderMateriasTable(contenedorId) {
  try {
    const materias = await Materias.listar();
    const contenedor = document.getElementById(contenedorId);
    
    let html = `
      <table class="tabla-materias">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Docente</th>
            <th>Carrera</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;

    materias.forEach(materia => {
      html += `
        <tr>
          <td>${materia.codigo}</td>
          <td>${materia.nombre}</td>
          <td>${materia.docente}</td>
          <td>${materia.carrera_id}</td>
          <td>
            <button onclick="editarMateria(${materia.id})" class="btn-editar">Editar</button>
            <button onclick="eliminarMateria(${materia.id})" class="btn-eliminar">Eliminar</button>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    contenedor.innerHTML = html;
  } catch (error) {
    console.error('Error renderizando materias:', error);
    document.getElementById(contenedorId).innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
}

/**
 * Renderizar calendario
 */
async function renderCalendario(contenedorId) {
  try {
    const eventos = await Calendario.listar();
    const contenedor = document.getElementById(contenedorId);
    
    let html = `
      <div class="calendario-eventos">
    `;

    eventos.forEach(evento => {
      html += `
        <div class="evento-card" style="border-left: 4px solid ${evento.color || '#0ea5e9'}">
          <strong>${evento.fecha}</strong>
          <p>${evento.titulo}</p>
          <small>${evento.tipo || 'evento'}</small>
        </div>
      `;
    });

    html += `
      </div>
    `;

    contenedor.innerHTML = html;
  } catch (error) {
    console.error('Error renderizando calendario:', error);
    document.getElementById(contenedorId).innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
}

/**
 * Renderizar novedades
 */
async function renderNovedades(contenedorId) {
  try {
    const novedades = await Novedades.listar();
    const contenedor = document.getElementById(contenedorId);
    
    let html = `<div class="novedades-lista">`;

    novedades.forEach(novedad => {
      html += `
        <article class="novedad-item">
          <h3>${novedad.titulo}</h3>
          <p>${novedad.contenido}</p>
          <small>${novedad.created_at ? new Date(novedad.created_at).toLocaleDateString() : ''}</small>
        </article>
      `;
    });

    html += `</div>`;
    contenedor.innerHTML = html;
  } catch (error) {
    console.error('Error renderizando novedades:', error);
    document.getElementById(contenedorId).innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
}

/**
 * Crear usuario desde formulario
 */
async function crearUsuarioDesdeFormulario(formId) {
  try {
    const form = document.getElementById(formId);
    if (!form) throw new Error(`Formulario ${formId} no encontrado`);

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const resultado = await Usuarios.crear(data);
    console.log('✓ Usuario creado:', resultado);
    
    // Mostrar éxito y limpiar formulario
    alert('Usuario creado exitosamente');
    form.reset();
    
    return resultado;
  } catch (error) {
    console.error('Error creando usuario:', error);
    alert(`Error: ${error.message}`);
    throw error;
  }
}

/**
 * Actualizar usuario desde formulario
 */
async function actualizarUsuarioDesdeFormulario(usuarioId, formId) {
  try {
    const form = document.getElementById(formId);
    if (!form) throw new Error(`Formulario ${formId} no encontrado`);

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const resultado = await Usuarios.actualizar(usuarioId, data);
    console.log('✓ Usuario actualizado:', resultado);
    
    alert('Usuario actualizado exitosamente');
    return resultado;
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    alert(`Error: ${error.message}`);
    throw error;
  }
}

/**
 * Cargar selectores con datos
 */
async function cargarSelectCarreras(selectId) {
  try {
    const carreras = await Carreras.listar();
    const select = document.getElementById(selectId);
    
    if (!select) throw new Error(`Select ${selectId} no encontrado`);

    select.innerHTML = '<option value="">-- Selecciona una carrera --</option>';
    
    carreras.forEach(carrera => {
      const option = document.createElement('option');
      option.value = carrera.id;
      option.textContent = carrera.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando carreras en select:', error);
  }
}

async function cargarSelectPerfiles(selectId) {
  try {
    const perfiles = await Perfiles.listar();
    const select = document.getElementById(selectId);
    
    if (!select) throw new Error(`Select ${selectId} no encontrado`);

    select.innerHTML = '<option value="">-- Selecciona un perfil --</option>';
    
    perfiles.forEach(perfil => {
      const option = document.createElement('option');
      option.value = perfil.id;
      option.textContent = perfil.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando perfiles en select:', error);
  }
}

/**
 * Manejar errores comunes
 */
function manejarError(error, contexto = 'Operación') {
  const mensaje = error?.message || 'Error desconocido';
  console.error(`${contexto}:`, error);
  
  // Mostrar en UI
  const alerta = document.createElement('div');
  alerta.className = 'alerta alerta-error';
  alerta.textContent = `${contexto}: ${mensaje}`;
  document.body.appendChild(alerta);
  
  setTimeout(() => alerta.remove(), 5000);
}

/**
 * Mostrar mensaje de éxito
 */
function mostrarExito(mensaje) {
  const alerta = document.createElement('div');
  alerta.className = 'alerta alerta-exito';
  alerta.textContent = `✓ ${mensaje}`;
  document.body.appendChild(alerta);
  
  setTimeout(() => alerta.remove(), 3000);
}

/**
 * Stub functions - reemplazar con lógica real
 */
async function editarUsuario(id) {
  try {
    const usuario = await Usuarios.obtener(id);
    console.log('Editando usuario:', usuario);
    // Implementar modal o formulario
  } catch (error) {
    manejarError(error, 'Error al editar usuario');
  }
}

async function eliminarUsuario(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  
  try {
    await Usuarios.eliminar(id);
    mostrarExito('Usuario eliminado');
    // Recargar tabla
  } catch (error) {
    manejarError(error, 'Error al eliminar usuario');
  }
}

async function editarCarrera(id) {
  try {
    const carrera = await Carreras.obtener(id);
    console.log('Editando carrera:', carrera);
  } catch (error) {
    manejarError(error, 'Error al editar carrera');
  }
}

async function eliminarCarrera(id) {
  if (!confirm('¿Eliminar esta carrera?')) return;
  
  try {
    await Carreras.eliminar(id);
    mostrarExito('Carrera eliminada');
  } catch (error) {
    manejarError(error, 'Error al eliminar carrera');
  }
}

async function editarMateria(id) {
  try {
    const materia = await Materias.obtener(id);
    console.log('Editando materia:', materia);
  } catch (error) {
    manejarError(error, 'Error al editar materia');
  }
}

async function eliminarMateria(id) {
  if (!confirm('¿Eliminar esta materia?')) return;
  
  try {
    await Materias.eliminar(id);
    mostrarExito('Materia eliminada');
  } catch (error) {
    manejarError(error, 'Error al eliminar materia');
  }
}
