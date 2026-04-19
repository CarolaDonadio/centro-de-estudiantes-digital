document.addEventListener("DOMContentLoaded", () => {
  cargarEventos();
});

function parseFecha(fechaStr) {
  const [dia, mes, anio] = fechaStr.split("/");
  return new Date(`${anio}-${mes}-${dia}`);
}

async function cargarEventos() {
  try {
    const res = await fetch("../api/eventos.json");
    const data = await res.json();

    const container = document.getElementById("events-container");
    container.innerHTML = "";

    // ordenar de forma ascendente por fecha (eventos más cercanos primero)
    data.sort((a, b) => parseFecha(a.fecha) - parseFecha(b.fecha));

    data.forEach(evento => {
      const fecha = parseFecha(evento.fecha);

      const dia = fecha.getDate().toString().padStart(2, "0");
      const mes = fecha.toLocaleString("es-ES", { month: "short" }).replace('.', '');

      const item = document.createElement("div");
      item.classList.add("news-item"); // reutilizás estilo 👌

      item.innerHTML = `
        <div class="news-badge">
          <span class="day">${dia}</span>
          <span class="mon">${mes}</span>
        </div>

        <div>
          <h4>
            <a href="${evento.link}" target="_blank" rel="noopener noreferrer">
              ${evento.titulo}
            </a>
          </h4>
          <p>${evento.descripcion}</p>
          
          ${
            evento.carrera 
              ? `<small style="font-size:0.7rem; opacity:0.7;">${evento.carrera}</small>` 
              : ""
          }
        </div>
      `;

      container.appendChild(item);
    });

  } catch (error) {
    console.error("Error cargando eventos:", error);
  }
}