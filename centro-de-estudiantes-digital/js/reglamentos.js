document.addEventListener("DOMContentLoaded", async () => {
  await cargarCarreras();
  await cargarReglamentos();

  document.getElementById("filtro-carrera")
    .addEventListener("change", cargarReglamentos);
});


// ─────────────────────────────
// CARGAR CARRERAS EN SELECT
// ─────────────────────────────
async function cargarCarreras() {
  const res = await fetch("../api/carreras.json");
  const data = await res.json();

  const select = document.getElementById("filtro-carrera");

  select.innerHTML = `<option value="Todos">Todas las carreras</option>`;

  data.forEach(c => {
    const option = document.createElement("option");
    option.value = c.carrera;
    option.textContent = c.carrera;

    select.appendChild(option);
  });
}


// ─────────────────────────────
// CARGAR Y FILTRAR REGLAMENTOS
// ─────────────────────────────
async function cargarReglamentos() {
  const res = await fetch("../api/reglamentos.json");
  const data = await res.json();

  const container = document.getElementById("reglamentos-container");
  const filtro = document.getElementById("filtro-carrera").value;

  container.innerHTML = "";

  const filtrados = data.filter(r =>
    filtro === "Todos" ||
    r.carrera === filtro ||
    r.carrera === "Todas"
  );

  filtrados.forEach(reg => {
    const item = document.createElement("div");
    item.classList.add("news-item");

    item.innerHTML = `
      <div class="news-badge">
        <span class="day">PDF</span>
        <span class="mon">DOC</span>
      </div>

      <div>
        <h4>
          <a href="${reg.link}" target="_blank" rel="noopener noreferrer">
            ${reg.titulo}
          </a>
        </h4>
        <p>${reg.descripcion}</p>
        <small style="opacity:0.7;">${reg.carrera}</small>
      </div>
    `;

    container.appendChild(item);
  });

  if (filtrados.length === 0) {
    container.innerHTML = `<p>No hay reglamentos para esta carrera.</p>`;
  }
}