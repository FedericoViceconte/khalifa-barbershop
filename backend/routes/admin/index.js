const express = require('express');
const fileUpload = require('express-fileupload');
const { randomBytes, timingSafeEqual } = require('node:crypto');

const router = express.Router();

function requiereSesion(req, res, next) {
  if (!req.session.id_usuario) return res.redirect('/admin/login');
  res.locals.layout = 'panel';
  res.locals.usuario = req.session.nombre;
  res.locals.seccion = req.baseUrl.split('/')[2] || 'agenda';
  next();
}

function mismoToken(recibido, esperado) {
  if (typeof recibido !== 'string' || recibido.length !== esperado.length) return false;
  return timingSafeEqual(Buffer.from(recibido), Buffer.from(esperado));
}

// Token CSRF por sesión: todos los formularios del panel lo envían en un campo oculto.
function csrf(req, res, next) {
  req.session.csrfToken ||= randomBytes(32).toString('hex');
  res.locals.csrfToken = req.session.csrfToken;
  if (req.method === 'POST' && !mismoToken(req.body?.csrfToken, req.session.csrfToken)) {
    return res.status(403).render('error', { titulo: 'Formulario vencido', mensaje: 'Recargá la página y volvé a intentarlo.' });
  }
  next();
}

// Mensajes que sobreviven a una redirección ("Turno reservado", "Contraseña actualizada"…).
function avisos(req, res, next) {
  res.locals.aviso = req.session.aviso;
  delete req.session.aviso;
  req.avisar = (tipo, texto) => {
    req.session.aviso = { tipo, texto };
  };
  next();
}

// Las imágenes llegan en formularios multipart: se leen antes de validar el token CSRF.
router.use('/novedades', requiereSesion, fileUpload({ limits: { fileSize: 4 * 1024 * 1024, files: 1 }, abortOnLimit: true }));
router.use(csrf, avisos);

router.use('/login', require('./login'));
router.post('/salir', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('khalifa.sid');
    res.redirect('/admin/login');
  });
});

router.get('/', requiereSesion, (req, res) => res.redirect('/admin/agenda'));
router.use('/agenda', requiereSesion, require('./agenda'));
router.use('/turnos', requiereSesion, require('./turnos'));
router.use('/novedades', requiereSesion, require('./novedades'));
router.use('/cuenta', requiereSesion, require('./cuenta'));

module.exports = router;
