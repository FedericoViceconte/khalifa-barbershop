const router = require('express').Router();
const agenda = require('../../../shared/agenda.mjs');
const turnos = require('../../models/turnosModel');
const { validarReserva } = require('../../lib/validaciones');

// Desde el panel se puede cargar a quien llega sin turno (sin anticipación mínima) y reservar hasta 90 días.
const OPCIONES_PANEL = { anticipacion: -24 * 60, plazo: 90 };

const horas = () => {
  const lista = [];
  for (let inicio = agenda.HORARIO.apertura; inicio < agenda.HORARIO.cierre; inicio += agenda.HORARIO.intervalo) {
    lista.push(agenda.aHora(inicio));
  }
  return lista;
};

function formulario(res, valores, error) {
  res.status(error ? 400 : 200).render('admin/turno-nuevo', {
    titulo: 'Nuevo turno',
    seccion: 'turnos',
    servicios: agenda.SERVICIOS,
    barberos: agenda.BARBEROS,
    horas: horas(),
    hoy: agenda.ahoraEnArgentina().fecha,
    valores,
    error
  });
}

router.get('/nuevo', (req, res) => {
  const hoy = agenda.ahoraEnArgentina().fecha;
  formulario(res, { fecha: agenda.esFechaValida(req.query.fecha) && req.query.fecha >= hoy ? req.query.fecha : hoy, barbero: 'cualquiera' });
});

router.post('/nuevo', async (req, res) => {
  const { datos, error } = validarReserva(req.body, { plazo: OPCIONES_PANEL.plazo });
  if (error) return formulario(res, req.body, error);
  try {
    const turno = await turnos.crearTurno({ ...datos, origen: 'panel' }, OPCIONES_PANEL);
    req.avisar('exito', `Turno reservado para ${turno.nombre} a las ${turno.hora}. Código: ${turno.codigo}.`);
    res.redirect(`/admin/agenda?fecha=${turno.fecha}`);
  } catch (falla) {
    if (falla instanceof turnos.TurnoNoDisponible) return formulario(res, req.body, falla.message);
    throw falla;
  }
});

const MENSAJES = {
  completado: 'Turno marcado como atendido.',
  ausente: 'Turno marcado como ausente.',
  cancelado: 'Turno cancelado.',
  reservado: 'El turno volvió a quedar reservado.'
};

router.post('/:id/estado', async (req, res) => {
  const turno = await turnos.getTurnoById(req.params.id);
  if (!turno) return res.status(404).render('error', { titulo: 'Turno no encontrado', mensaje: 'Puede que lo hayan borrado.' });
  const estado = req.body.estado;
  try {
    if (await turnos.cambiarEstado(turno.id, estado)) req.avisar('exito', MENSAJES[estado]);
    else req.avisar('error', 'No se pudo cambiar el estado del turno.');
  } catch (falla) {
    if (!(falla instanceof turnos.TurnoNoDisponible)) throw falla;
    req.avisar('error', falla.message);
  }
  res.redirect(`/admin/agenda?fecha=${turno.fecha}`);
});

module.exports = router;
