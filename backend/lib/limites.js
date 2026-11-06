const { rateLimit } = require('express-rate-limit');

const MINUTO = 60 * 1000;
const base = { standardHeaders: 'draft-8', legacyHeaders: false };
const json = (message) => (req, res, next, options) => res.status(options.statusCode).json({ message });

// Inicio de sesión del panel: 5 intentos fallidos cada 15 minutos por dirección IP.
const login = rateLimit({
  ...base,
  windowMs: 15 * MINUTO,
  limit: 5,
  skipSuccessfulRequests: true,
  handler: (req, res, next, options) =>
    res.status(options.statusCode).render('admin/login', {
      error: 'Demasiados intentos fallidos. Esperá 15 minutos antes de volver a probar.',
      usuario: typeof req.body?.usuario === 'string' ? req.body.usuario.slice(0, 80) : ''
    })
});

const contacto = rateLimit({
  ...base,
  windowMs: 15 * MINUTO,
  limit: 5,
  handler: json('Enviaste varios mensajes seguidos. Probá de nuevo en unos minutos.')
});

const reservas = rateLimit({
  ...base,
  windowMs: 60 * MINUTO,
  limit: 10,
  handler: json('Hiciste muchas reservas seguidas. Si necesitás más turnos, llamanos.')
});

// Consultas y cancelaciones: solo cuentan los intentos que fallan, para frenar a quien prueba códigos al azar.
const consultas = rateLimit({
  ...base,
  windowMs: 15 * MINUTO,
  limit: 10,
  skipSuccessfulRequests: true,
  handler: json('Demasiados intentos. Esperá unos minutos y revisá el código y el teléfono.')
});

const api = rateLimit({ ...base, windowMs: 15 * MINUTO, limit: 300, handler: json('Demasiadas solicitudes. Probá más tarde.') });

module.exports = { login, contacto, reservas, consultas, api };
