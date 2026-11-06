// Ayudantes de Handlebars para las vistas del panel.
const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const largo = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const corto = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

const aFecha = (fecha) => new Date(`${String(fecha).slice(0, 10)}T00:00:00Z`);

module.exports = {
  eq: (a, b) => a === b,
  pesos: (valor) => pesos.format(Number(valor) || 0),
  fechaLarga: (fecha) => largo.format(aFecha(fecha)),
  fechaCorta: (fecha) => corto.format(aFecha(fecha)),
  // Para inputs: marca la opción elegida en un <select>.
  elegido: (valor, opcion) => (String(valor ?? '') === String(opcion) ? 'selected' : ''),
  anio: () => new Date().getFullYear()
};
