let novedadesData = [];

async function cargarNovedades() {
  const res = await fetch("../api/novedades.json");
  novedadesData = await res.json();

  renderNovedades(novedadesData);
}

function renderNovedades(lista) {
  const container = document.getElementById("novedadesContainer");

  if (!container) return;

  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = `
      <div class="ce-card text-center p-4">
        <p>No hay novedades disponibles</p>
      </div>
    `;
    return;
  }

  let html = "";

  lista.forEach((n, index) => {
    const fecha = new Date(n.fecha);

    const dia = fecha.getDate();
    const mes = fecha.toLocaleString("es-AR", { month: "short" });

    html += `
      <div class="col-md-4">
        <div class="ce-card d-flex flex-column">
          
          <div class="d-flex gap-3">
            <div class="news-badge">
              <span class="day">${dia}</span>
              <span class="mon">${mes}</span>
            </div>

            <div>
              <span class="badge events-badge mb-2">${n.tipo}</span>
              <h3 class="section-title">${n.titulo}</h3>
              <p>${n.descripcion}</p>
            </div>
          </div>

          <button class="btn mt-3 ver-mas" data-index="${index}">
            Leer más
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // modal
  document.querySelectorAll(".ver-mas").forEach(btn => {
    btn.addEventListener("click", e => {
      const index = e.target.dataset.index;
      mostrarDetalle(novedadesData[index]);
    });
  });
}

function mostrarDetalle(novedad) {
  document.getElementById("modalTitulo").textContent = novedad.titulo;

  document.getElementById("modalBody").innerHTML = `
    <span class="badge events-badge mb-2">${novedad.tipo}</span>
    <p><strong>Fecha:</strong> ${novedad.fecha}</p>
    <hr>
    <p>${novedad.detalle}</p>
  `;

  new bootstrap.Modal(document.getElementById("modalNovedad")).show();
}

document.addEventListener("DOMContentLoaded", cargarNovedades);