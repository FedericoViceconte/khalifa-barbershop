const createError = require('http-errors');
const express = require('express');
const path = require('node:path');
const logger = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const { engine } = require('express-handlebars');

require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error('Configurá SESSION_SECRET con al menos 32 caracteres.');
}

const helpers = require('./lib/helpers');
const SesionesMySQL = require('./models/sesionesStore');

const app = express();
const produccion = app.get('env') === 'production';
const https = process.env.COOKIE_SECURE === 'true';

// Detrás de un proxy inverso (Nginx, Caddy…) hace falta para conocer la IP real de cada visitante.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'simple',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      'img-src': ["'self'", 'data:', 'https://res.cloudinary.com'],
      'style-src': ["'self'"],
      'font-src': ["'self'"],
      'frame-src': ['https://www.google.com'],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': https ? [] : null
    }
  },
  strictTransportSecurity: https
}));

if (process.env.NODE_ENV !== 'test') app.use(logger(produccion ? 'combined' : 'dev'));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: produccion ? '1d' : 0 }));

app.use(session({
  name: 'khalifa.sid',
  secret: process.env.SESSION_SECRET,
  store: process.env.SESSION_STORE === 'mysql' ? new SesionesMySQL() : undefined,
  cookie: { httpOnly: true, sameSite: 'lax', secure: https, maxAge: 8 * 60 * 60 * 1000 },
  resave: false,
  saveUninitialized: false
}));

app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));

// El sitio de React compilado. Las rutas que no conoce responden 404 con la misma app, que muestra su página de error.
const frontend = path.join(__dirname, '../frontend/build');
const RUTAS_DEL_SITIO = ['/', '/inicio', '/servicios', '/reservar', '/mi-turno', '/galeria', '/productos', '/ubicacion', '/contacto'];
app.use(express.static(frontend, { index: false, maxAge: produccion ? '1h' : 0 }));
app.get(/.*/, (req, res, next) => {
  if (!req.accepts('html') || req.path.startsWith('/api') || req.path.startsWith('/admin')) return next();
  res.status(RUTAS_DEL_SITIO.includes(req.path) ? 200 : 404);
  res.sendFile(path.join(frontend, 'index.html'), (error) => {
    if (error) next(createError(404));
  });
});

app.use((req, res, next) => next(createError(404)));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(status).json({ message: status === 404 ? 'No existe.' : 'Ocurrió un error en el servidor.' });
  }
  res.status(status).render('error', {
    titulo: status === 404 ? 'Página no encontrada' : 'Algo salió mal',
    mensaje: status === 404 ? 'La dirección que buscás no existe.' : 'Probá de nuevo en unos minutos.',
    detalle: produccion || status < 500 ? null : err.stack
  });
});

module.exports = app;
