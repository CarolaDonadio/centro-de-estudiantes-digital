let currentDate = new Date();
let eventos = [];

const filtro = document.getElementById("filtroCarrera");

/* ================= CARGAR EVENTOS ================= */
async function cargarEventos() {
  const res = await fetch("../api/calendario.json");
  eventos = await res.json();

  renderCalendar();
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

  // Espacios vacíos
  for (let i = 0; i < offset; i++) {
    grid.innerHTML += `<div></div>`;
  }

  // Días
  for (let day = 1; day <= daysInMonth; day++) {

    // 👉 eventos del día
    const eventosDelDia = eventos.filter(ev => {
      const fecha = new Date(ev.fecha);

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

    // 👉 clases visuales
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

    // TIPOS
    if (eventosDelDia.some(e => e.tipo === "feriado")) {
      clase += " bg-danger text-white";
    } else if (eventosDelDia.some(e => e.tipo === "examen")) {
      clase += " bg-warning";
    } else if (eventosDelDia.some(e => e.tipo === "evento")) {
      clase += " bg-primary text-white";
    }

    // 👉 render día
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
      const fecha = new Date(ev.fecha);
      return fecha.getDate() == day;
    });

    const body = document.getElementById("modalBody");

    body.innerHTML = lista.length
      ? lista.map(e => `
          <p><strong>${e.titulo}</strong></p>
          <small>${e.carrera || "General"} · ${e.fecha}</small>
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