const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const pool = require('../models/bd');
const { getNovedades } = require('../models/novedadesModel');
const turnos = require('../models/turnosModel');
const agenda = require('../../shared/agenda.mjs');
const limites = require('../lib/limites');
const { validarContacto, validarReserva } = require('../lib/validaciones');

// Chequeo de salud para Docker y monitoreo: fuera del límite de pedidos.
router.get('/salud', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok', base: 'ok' });
  } catch {
    res.status(503).json({ estado: 'degradado', base: 'sin conexión' });
  }
});

router.use(limites.api);

router.get('/novedades', async (req, res) => {
  const novedades = await getNovedades({ limite: 12 });
  res.json(novedades.map(({ id, titulo, subtitulo, cuerpo, img_id, creada }) => ({
    id,
    titulo,
    subtitulo,
    cuerpo,
    fecha: creada?.slice(0, 10) ?? null,
    imagen: img_id ? cloudinary.url(img_id, { secure: true, width: 960, crop: 'limit' }) : ''
  })));
});

router.get('/turnos/disponibilidad', async (req, res) => {
  const { fecha, servicio, barbero = 'cualquiera' } = req.query;
  if (!agenda.buscarServicio(servicio) || (barbero !== 'cualquiera' && !agenda.buscarBarbero(barbero))) {
    return res.status(400).json({ message: 'Elegí un servicio y un barbero válidos.' });
  }
  if (!agenda.dentroDelPlazo(fecha)) {
    return res.status(400).json({ message: `Elegí una fecha dentro de los próximos ${agenda.DIAS_DE_RESERVA} días.` });
  }
  res.json({
    fecha,
    abierto: agenda.abre(fecha),
    horarios: agenda.abre(fecha) ? await turnos.disponibilidad({ fecha, servicio, barbero }) : []
  });
});

const turnoPublico = (turno) => ({
  codigo: turno.codigo,
  servicio: agenda.buscarServicio(turno.servicio)?.nombre ?? turno.servicio,
  barbero: agenda.buscarBarbero(turno.barbero)?.nombre ?? turno.barbero,
  fecha: turno.fecha,
  hora: turno.hora,
  duracion: turno.duracion,
  precio: turno.precio,
  nombre: turno.nombre,
  estado: turno.estado,
  cancelable: turnos.esCancelable(turno)
});

router.post('/turnos', limites.reservas, async (req, res) => {
  const { datos, error } = validarReserva(req.body);
  if (error) return res.status(400).json({ message: error });
  try {
    const turno = await turnos.crearTurno({ ...datos, origen: 'web' });
    res.status(201).json(turnoPublico(turno));
  } catch (falla) {
    if (falla instanceof turnos.TurnoNoDisponible) return res.status(409).json({ message: falla.message });
    throw falla;
  }
});

router.post('/turnos/consulta', limites.consultas, async (req, res) => {
  const turno = await turnos.buscarTurnoDeCliente(req.body?.codigo, req.body?.telefono);
  if (!turno) return res.status(404).json({ message: 'No encontramos un turno con ese código y teléfono.' });
  res.json(turnoPublico(turno));
});

router.post('/turnos/cancelar', limites.consultas, async (req, res) => {
  const turno = await turnos.buscarTurnoDeCliente(req.body?.codigo, req.body?.telefono);
  if (!turno) return res.status(404).json({ message: 'No encontramos un turno con ese código y teléfono.' });
  if (!turnos.esCancelable(turno)) {
    return res.status(409).json({
      message: `Este turno ya no se puede cancelar desde la web. Si falta menos de ${agenda.ANTICIPACION_MINIMA} minutos, llamanos.`
    });
  }
  await turnos.cancelarTurno(turno.id);
  res.json({ message: 'Turno cancelado. ¡Te esperamos otro día!', turno: turnoPublico({ ...turno, estado: 'cancelado' }) });
});

router.post('/contacto', limites.contacto, async (req, res) => {
  const datos = validarContacto(req.body);
  if (!datos) return res.status(400).json({ message: 'Revisá el nombre, el correo y el mensaje.' });

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !CONTACT_EMAIL) {
    return res.json({ message: 'Formulario de demostración. No se envió ningún correo.' });
  }

  try {
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_PORT === '465',
      requireTLS: SMTP_PORT !== '465',
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    await transport.sendMail({
      from: SMTP_USER,
      to: CONTACT_EMAIL,
      replyTo: datos.email,
      subject: 'Contacto web',
      text: `${datos.nombre}\n\n${datos.mensaje}`
    });
    res.status(201).json({ message: 'Mensaje enviado.' });
  } catch {
    res.status(502).json({ message: 'No se pudo enviar el mensaje.' });
  }
});

module.exports = router;
