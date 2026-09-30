
(function () {
  'use strict';

  /* ===========================================================
     ACCESO A DATOS (localStorage)
     Si en el futuro se conecta a un servidor real, solo hay que
     cambiar estas funciones para que hagan fetch() a una API,
     el resto del código no necesita cambiar.
     =========================================================== */
  var STORAGE_KEYS = {
    MASCOTAS: 'vetcare_mascotas',
    CITAS: 'vetcare_citas'
  };

  function getMascotas() {
    try {
      var data = localStorage.getItem(STORAGE_KEYS.MASCOTAS);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('No se pudieron leer las mascotas guardadas:', err);
      return [];
    }
  }

  function saveMascotas(lista) {
    try {
      localStorage.setItem(STORAGE_KEYS.MASCOTAS, JSON.stringify(lista));
      return true;
    } catch (err) {
      console.error('No se pudo guardar la mascota:', err);
      return false;
    }
  }

  function getCitas() {
    try {
      var data = localStorage.getItem(STORAGE_KEYS.CITAS);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('No se pudieron leer las citas guardadas:', err);
      return [];
    }
  }

  function saveCitas(lista) {
    try {
      localStorage.setItem(STORAGE_KEYS.CITAS, JSON.stringify(lista));
      return true;
    } catch (err) {
      console.error('No se pudo guardar la cita:', err);
      return false;
    }
  }

  function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }


  /* ===========================================================
     REFERENCIAS AL DOM
     =========================================================== */
  var formMascota = document.getElementById('form-mascota');
  var inputFoto = document.getElementById('foto-mascota');
  var fotoPreview = document.getElementById('foto-preview');
  var btnQuitarFoto = document.getElementById('quitar-foto');
  var mascotasGrid = document.getElementById('mascotas-grid');
  var mascotasVacioMsg = document.getElementById('mascotas-vacio');
  var msgExitoMascota = document.getElementById('mensaje-exito-mascota');
  var msgErrorMascota = document.getElementById('mensaje-error-mascota');

  var formCita = document.getElementById('form-cita');
  var selectMascotaCita = document.getElementById('mascota-cita');
  var calendarioGrid = document.getElementById('calendario-grid');
  var semanaLabel = document.getElementById('semana-actual-label');
  var btnSemanaAnterior = document.getElementById('semana-anterior');
  var btnSemanaSiguiente = document.getElementById('semana-siguiente');
  var agendaLista = document.getElementById('agenda-lista');
  var agendaVacioMsg = document.getElementById('agenda-vacio');
  var msgExitoCita = document.getElementById('mensaje-exito-cita');
  var msgErrorCita = document.getElementById('mensaje-error-cita');

  var HORARIOS = ['09:00', '11:00', '13:00', '16:00'];
  var DIAS_ABREV = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Estado en memoria de la foto seleccionada (dataURL en base64) y del
  // horario elegido en el calendario, mientras el usuario llena el formulario
  var fotoSeleccionadaDataUrl = null;
  var semanaOffset = 0; // 0 = semana actual, -1 = anterior, 1 = siguiente...
  var slotSeleccionado = null; // { fecha: 'YYYY-MM-DD', hora: '09:00' }


  /* ===========================================================
     UTILIDADES DE FECHA
     =========================================================== */
  function obtenerLunesDeSemana(fecha, offsetSemanas) {
    var d = new Date(fecha);
    var dia = d.getDay(); // 0 = domingo ... 6 = sábado
    var diff = dia === 0 ? -6 : 1 - dia; // llevar al lunes de esa semana
    d.setDate(d.getDate() + diff + (offsetSemanas * 7));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatearFechaISO(fecha) {
    var y = fecha.getFullYear();
    var m = String(fecha.getMonth() + 1).padStart(2, '0');
    var d = String(fecha.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function formatearFechaCorta(fecha) {
    return fecha.getDate() + '/' + (fecha.getMonth() + 1);
  }


  /* ===========================================================
     SECCIÓN 1: REGISTRO DE MASCOTAS (incluye foto)
     =========================================================== */

  // Vista previa de la foto al elegir un archivo
  inputFoto.addEventListener('change', function () {
    var archivo = inputFoto.files && inputFoto.files[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen (JPG, PNG, etc).');
      inputFoto.value = '';
      return;
    }

    var lector = new FileReader();
    lector.onload = function (e) {
      fotoSeleccionadaDataUrl = e.target.result; // imagen en base64
      fotoPreview.src = fotoSeleccionadaDataUrl;
    };
    lector.readAsDataURL(archivo);
  });

  // Quitar la foto elegida y volver al ícono por defecto
  btnQuitarFoto.addEventListener('click', function () {
    fotoSeleccionadaDataUrl = null;
    inputFoto.value = '';
    fotoPreview.src = 'https://placehold.co/120x120/FBF8F2/4BB9C3?text=%F0%9F%90%BE';
  });

  // Al presionar "Cancelar" en el formulario de mascota, también se
  // limpia la vista previa de la foto (el reset del form no lo hace solo)
  document.getElementById('cancelar-mascota').addEventListener('click', function () {
    setTimeout(function () {
      fotoSeleccionadaDataUrl = null;
      fotoPreview.src = 'https://placehold.co/120x120/FBF8F2/4BB9C3?text=%F0%9F%90%BE';
      ocultarMensaje(msgExitoMascota);
      ocultarMensaje(msgErrorMascota);
    }, 0);
  });

  // Guardar una mascota nueva
  formMascota.addEventListener('submit', function (e) {
    e.preventDefault();

    var nombre = document.getElementById('nombre-mascota').value.trim();
    var especie = document.getElementById('especie').value.trim();
    var raza = document.getElementById('raza').value.trim();
    var edad = document.getElementById('edad').value.trim();
    var dueno = document.getElementById('dueno').value.trim();
    var telefono = document.getElementById('telefono').value.trim();
    var notas = document.getElementById('notas').value.trim();

    // Validación mínima de campos obligatorios
    if (!nombre || !especie || !dueno) {
      ocultarMensaje(msgExitoMascota);
      mostrarMensaje(msgErrorMascota);
      return;
    }

    var mascotas = getMascotas();
    var nuevaMascota = {
      id: generarId(),
      nombre: nombre,
      especie: especie,
      raza: raza,
      edad: edad,
      dueno: dueno,
      telefono: telefono,
      notas: notas,
      foto: fotoSeleccionadaDataUrl, // puede ser null si no subió foto
      creado: new Date().toISOString()
    };

    mascotas.push(nuevaMascota);

    if (!saveMascotas(mascotas)) {
      // Esto normalmente pasa si se suben demasiadas fotos y se llena
      // el espacio de localStorage (~5-10MB según el navegador)
      alert('No se pudo guardar la mascota. Es posible que el almacenamiento del navegador esté lleno (prueba con una foto más ligera).');
      mascotas.pop();
      return;
    }

    // Limpiar formulario y foto
    formMascota.reset();
    fotoSeleccionadaDataUrl = null;
    fotoPreview.src = 'https://placehold.co/120x120/FBF8F2/4BB9C3?text=%F0%9F%90%BE';

    ocultarMensaje(msgErrorMascota);
    mostrarMensaje(msgExitoMascota);

    // Actualizar la lista de mascotas y el <select> de la sección de citas
    renderMascotas();
    renderSelectMascotas();
  });

  // Dibuja las tarjetas de "Mascotas registradas"
  function renderMascotas() {
    var mascotas = getMascotas();
    mascotasGrid.innerHTML = '';

    if (mascotas.length === 0) {
      mascotasVacioMsg.hidden = false;
      mascotasGrid.appendChild(mascotasVacioMsg);
      return;
    }
    mascotasVacioMsg.hidden = true;

    mascotas.slice().reverse().forEach(function (m) {
      var card = document.createElement('div');
      card.className = 'mascota-card';

      var fotoSrc = m.foto || 'https://placehold.co/90x90/FBF8F2/4BB9C3?text=%F0%9F%90%BE';

      card.innerHTML =
        '<img class="mascota-foto" src="' + fotoSrc + '" alt="Foto de ' + escapeHtml(m.nombre) + '">' +
        '<div class="mascota-info">' +
          '<p class="mascota-nombre">' + escapeHtml(m.nombre) + '</p>' +
          '<p class="mascota-detalle">' + escapeHtml(m.especie) + (m.raza ? ' · ' + escapeHtml(m.raza) : '') + '</p>' +
          '<p class="mascota-detalle">Dueño: ' + escapeHtml(m.dueno) + '</p>' +
        '</div>' +
        '<button type="button" class="mascota-eliminar" title="Eliminar mascota" data-id="' + m.id + '">✕</button>';

      mascotasGrid.appendChild(card);
    });

    // Botones de eliminar
    mascotasGrid.querySelectorAll('.mascota-eliminar').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        if (!confirm('¿Eliminar esta mascota del registro?')) return;
        var restantes = getMascotas().filter(function (m) { return m.id !== id; });
        saveMascotas(restantes);
        renderMascotas();
        renderSelectMascotas();
      });
    });
  }

  // Escapa texto para insertarlo de forma segura dentro de innerHTML
  function escapeHtml(texto) {
    var div = document.createElement('div');
    div.textContent = texto == null ? '' : texto;
    return div.innerHTML;
  }


  /* ===========================================================
     SECCIÓN 2: REGISTRO DE CITAS
     =========================================================== */

  // Llena el <select> de mascotas con lo que haya guardado
  function renderSelectMascotas() {
    var mascotas = getMascotas();
    var valorPrevio = selectMascotaCita.value;

    selectMascotaCita.innerHTML = '<option value="">Selecciona una mascota registrada</option>';

    if (mascotas.length === 0) {
      var opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Registra primero una mascota arriba';
      opt.disabled = true;
      selectMascotaCita.appendChild(opt);
    } else {
      mascotas.forEach(function (m) {
        var opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.nombre + ' (' + m.especie + ' · dueño: ' + m.dueno + ')';
        selectMascotaCita.appendChild(opt);
      });
    }

    // Si la mascota que estaba elegida sigue existiendo, mantenerla elegida
    if (mascotas.some(function (m) { return m.id === valorPrevio; })) {
      selectMascotaCita.value = valorPrevio;
    }
  }

  // Dibuja la cuadrícula del calendario para la semana actual (según semanaOffset),
  // marcando como "ocupado" cualquier horario que ya tenga una cita guardada
  function renderCalendario() {
    var lunes = obtenerLunesDeSemana(new Date(), semanaOffset);
    var citas = getCitas();

    // Texto del rango de la semana, ej. "23/9 - 29/9"
    var domingo = new Date(lunes);
    domingo.setDate(domingo.getDate() + 6);
    semanaLabel.textContent = formatearFechaCorta(lunes) + ' - ' + formatearFechaCorta(domingo);

    calendarioGrid.innerHTML = '';

    // Encabezados: día abreviado + fecha (dd/mm)
    var fechasSemana = [];
    for (var i = 0; i < 7; i++) {
      var fecha = new Date(lunes);
      fecha.setDate(fecha.getDate() + i);
      fechasSemana.push(fecha);

      var header = document.createElement('div');
      header.className = 'dia-header';
      header.textContent = DIAS_ABREV[i] + ' ' + formatearFechaCorta(fecha);
      calendarioGrid.appendChild(header);
    }

    // Una fila de botones por cada horario
    HORARIOS.forEach(function (hora) {
      fechasSemana.forEach(function (fecha) {
        var fechaISO = formatearFechaISO(fecha);
        var citaExistente = citas.find(function (c) {
          return c.fecha === fechaISO && c.hora === hora;
        });

        var boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'hora-slot';
        boton.textContent = hora;
        boton.dataset.fecha = fechaISO;
        boton.dataset.hora = hora;

        if (citaExistente) {
          boton.classList.add('ocupado');
          boton.disabled = true;
          boton.title = 'Ocupado: ' + citaExistente.mascotaNombre;
        } else {
          boton.addEventListener('click', function () {
            calendarioGrid.querySelectorAll('.hora-slot').forEach(function (b) {
              b.classList.remove('seleccionado');
            });
            boton.classList.add('seleccionado');
            slotSeleccionado = { fecha: fechaISO, hora: hora };
          });

          // Mantener resaltado el horario si ya estaba elegido (por ejemplo,
          // al cambiar de semana y regresar sin haber guardado aún)
          if (slotSeleccionado && slotSeleccionado.fecha === fechaISO && slotSeleccionado.hora === hora) {
            boton.classList.add('seleccionado');
          }
        }

        calendarioGrid.appendChild(boton);
      });
    });
  }

  btnSemanaAnterior.addEventListener('click', function () {
    semanaOffset -= 1;
    renderCalendario();
  });

  btnSemanaSiguiente.addEventListener('click', function () {
    semanaOffset += 1;
    renderCalendario();
  });

  // Guardar una cita nueva
  formCita.addEventListener('submit', function (e) {
    e.preventDefault();

    var mascotaId = selectMascotaCita.value;
    var motivo = document.getElementById('motivo').value.trim();

    var mascotas = getMascotas();
    var mascota = mascotas.find(function (m) { return m.id === mascotaId; });

    if (!mascota || !slotSeleccionado) {
      ocultarMensaje(msgExitoCita);
      mostrarMensaje(msgErrorCita);
      return;
    }

    var citas = getCitas();

    // Verificación extra por si el horario se ocupó justo antes de guardar
    var yaOcupado = citas.some(function (c) {
      return c.fecha === slotSeleccionado.fecha && c.hora === slotSeleccionado.hora;
    });
    if (yaOcupado) {
      ocultarMensaje(msgExitoCita);
      mostrarMensaje(msgErrorCita);
      renderCalendario();
      return;
    }

    var nuevaCita = {
      id: generarId(),
      mascotaId: mascota.id,
      mascotaNombre: mascota.nombre,
      motivo: motivo || 'Consulta general',
      fecha: slotSeleccionado.fecha,
      hora: slotSeleccionado.hora,
      creado: new Date().toISOString()
    };

    citas.push(nuevaCita);
    saveCitas(citas);

    // Limpiar formulario y selección
    formCita.reset();
    slotSeleccionado = null;

    ocultarMensaje(msgErrorCita);
    mostrarMensaje(msgExitoCita);

    renderSelectMascotas();
    renderCalendario();  // el horario recién tomado aparece como "ocupado"
    renderAgenda();      // la agenda se actualiza al instante
  });

  document.getElementById('cancelar-cita').addEventListener('click', function () {
    setTimeout(function () {
      slotSeleccionado = null;
      ocultarMensaje(msgExitoCita);
      ocultarMensaje(msgErrorCita);
      renderCalendario();
    }, 0);
  });

  // Dibuja la lista de la agenda (todas las citas guardadas, ordenadas por fecha)
  function renderAgenda() {
    var citas = getCitas().slice().sort(function (a, b) {
      return (a.fecha + a.hora).localeCompare(b.fecha + b.hora);
    });

    agendaLista.innerHTML = '';

    if (citas.length === 0) {
      agendaVacioMsg.hidden = false;
      agendaLista.appendChild(agendaVacioMsg);
      return;
    }
    agendaVacioMsg.hidden = true;

    citas.forEach(function (c) {
      var fila = document.createElement('div');
      fila.className = 'agenda-fila';
      fila.innerHTML =
        '<div class="agenda-fecha">' + c.fecha + ' · ' + c.hora + '</div>' +
        '<div class="agenda-detalle"><strong>' + escapeHtml(c.mascotaNombre) + '</strong> — ' + escapeHtml(c.motivo) + '</div>' +
        '<button type="button" class="agenda-cancelar" data-id="' + c.id + '">Cancelar</button>';
      agendaLista.appendChild(fila);
    });

    agendaLista.querySelectorAll('.agenda-cancelar').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        if (!confirm('¿Cancelar esta cita? El horario quedará disponible de nuevo.')) return;
        var restantes = getCitas().filter(function (c) { return c.id !== id; });
        saveCitas(restantes);
        renderAgenda();
        renderCalendario(); // libera el horario en el calendario
      });
    });
  }


  /* ===========================================================
     MENSAJES DE ÉXITO / ERROR
     =========================================================== */
  function mostrarMensaje(elemento) {
    elemento.hidden = false;
    clearTimeout(elemento._timeout);
    // Se oculta solo después de unos segundos para no estorbar
    elemento._timeout = setTimeout(function () {
      elemento.hidden = true;
    }, 4000);
  }

  function ocultarMensaje(elemento) {
    elemento.hidden = true;
    clearTimeout(elemento._timeout);
  }
/* ============================================================
   DETALLE DE MASCOTA: ventanita al hacer clic en una tarjeta
   Pegar al FINAL de script.js (después del último "})();")
   ============================================================ */
(function () {
  'use strict';

  var FOTO_DEFAULT = 'https://placehold.co/120x120/FBF8F2/4BB9C3?text=%F0%9F%90%BE';

  /* ---------- Estilos de la ventanita (se inyectan solos) ---------- */
  var estilos = document.createElement('style');
  estilos.textContent =
    '.mascota-card{cursor:pointer;transition:box-shadow .15s ease,transform .1s ease}' +
    '.mascota-card:hover{box-shadow:0 2px 10px rgba(40,77,73,.15);transform:translateY(-1px)}' +
    '.lomi-modal-overlay{display:none;position:fixed;inset:0;background:rgba(40,77,73,.55);' +
      'align-items:center;justify-content:center;padding:20px;z-index:500}' +
    '.lomi-modal-overlay.abierto{display:flex}' +
    '.lomi-modal-box{background:#fff;border-radius:10px;padding:30px;max-width:480px;width:100%;' +
      'max-height:88vh;overflow-y:auto;position:relative;box-shadow:0 10px 30px rgba(0,0,0,.2);color:#2D3436}' +
    '.lomi-modal-cerrar{position:absolute;top:14px;right:14px;background:transparent;border:none;' +
      'color:#284D49;font-size:1.1rem;width:30px;height:30px;border-radius:50%;cursor:pointer;opacity:.6}' +
    '.lomi-modal-cerrar:hover{opacity:1;background:#FBF8F2}' +
    '.lomi-modal-head{display:flex;align-items:center;gap:16px;margin-bottom:22px;padding-right:30px}' +
    '.lomi-modal-foto{width:84px;height:84px;border-radius:50%;object-fit:cover;border:2px solid #4BB9C3;flex-shrink:0}' +
    '.lomi-modal-head h2{color:#284D49;font-size:1.3rem;margin:0}' +
    '.lomi-modal-sub{opacity:.7;font-size:.9rem;margin:0}' +
    '.lomi-modal-datos{display:grid;grid-template-columns:1fr 1fr;gap:14px 20px;margin-bottom:20px;' +
      'padding-bottom:20px;border-bottom:1px solid rgba(40,77,73,.12)}' +
    '.lomi-etq{display:block;font-size:.75rem;font-weight:700;color:#4BB9C3;text-transform:uppercase;' +
      'letter-spacing:.03em;margin-bottom:3px}' +
    '.lomi-val{display:block;font-size:.95rem}' +
    '.lomi-modal-bloque{margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(40,77,73,.12)}' +
    '.lomi-modal-bloque:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}' +
    '.lomi-modal-bloque p{margin:4px 0 0;font-size:.9rem;white-space:pre-line}' +
    '.lomi-cita{display:flex;justify-content:space-between;gap:10px;font-size:.88rem;background:#FBF8F2;' +
      'border-radius:8px;padding:8px 12px;margin-top:8px}' +
    '@media(max-width:520px){.lomi-modal-datos{grid-template-columns:1fr}}';
  document.head.appendChild(estilos);

  /* ---------- Estructura de la ventanita (se crea sola) ---------- */
  var overlay = document.createElement('div');
  overlay.className = 'lomi-modal-overlay';
  overlay.innerHTML =
    '<div class="lomi-modal-box" role="dialog" aria-modal="true">' +
      '<button type="button" class="lomi-modal-cerrar" aria-label="Cerrar">✕</button>' +
      '<div class="lomi-modal-head">' +
        '<img class="lomi-modal-foto" id="lomi-foto" src="" alt="Foto de la mascota">' +
        '<div><h2 id="lomi-nombre"></h2><p class="lomi-modal-sub" id="lomi-especie"></p></div>' +
      '</div>' +
      '<div class="lomi-modal-datos">' +
        '<div><span class="lomi-etq">Raza</span><span class="lomi-val" id="lomi-raza"></span></div>' +
        '<div><span class="lomi-etq">Edad</span><span class="lomi-val" id="lomi-edad"></span></div>' +
        '<div><span class="lomi-etq">Dueño</span><span class="lomi-val" id="lomi-dueno"></span></div>' +
        '<div><span class="lomi-etq">Teléfono</span><span class="lomi-val" id="lomi-telefono"></span></div>' +
        '<div><span class="lomi-etq">Registrada el</span><span class="lomi-val" id="lomi-creado"></span></div>' +
      '</div>' +
      '<div class="lomi-modal-bloque">' +
        '<span class="lomi-etq">Notas / observaciones</span><p id="lomi-notas"></p>' +
      '</div>' +
      '<div class="lomi-modal-bloque">' +
        '<span class="lomi-etq">Citas agendadas</span><div id="lomi-citas"></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  function $(id) { return document.getElementById(id); }

  function leer(clave) {
    try { return JSON.parse(localStorage.getItem(clave)) || []; }
    catch (e) { return []; }
  }

  function esc(texto) {
    var d = document.createElement('div');
    d.textContent = texto == null ? '' : texto;
    return d.innerHTML;
  }

  /* ---------- Abrir / cerrar ---------- */
  function abrir(id) {
    var m = leer('vetcare_mascotas').find(function (x) { return x.id === id; });
    if (!m) return;

    $('lomi-foto').src = m.foto || FOTO_DEFAULT;
    $('lomi-nombre').textContent = m.nombre;
    $('lomi-especie').textContent = m.especie + (m.raza ? ' · ' + m.raza : '');
    $('lomi-raza').textContent = m.raza || 'No especificada';
    $('lomi-edad').textContent = m.edad ? m.edad + ' años' : 'No especificada';
    $('lomi-dueno').textContent = m.dueno;
    $('lomi-telefono').textContent = m.telefono || 'No registrado';
    $('lomi-notas').textContent = m.notas || 'Sin notas registradas.';

    var f = new Date(m.creado);
    $('lomi-creado').textContent = isNaN(f) ? '—' :
      f.toLocaleDateString('es-MX') + ', ' +
      f.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    var citas = leer('vetcare_citas')
      .filter(function (c) { return c.mascotaId === id; })
      .sort(function (a, b) { return (a.fecha + a.hora).localeCompare(b.fecha + b.hora); });

    $('lomi-citas').innerHTML = citas.length
      ? citas.map(function (c) {
          return '<div class="lomi-cita"><span>' + esc(c.fecha) + ' · ' + esc(c.hora) +
                 '</span><span>' + esc(c.motivo) + '</span></div>';
        }).join('')
      : '<p style="opacity:.6;font-style:italic">No tiene citas agendadas.</p>';

    overlay.classList.add('abierto');
    document.body.style.overflow = 'hidden';
  }

  function cerrar() {
    overlay.classList.remove('abierto');
    document.body.style.overflow = '';
  }

  /* ---------- Eventos ---------- */
  // Clic en cualquier tarjeta de mascota (funciona aunque se vuelvan a dibujar)
  document.addEventListener('click', function (e) {
    if (e.target.closest('.mascota-eliminar')) return;   // el botón ✕ solo elimina
    var tarjeta = e.target.closest('.mascota-card');
    if (!tarjeta) return;
    var btn = tarjeta.querySelector('.mascota-eliminar');
    var id = btn && btn.getAttribute('data-id');
    if (id) abrir(id);
  });

  overlay.querySelector('.lomi-modal-cerrar').addEventListener('click', cerrar);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) cerrar(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('abierto')) cerrar();
  });
})();

  /* ===========================================================
     INICIO: primer dibujado de todo cuando carga la página
     =========================================================== */
  renderMascotas();
  renderSelectMascotas();
  renderCalendario();
  renderAgenda();

})();