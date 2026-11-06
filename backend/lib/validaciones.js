const agenda = require('../../shared/agenda.mjs');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

function validarContacto({ nombre, email, mensaje } = {}) {
  if (typeof nombre !== 'string' || !nombre.trim() || nombre.length > 120 ||
      typeof email !== 'string' || email.length > 254 || !EMAIL.test(email) ||
      typeof mensaje !== 'string' || !mensaje.trim() || mensaje.length > 3000) return;
  return { nombre: nombre.trim(), email: email.trim(), mensaje: mensaje.trim() };
}

// Devuelve { datos } normalizados o { error } con el primer problema encontrado.
function validarReserva(body = {}, { ahora, plazo } = {}) {
  const servicio = texto(body.servicio);
  const barbero = texto(body.barbero) || 'cualquiera';
  const fecha = texto(body.fecha);
  const hora = texto(body.hora);
  const nombre = texto(body.nombre);
  const telefono = texto(body.telefono);
  const email = texto(body.email);
  const notas = texto(body.notas);

  if (!agenda.buscarServicio(servicio)) return { error: 'Elegí un servicio.' };
  if (barbero !== 'cualquiera' && !agenda.buscarBarbero(barbero)) return { error: 'Elegí un barbero.' };
  if (!agenda.dentroDelPlazo(fecha, ahora, plazo)) return { error: 'Elegí una fecha dentro de los próximos días.' };
  if (!agenda.abre(fecha)) return { error: 'Ese día la barbería está cerrada.' };
  if (Number.isNaN(agenda.aMinutos(hora)) || hora.length !== 5) return { error: 'Elegí un horario.' };
  if (nombre.length < 2 || nombre.length > 120) return { error: 'Escribí tu nombre (entre 2 y 120 caracteres).' };
  const digitos = agenda.soloDigitos(telefono).length;
  if (telefono.length > 30 || digitos < 8 || digitos > 15) return { error: 'Escribí un teléfono válido, con código de área.' };
  if (email && (email.length > 254 || !EMAIL.test(email))) return { error: 'El correo no es válido.' };
  if (notas.length > 500) return { error: 'Las notas no pueden superar los 500 caracteres.' };

  return { datos: { servicio, barbero, fecha, hora, nombre, telefono, email, notas } };
}

function validarNovedad({ titulo, subtitulo, cuerpo } = {}) {
  if (![titulo, subtitulo, cuerpo].every((valor) => typeof valor === 'string' && valor.trim()) ||
      titulo.length > 160 || subtitulo.length > 240 || cuerpo.length > 10000) return;
  return { titulo: titulo.trim(), subtitulo: subtitulo.trim(), cuerpo: cuerpo.trim() };
}

module.exports = { validarContacto, validarReserva, validarNovedad };
