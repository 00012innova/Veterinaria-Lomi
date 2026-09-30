// navbar.js - Manejo global de navegación, perfil y cierre de sesión

document.addEventListener("DOMContentLoaded", () => {
  // 1. Cargar datos del usuario desde LocalStorage
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuario_lomi'));
  const avatarImg = document.getElementById('user-avatar');
  const userNameText = document.getElementById('user-name-text');
  const userEmailText = document.getElementById('user-email-text');

  if (usuarioGuardado) {
    if (avatarImg && usuarioGuardado.foto) {
      avatarImg.src = usuarioGuardado.foto;
    } else if (avatarImg && localStorage.getItem('foto_usuario')) {
      avatarImg.src = localStorage.getItem('foto_usuario');
    }

    if (userNameText) userNameText.textContent = usuarioGuardado.nombre;
    if (userEmailText) userEmailText.textContent = usuarioGuardado.email;
  } else {
    if (userNameText) userNameText.textContent = '¡Hola, bienvenido!';
    if (userEmailText) userEmailText.textContent = 'Sin sesión iniciada';
  }

  // 2. Control del Menú Desplegable del Perfil
  const btnUserAvatar = document.getElementById('btn-user-avatar');
  const userDropdownMenu = document.getElementById('user-dropdown-menu');
  const btnNotificaciones = document.getElementById('btn-notificaciones');
  const notificationDropdown = document.getElementById('notification-dropdown');

  if (btnUserAvatar && userDropdownMenu) {
    btnUserAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdownMenu.classList.toggle('oculto');
      if (notificationDropdown) notificationDropdown.classList.remove('activo');
    });
  }

  // 3. Control del Menú de Notificaciones
  if (btnNotificaciones && notificationDropdown) {
    btnNotificaciones.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle('activo');
      if (userDropdownMenu) userDropdownMenu.classList.add('oculto');
    });
  }

  // 4. Cerrar menús desplegables al hacer clic en cualquier otra parte de la pantalla
  document.addEventListener('click', () => {
    if (userDropdownMenu) userDropdownMenu.classList.add('oculto');
    if (notificationDropdown) notificationDropdown.classList.remove('activo');
  });

  // 5. Cierre de Sesión Universal
  const btnLogout = document.getElementById('menu-opcion-logout');

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (userDropdownMenu) userDropdownMenu.classList.add('oculto');

      const ejecutarCierre = () => {
        localStorage.removeItem('usuario_lomi');
        localStorage.removeItem('foto_usuario');
        window.location.href = 'login.html'; // Cambia esto si tu archivo de login se llama distinto
      };

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: '¿Cerrar sesión?',
          text: 'Tendrás que iniciar sesión de nuevo para acceder a tu cuenta.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#FFAB5E',
          cancelButtonColor: '#284D49',
          confirmButtonText: 'Sí, salir',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            ejecutarCierre();
          }
        });
      } else {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
          ejecutarCierre();
        }
      }
    });
  }

  // 6. Cargar notificaciones almacenadas
  actualizarNotificacionesUI();
});

// Función global de Notificaciones
function actualizarNotificacionesUI() {
  const notificaciones = JSON.parse(localStorage.getItem('notificaciones_lomi')) || [];
  const notificationBadge = document.getElementById('notification-badge');
  const notificationList = document.getElementById('notification-list');

  if (!notificationBadge || !notificationList) return;

  const cantidad = notificaciones.length;

  if (cantidad > 0) {
    notificationBadge.textContent = cantidad;
    notificationBadge.classList.remove('oculto');
  } else {
    notificationBadge.classList.add('oculto');
  }

  if (cantidad === 0) {
    notificationList.innerHTML = '<p class="notif-vacia">Aún no hay notificaciones</p>';
    return;
  }

  notificationList.innerHTML = '';
  notificaciones.forEach((notif) => {
    const item = document.createElement('div');
    item.classList.add('item-notificacion');
    item.innerHTML = `
      <span class="notif-titulo">${notif.titulo}</span>
      <p class="notif-descripcion">${notif.descripcion}</p>
      <span class="notif-fecha">${notif.fecha}</span>
    `;
    notificationList.appendChild(item);
  });
}