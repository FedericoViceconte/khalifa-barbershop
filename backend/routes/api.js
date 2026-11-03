const router = require('express').Router();
const { getNovedades } = require('../models/novedadesModel');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');

router.get('/novedades', async (req, res, next) => {
  try {
    const novedades = await getNovedades();
    res.json(novedades.map(({ id, titulo, subtitulo, cuerpo, img_id }) => ({
      id, titulo, subtitulo, cuerpo,
      imagen: img_id ? cloudinary.url(img_id, { secure: true, width: 960, crop: 'limit' }) : ''
    })));
  } catch (error) {
    next(error);
  }
});

router.post('/contacto', async (req, res) => {
  const { nombre, email, mensaje } = req.body;
  if (typeof nombre !== 'string' || !nombre.trim() || nombre.length > 120 ||
      typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof mensaje !== 'string' || !mensaje.trim() || mensaje.length > 3000) {
    return res.status(400).json({ message: 'Revisá el nombre, el correo y el mensaje.' });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !CONTACT_EMAIL) {
    return res.json({ message: 'Formulario de demostración. No se envió ningún correo.' });
  }

  try {
    const transport = nodemailer.createTransport({
      host: SMTP_HOST, port: Number(SMTP_PORT), secure: SMTP_PORT === '465',
      requireTLS: SMTP_PORT !== '465',
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    await transport.sendMail({
      from: SMTP_USER, to: CONTACT_EMAIL, replyTo: email,
      subject: 'Contacto web', text: `${nombre}\n\n${mensaje}`
    });
    res.status(201).json({ message: 'Mensaje enviado.' });
  } catch {
    res.status(502).json({ message: 'No se pudo enviar el mensaje.' });
  }
});

module.exports = router;
