// Obtener todos los enlaces de navegación
const navLinks = document.querySelectorAll('.nav-links a');

// Agregar evento click a cada enlace
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault(); // Evita el salto de página

    // Remover clase 'active' de todos los enlaces
    navLinks.forEach(l => l.classList.remove('active'));

    // Agregar clase 'active' al enlace clickeado
    this.classList.add('active');

    // Opcional: navegar a la sección (descomenta si necesitas)
    // const href = this.getAttribute('href');
    // if (href.startsWith('#')) {
    //   document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
    // }
  });
});

// Marcar como activo el primer enlace al cargar la página
if (navLinks.length > 0) {
  navLinks[0].classList.add('active');
}

function ingresarComoUsuario(event) {
  event.preventDefault();

  localStorage.setItem("sesionActiva", "true");

  document.body.classList.remove("modo-login");
  document.getElementById("vista-login").style.display = "none";
  document.getElementById("vista-inicio").style.display = "block";
  document.getElementById("navbar-dashboard").style.display = "flex";
}

function registrarUsuarioNuevo(event) {
  event.preventDefault();

  alert("¡Cuenta creada con éxito! Bienvenido a Lomi.");

  localStorage.setItem("sesionActiva", "true");

  document}