let eventosData = [];

/* ================= CARGAR EVENTOS ================= */
async function cargarEventos() {
  const res = await fetch("../api/eventos.json");
  eventosData = await res.json();

  renderEventos(eventosData);
}

/* ================= CARGAR CARRERAS (JSON) ================= */
async function cargarCarrerasDesdeJSON() {
  const res = await fetch("../api/carreras.json");
  const carreras = await res.json();

  const select = document.getElementById("filtroCarrera");

  if (!select) return;

  select.innerHTML = `<option value="">Todas las carreras</option>`;

  let html = "";

  carreras.forEach(c => {
    html += `<option value="${c.carrera}">${c.carrera}</option>`;
  });

  select.innerHTML += html;
}


//Muestra las cards de eventos
function renderEventos(lista) {
  const container = document.getElementById("eventosContainer");

  if (!container) return;

  container.innerHTML = "";

  // SI NO HAY RESULTADOS
  if (lista.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="ce-card text-center p-4">
          <h5 class="mb-2">No hay eventos disponibles</h5>
          <p class="text-muted mb-0">
            Probá cambiar los filtros o revisar más tarde.
          </p>
        </div>
      </div>
    `;
    return;
  }

  let html = "";

  // SI HAY EVENTOS
  lista.forEach((ev, index) => {
    html += `
      <div class="col-md-4">
        <div class="ce-card d-flex flex-column">
          <span class="badge events-badge mb-2">${ev.tipo}</span>
          <h3 class="section-title">${ev.titulo}</h3>
          <p>${ev.descripcion}</p>
          <small>${ev.carrera || "General"} · ${ev.fecha}</small>

          <button class="btn mt-3 ver-mas"
                  data-index="${index}">
            Ver más
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // EVENTOS DE CLICK
  document.querySelectorAll(".ver-mas").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      mostrarDetalle(lista[index]);
    });
  });
}

//FUNCIÓN DEL POP-UP
function mostrarDetalle(evento) {
  document.getElementById("modalTitulo").textContent = evento.titulo;

  document.getElementById("modalBody").innerHTML = `
    <p><strong>Tipo:</strong> ${evento.tipo}</p>
    <p><strong>Carrera:</strong> ${evento.carrera || "Todas las carreras"}</p>
    <p><strong>Fecha:</strong> ${evento.fecha}</p>
    <hr>
    <p>${evento.descripcionpopup}</p>
  `;

  new bootstrap.Modal(document.getElementById("modalEvento")).show();
}

/* ================= FILTROS ================= */
function aplicarFiltros() {
  const carrera = document.getElementById("filtroCarrera")?.value;
  const tipo = document.getElementById("filtroTipo")?.value;
  
  const filtrados = eventosData.filter(ev =>
    (!carrera || !ev.carrera || ev.carrera === carrera) &&
    (!tipo || ev.tipo === tipo)
  );

  renderEventos(filtrados);
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  cargarEventos();
  cargarCarrerasDesdeJSON();

  document.getElementById("filtroCarrera")?.addEventListener("change", aplicarFiltros);
  document.getElementById("filtroTipo")?.addEventListener("change", aplicarFiltros);
});