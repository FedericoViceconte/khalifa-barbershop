// Comportamientos chicos del panel. Todo funciona igual sin JavaScript, salvo la confirmación previa.

// Pide confirmación antes de enviar acciones destructivas (cancelar un turno, eliminar una novedad).
document.addEventListener('click', (event) => {
  const boton = event.target.closest('[data-confirmar]');
  if (boton && !window.confirm(boton.dataset.confirmar)) event.preventDefault();
});

// Cambiar la fecha de la agenda la abre directamente.
for (const campo of document.querySelectorAll('[data-enviar-al-cambiar]')) {
  campo.addEventListener('change', () => campo.form.requestSubmit());
}

// Menú lateral en pantallas chicas.
const menu = document.querySelector('.barra .menu');
const lateral = document.getElementById('lateral');
if (menu && lateral) {
  const abrir = (abierto) => {
    lateral.classList.toggle('abierto', abierto);
    menu.setAttribute('aria-expanded', String(abierto));
    menu.setAttribute('aria-label', abierto ? 'Cerrar el menú' : 'Abrir el menú');
  };
  menu.addEventListener('click', () => abrir(!lateral.classList.contains('abierto')));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') abrir(false);
  });
}
