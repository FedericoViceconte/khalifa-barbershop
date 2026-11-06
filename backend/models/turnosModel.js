const { randomInt } = require('node:crypto');
const pool = require('./bd');
const agenda = require('../../shared/agenda.mjs');

// Sin 0/O ni 1/I/L, para que el código se pueda dictar por teléfono sin confusiones.
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const COLUMNAS = 'id, codigo, servicio, barbero, fecha, hora, duracion, precio, nombre, telefono, email, notas, estado, origen, creado';

class TurnoNoDisponible extends Error {
  constructor(message = 'Ese horario ya no está disponible. Elegí otro.') {
    super(message);
    this.status = 409;
  }
}

const generarCodigo = () => Array.from({ length: 6 }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');

// Las horas vuelven de MySQL como '14:30:00'; la agenda usa '14:30'.
const normalizar = (turno) => turno && { ...turno, hora: turno.hora.slice(0, 5), duracion: Number(turno.duracion), precio: Number(turno.precio) };

async function turnosDelDia(fecha, { incluirCancelados = true, conexion = pool } = {}) {
  const [rows] = await conexion.query(
    `SELECT ${COLUMNAS} FROM turnos WHERE fecha = ?${incluirCancelados ? '' : " AND estado <> 'cancelado'"} ORDER BY hora, barbero`,
    [fecha]
  );
  return rows.map(normalizar);
}

async function disponibilidad(consulta) {
  const turnos = await turnosDelDia(consulta.fecha, { incluirCancelados: false });
  return agenda.disponibilidad({ ...consulta, turnos }).map(({ hora }) => hora);
}

// Reserva un turno. Un bloqueo con nombre por día evita que dos pedidos simultáneos tomen el mismo horario.
async function crearTurno(datos, opciones = {}) {
  const servicio = agenda.buscarServicio(datos.servicio);
  const conexion = await pool.getConnection();
  const bloqueo = `khalifa:turnos:${datos.fecha}`;
  try {
    const [[{ obtenido }]] = await conexion.query('SELECT GET_LOCK(?, 5) AS obtenido', [bloqueo]);
    if (obtenido !== 1) throw new TurnoNoDisponible('La agenda está ocupada en este momento. Probá de nuevo.');
    try {
      const turnos = await turnosDelDia(datos.fecha, { incluirCancelados: false, conexion });
      const barbero = agenda.asignarBarbero({ ...opciones, ...datos, turnos });
      if (!barbero) throw new TurnoNoDisponible();

      const fila = {
        servicio: servicio.id,
        barbero,
        fecha: datos.fecha,
        hora: datos.hora,
        duracion: servicio.duracion,
        precio: servicio.precio,
        nombre: datos.nombre,
        telefono: datos.telefono,
        email: datos.email || null,
        notas: datos.notas || null,
        origen: datos.origen === 'panel' ? 'panel' : 'web'
      };
      for (let intento = 0; intento < 5; intento++) {
        const codigo = generarCodigo();
        try {
          await conexion.query('INSERT INTO turnos SET ?', [{ ...fila, codigo }]);
          return { ...fila, codigo, estado: 'reservado' };
        } catch (error) {
          if (error.code !== 'ER_DUP_ENTRY') throw error;
        }
      }
      throw new Error('No se pudo generar un código de turno único.');
    } finally {
      await conexion.query('SELECT RELEASE_LOCK(?)', [bloqueo]);
    }
  } finally {
    conexion.release();
  }
}

// Busca un turno por código y verifica el teléfono, comparando solo los dígitos.
async function buscarTurnoDeCliente(codigo, telefono) {
  if (typeof codigo !== 'string' || !/^[A-Z0-9]{6}$/i.test(codigo.trim())) return;
  const [[turno]] = await pool.query(`SELECT ${COLUMNAS} FROM turnos WHERE codigo = ?`, [codigo.trim().toUpperCase()]);
  const digitos = agenda.soloDigitos(telefono);
  if (!turno || digitos.length < 8 || agenda.soloDigitos(turno.telefono) !== digitos) return;
  return normalizar(turno);
}

function esCancelable(turno, ahora = agenda.ahoraEnArgentina()) {
  if (turno.estado !== 'reservado') return false;
  if (turno.fecha !== ahora.fecha) return turno.fecha > ahora.fecha;
  return agenda.aMinutos(turno.hora) - ahora.minutos >= agenda.ANTICIPACION_MINIMA;
}

async function cancelarTurno(id) {
  const [result] = await pool.query("UPDATE turnos SET estado = 'cancelado' WHERE id = ? AND estado = 'reservado'", [id]);
  return result.affectedRows === 1;
}

async function cambiarEstado(id, estado) {
  if (!agenda.ESTADOS.includes(estado)) return false;
  if (estado === 'reservado') {
    // Volver a reservar un turno cancelado solo es posible si su horario sigue libre.
    const [[turno]] = await pool.query(`SELECT ${COLUMNAS} FROM turnos WHERE id = ?`, [id]);
    if (!turno) return false;
    const actual = normalizar(turno);
    if (actual.estado === 'cancelado') {
      const otros = (await turnosDelDia(actual.fecha, { incluirCancelados: false })).filter((t) => t.barbero === actual.barbero);
      const ocupados = agenda.ocupadosPorBarbero(otros)[actual.barbero];
      const inicio = agenda.aMinutos(actual.hora);
      if (ocupados.some((franja) => inicio < franja.fin && franja.inicio < inicio + actual.duracion)) {
        throw new TurnoNoDisponible('Ese horario ya lo ocupa otro turno.');
      }
    }
  }
  const [result] = await pool.query('UPDATE turnos SET estado = ? WHERE id = ?', [estado, id]);
  return result.affectedRows === 1;
}

async function proximosTurnos(desde, limite = 8) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNAS} FROM turnos
     WHERE estado = 'reservado' AND (fecha > ? OR (fecha = ? AND hora >= ?))
     ORDER BY fecha, hora LIMIT ?`,
    [desde.fecha, desde.fecha, agenda.aHora(Math.max(0, desde.minutos)), limite]
  );
  return rows.map(normalizar);
}

// Indicadores del panel: el día, los próximos siete días y el mes en curso.
async function resumen(ahora = agenda.ahoraEnArgentina()) {
  const semana = agenda.sumarDias(ahora.fecha, 6);
  const mes = ahora.fecha.slice(0, 7);
  const [[fila]] = await pool.query(
    `SELECT
       SUM(fecha = ? AND estado <> 'cancelado') AS hoy,
       SUM(fecha BETWEEN ? AND ? AND estado = 'reservado') AS semana,
       SUM(DATE_FORMAT(fecha, '%Y-%m') = ? AND estado = 'completado') AS atendidos,
       COALESCE(SUM(CASE WHEN DATE_FORMAT(fecha, '%Y-%m') = ? AND estado = 'completado' THEN precio END), 0) AS facturado,
       SUM(DATE_FORMAT(fecha, '%Y-%m') = ? AND estado = 'ausente') AS ausentes
     FROM turnos`,
    [ahora.fecha, ahora.fecha, semana, mes, mes, mes]
  );
  return Object.fromEntries(Object.entries(fila).map(([clave, valor]) => [clave, Number(valor) || 0]));
}

async function getTurnoById(id) {
  if (!/^\d{1,10}$/.test(String(id))) return;
  const [[turno]] = await pool.query(`SELECT ${COLUMNAS} FROM turnos WHERE id = ?`, [id]);
  return normalizar(turno);
}

module.exports = {
  TurnoNoDisponible,
  generarCodigo,
  turnosDelDia,
  disponibilidad,
  crearTurno,
  buscarTurnoDeCliente,
  esCancelable,
  cancelarTurno,
  cambiarEstado,
  proximosTurnos,
  resumen,
  getTurnoById
};
