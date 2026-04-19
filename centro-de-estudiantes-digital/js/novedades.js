//CARGAR LAS NOVEDADES DESDE EL JSON
document.addEventListener("DOMContentLoaded", () => {
  cargarNovedades();
});

async function cargarNovedades() {
  try {
    const res = await fetch("../api/novedades.json");
    const data = await res.json();

    const container = document.getElementById("news-container");

    container.innerHTML = "";

    data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    data.forEach(noticia => {
      const fecha = new Date(noticia.fecha);

      const dia = fecha.getDate().toString().padStart(2, "0");
      const mes = fecha.toLocaleString("es-ES", { month: "short" });

      const item = document.createElement("div");
      item.classList.add("news-item");

      item.innerHTML = `
      <div class="news-badge">
        <span class="day">${dia}</span>
        <span class="mon">${mes}</span>
      </div>
      
      <div>
        <h4>
          <a href="${noticia.link}" target="_blank" rel="noopener noreferrer">
            ${noticia.titulo}
          </a>
        </h4>
        <p>${noticia.descripcion}</p>
      </div>
      `;
      container.appendChild(item);
    });

  } catch (error) {
    console.error("Error cargando novedades:", error);
  }
}