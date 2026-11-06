const router = require('express').Router();
const agenda = require('../../../shared/agenda.mjs');
const turnos = require('../../models/turnosModel');

const ETIQUETAS = { reservado: 'Reservado', completado: 'Atendido', ausente: 'No vino', cancelado: 'Cancelado' };

function paraVista(turno) {
  const inicio = agenda.aMinutos(turno.hora);
  return {
    ...turno,
    fin: agenda.aHora(inicio + turno.duracion),
    servicioNombre: agenda.buscarServicio(turno.servicio)?.nombre ?? turno.servicio,
    barberoNombre: agenda.buscarBarbero(turno.barbero)?.nombre ?? turno.barbero,
    etiqueta: ETIQUETAS[turno.estado],
    activo: turno.estado === 'reservado',
    telefonoLink: agenda.soloDigitos(turno.telefono)
  };
}

router.get('/', async (req, res) => {
  const ahora = agenda.ahoraEnArgentina();
  const fecha = agenda.esFechaValida(req.query.fecha) ? req.query.fecha : ahora.fecha;
  const delDia = (await turnos.turnosDelDia(fecha)).map(paraVista);
  const abierto = agenda.abre(fecha);

  const columnas = agenda.BARBEROS.map((barbero) => {
    const propios = delDia.filter((turno) => turno.barbero === barbero.id);
    const ocupados = agenda.ocupadosPorBarbero(propios)[barbero.id];
    const minutosOcupados = ocupados.reduce((total, franja) => total + franja.fin - franja.inicio, 0);
    const jornada = agenda.HORARIO.cierre - agenda.HORARIO.apertura;
    return {
      ...barbero,
      turnos: propios,
      ocupacion: abierto ? Math.round((minutosOcupados / jornada) * 100) : 0
    };
  });

  res.render('admin/agenda', {
    titulo: 'Agenda',
    fecha,
    esHoy: fecha === ahora.fecha,
    abierto,
    anterior: agenda.sumarDias(fecha, -1),
    siguiente: agenda.sumarDias(fecha, 1),
    hoy: ahora.fecha,
    columnas,
    hayTurnos: delDia.length > 0,
    resumen: await turnos.resumen(ahora),
    proximos: (await turnos.proximosTurnos(ahora)).map(paraVista)
  });
});

module.exports = router;
module.exports.paraVista = paraVista;
