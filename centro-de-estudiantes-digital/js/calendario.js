let currentDate = new Date();
let eventos = [];

const filtro = document.getElementById("filtroCarrera");

/* ================= PARSE FECHA (SOLUCIONA BUG DE ZONA HORARIA) ================= */
function parseFecha(fechaStr) {
  const [year, month, day] = fechaStr.split("T")[0].split("-");
  return new Date(year, month - 1, day);
}

/* ================= CARGAR EVENTOS ================= */
async function cargarEventos() {
  try {
    const [resEventos, resNovedades] = await Promise.all([
      fetch("../api/eventos.json"),
      fetch("../api/novedades.json")
    ]);

    const dataEventos = await resEventos.json();
    const dataNovedades = await resNovedades.json();

    // 👉 unificamos todo
    eventos = [
      ...dataEventos.map(e => ({ ...e, categoria: "evento" })),
      ...dataNovedades.map(n => ({ ...n, categoria: "novedad" }))
    ];

    renderCalendar();

  } catch (error) {
    console.error("Error cargando calendario:", error);
  }
}

/* ================= RENDER CALENDARIO ================= */
function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  const title = document.getElementById("monthTitle");

  if (!grid || !title) return;

  grid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  title.textContent = currentDate.toLocaleString("es-AR", {
    month: "long",
    year: "numeric"
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let offset = (firstDay + 6) % 7;

  // espacios vacíos
  for (let i = 0; i < offset; i++) {
    grid.innerHTML += `<div></div>`;
  }

  // días del mes
  for (let day = 1; day <= daysInMonth; day++) {

    const eventosDelDia = eventos.filter(ev => {
      const fecha = parseFecha(ev.fecha);

      const coincideFecha =
        fecha.getDate() === day &&
        fecha.getMonth() === month &&
        fecha.getFullYear() === year;

      const coincideCarrera =
        !filtro?.value ||
        !ev.carrera ||
        ev.carrera === filtro.value;

      return coincideFecha && coincideCarrera;
    });

    let clase = "";

    // HOY
    const hoy = new Date();
    if (
      day === hoy.getDate() &&
      month === hoy.getMonth() &&
      year === hoy.getFullYear()
    ) {
      clase += " today";
    }

    // 🎨 COLORES (orden importa)
    if (eventosDelDia.some(e => e.tipo === "feriado")) {
      clase += " bg-danger text-white";
    } 
    else if (eventosDelDia.some(e => e.tipo === "examen")) {
      clase += " bg-warning";
    } 
    else if (eventosDelDia.some(e => e.categoria === "evento")) {
      clase += " bg-primary text-white";
    } 
    else if (eventosDelDia.some(e => e.categoria === "novedad")) {
      clase += " bg-success text-white";
    }

    // render día
    grid.innerHTML += `
      <div class="calendar-day ${clase}" data-day="${day}">
        ${day}
        ${eventosDelDia.length ? '<span class="dot"></span>' : ''}
      </div>
    `;
  }
}

/* ================= CLICK DÍA ================= */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("calendar-day")) {
    const day = e.target.dataset.day;

    const lista = eventos.filter(ev => {
      const fecha = parseFecha(ev.fecha);

      return (
        fecha.getDate() == day &&
        fecha.getMonth() === currentDate.getMonth() &&
        fecha.getFullYear() === currentDate.getFullYear()
      );
    });

    const body = document.getElementById("modalBody");

    body.innerHTML = lista.length
      ? lista.map(e => `
        <div style="margin-bottom:10px;">
          <p style="margin:0;"><strong>${e.titulo}</strong></p>
          <small style="opacity:0.7;">
            ${e.carrera || "General"} · ${parseFecha(e.fecha).toLocaleDateString()}
          </small>
          <br>
          <a href="${e.link}" target="_blank" rel="noopener noreferrer">
            Ver más
          </a>
        </div>
        <hr>
      `).join("")
      : "<p>No hay eventos</p>";

    new bootstrap.Modal(document.getElementById("modalEventos")).show();
  }
});

/* ================= NAVEGACIÓN ================= */
document.getElementById("prevMonth")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("nextMonth")?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

/* ================= FILTRO ================= */
filtro?.addEventListener("change", renderCalendar);

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", cargarEventos);