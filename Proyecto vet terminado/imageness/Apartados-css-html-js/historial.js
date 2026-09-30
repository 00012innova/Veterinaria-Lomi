const mascotas = [
  {
    nombre: "Luna",
    duenio: "R. Pérez",
    especie: "Perro",
    fecha: "2025-10-09",
    edad: "3 años",
    peso: "12 kg",
    raza: "Cocker Spaniel",
    diagnostico: "Infección de oído leve y revisión general",
    vacunas: ["Rabia", "Moquillo", "Parvovirus", "Antipulgas"],
    resumen:
      "Se realizó limpieza profunda del oído, se administró tratamiento antibiótico y se indicó cuidado preventivo para evitar recurrencias. La mascota fue revisada en general y se mostró estable.",
    foto: "https://i.pinimg.com/736x/ba/a4/91/baa4917fc92e0625426f0fd66914f460.jpg"
  },
  {
    nombre: "Max",
    duenio: "G. Ramírez",
    especie: "Perro",
    fecha: "2025-10-09",
    edad: "5 años",
    peso: "18 kg",
    raza: "Labrador Retriever",
    diagnostico: "Control de vacunación y revisión preventiva",
    vacunas: ["Rabia", "Moquillo", "Parvovirus", "Leptospirosis"],
    resumen:
      "Se llevó a cabo la revisión anual, actualización de vacunas y valoración general del estado físico. Se recomendó mantener una rutina de ejercicio y alimentación balanceada.",
    foto: "https://spotpet.com/_next/image?url=https:%2F%2Fimages.ctfassets.net%2Fm5ehn3s5t7ec%2Fwp-image-197858%2F7746c729ddf5a2a730f17999268362de%2FLabrador-Retriever-Dog-Breed-Guide.jpg&w=3840&q=75"
  },
  {
    nombre: "Nina",
    duenio: "M. López",
    especie: "Gato",
    fecha: "2025-10-16",
    edad: "1 año",
    peso: "4.5 kg",
    raza: "Siamés",
    diagnostico: "Dolor estomacal por indigestión",
    vacunas: ["Triple felina", "Rabia felina", "Antiparasitario"],
    resumen:
      "Se indicó dieta blanda durante 5 días, se administró tratamiento para aliviar el malestar gastrointestinal y se recomendó observar la ingesta y actividad diaria.",
    foto: "https://clinicaveterinarium.es/wp-content/uploads/2023/11/lindo-gatito-gato-siames-interior.jpg"
  },
  {
    nombre: "Coco",
    duenio: "A. Silva",
    especie: "Perro",
    fecha: "2025-10-20",
    edad: "7 años",
    peso: "20 kg",
    raza: "Pastor Alemán",
    diagnostico: "Revisión por molestias articulares",
    vacunas: ["Rabia", "Moquillo", "Parvovirus", "Antipulgas"],
    resumen:
      "Se evaluó movilidad y dolor articular, se indicó ejercicio moderado y tratamiento para aliviar molestias. Se recomendó control en 15 días para monitoreo.",
    foto: "https://as2.ftcdn.net/v2/jpg/04/25/49/27/1000_F_425492745_sTQm4QNXKKxk5EuKRTZ2vLAQqzEty2eg.jpg"
  },
  {
    nombre: "Mochi",
    duenio: "J. Torres",
    especie: "Gato",
    fecha: "2025-10-22",
    edad: "4 años",
    peso: "3.8 kg",
    raza: "British Shorthair",
    diagnostico: "Alergia en piel y molestias dérmicas",
    vacunas: ["Triple felina", "Rabia", "Antiparasitario"],
    resumen:
      "Se realizó revisión cutánea, limpieza dermatológica y se indicó un tratamiento para controlar la alergia. Se recomendó evitar cambios bruscos en la dieta.",
    foto: "https://media.istockphoto.com/id/1153868349/photo/cute-kitty-portrait-british-shorthair-cat-looking-up-beautiful-pet-photo.jpg?s=170667a&w=0&k=20&c=B9haI3XldnL1XG_mM2a5uPq9j4Zfb7b9Tx5Y1xjLSbg="
  }
];

let indiceActual = 0;
const filasMostradas = 4;

function formatearFecha(fecha) {
  const fechaObj = new Date(fecha + "T00:00:00");
  return fechaObj.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function renderTabla(datos) {
  const cuerpo = document.getElementById("cuerpoTabla");
  if (!cuerpo) return;

  cuerpo.innerHTML = "";

  datos.forEach((mascota) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>
        <div class="mascota-cell">
          <span class="mascota-icon">${mascota.especie === "Perro" ? "🐶" : "🐱"}</span>
          <span>${mascota.nombre}</span>
        </div>
      </td>
      <td>${mascota.duenio}</td>
      <td>${mascota.especie}</td>
      <td>${formatearFecha(mascota.fecha)}</td>
      <td>
        <button class="btn-ver" onclick="abrirModal('${mascota.nombre}')">Ver</button>
      </td>
    `;
    cuerpo.appendChild(fila);
  });
}

function obtenerDatosFiltrados() {
  const filtroMascota = document.getElementById("filtroMascota")?.value.trim().toLowerCase() || "";
  const filtroDueno = document.getElementById("filtroDueno")?.value.trim().toLowerCase() || "";
  const filtroEspecie = document.getElementById("filtroEspecie")?.value || "";
  const filtroFecha = document.getElementById("filtroFecha")?.value || "";

  return mascotas.filter((mascota) => {
    const coincideMascota = mascota.nombre.toLowerCase().includes(filtroMascota);
    const coincideDueno = mascota.duenio.toLowerCase().includes(filtroDueno);
    const coincideEspecie = filtroEspecie ? mascota.especie === filtroEspecie : true;
    const coincideFecha = filtroFecha ? mascota.fecha === filtroFecha : true;

    return coincideMascota && coincideDueno && coincideEspecie && coincideFecha;
  });
}

function actualizarTabla() {
  const datos = obtenerDatosFiltrados();
  const visible = datos.slice(0, filasMostradas + indiceActual);
  renderTabla(visible);
}

function cargarMasRegistros() {
  indiceActual += filasMostradas;
  const datos = obtenerDatosFiltrados();
  const visible = datos.slice(0, filasMostradas + indiceActual);

  renderTabla(visible);

  const boton = document.querySelector(".btn-ver-mas");
  if (visible.length >= datos.length) {
    boton.disabled = true;
    boton.textContent = "No hay más registros";
    boton.style.opacity = "0.7";
  }
}

function limpiarFiltros() {
  document.getElementById("filtroMascota").value = "";
  document.getElementById("filtroDueno").value = "";
  document.getElementById("filtroEspecie").value = "";
  document.getElementById("filtroFecha").value = "";

  indiceActual = 0;
  const boton = document.querySelector(".btn-ver-mas");
  boton.disabled = false;
  boton.textContent = "Ver más...";
  boton.style.opacity = "1";
  actualizarTabla();
}

function abrirModal(nombre) {
  const mascota = mascotas.find((m) => m.nombre === nombre);
  if (!mascota) return;

  document.getElementById("modalFoto").src = mascota.foto;
  document.getElementById("modalNombre").textContent = mascota.nombre;
  document.getElementById("modalEdad").textContent = mascota.edad;
  document.getElementById("modalPeso").textContent = mascota.peso;
  document.getElementById("modalRaza").textContent = mascota.raza;
  document.getElementById("modalEspecie").textContent = mascota.especie;
  document.getElementById("modalDiagnostico").textContent = mascota.diagnostico;

  const vacunas = document.getElementById("modalVacunas");
  vacunas.innerHTML = "";
  mascota.vacunas.forEach((vacuna) => {
    const item = document.createElement("li");
    item.textContent = vacuna;
    vacunas.appendChild(item);
  });

  document.getElementById("modalResumen").textContent = mascota.resumen;
  document.getElementById("modalDueno").textContent = mascota.duenio;

  document.getElementById("modalOverlay").classList.add("show");
  document.getElementById("modalDetalles").classList.add("show");
}

function cerrarModal() {
  document.getElementById("modalOverlay").classList.remove("show");
  document.getElementById("modalDetalles").classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
  ["filtroMascota", "filtroDueno", "filtroEspecie", "filtroFecha"].forEach((id) => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.addEventListener("input", () => {
        indiceActual = 0;
        const boton = document.querySelector(".btn-ver-mas");
        boton.disabled = false;
        boton.textContent = "Ver más...";
        boton.style.opacity = "1";
        actualizarTabla();
      });

      elemento.addEventListener("change", () => {
        indiceActual = 0;
        const boton = document.querySelector(".btn-ver-mas");
        boton.disabled = false;
        boton.textContent = "Ver más...";
        boton.style.opacity = "1";
        actualizarTabla();
      });
    }
  });

  actualizarTabla();
});