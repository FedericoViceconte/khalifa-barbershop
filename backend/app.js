var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload');
var { engine } = require('express-handlebars');
var { randomBytes } = require('node:crypto');

require('dotenv').config();
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error('Configurá SESSION_SECRET con al menos 32 caracteres.');
}
var session = require('express-session');


var loginRouter = require('./routes/admin/login'); //login.js
var adminRouter = require('./routes/admin/novedades');
var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views')
}));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true' },
  resave: false,
  saveUninitialized: false
}))

function secured(req, res, next) {
  if (!req.session.id_usuario) return res.redirect('/admin/login');
  next();
}

app.use('/admin/novedades', secured, fileUpload({
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  abortOnLimit: true
}));


app.use('/admin', (req, res, next) => {
  req.session.csrfToken ||= randomBytes(32).toString('hex');
  res.locals.csrfToken = req.session.csrfToken;
  if (req.method === 'POST' && req.body?.csrfToken !== req.session.csrfToken) {
    return res.sendStatus(403);
  }
  next();
});
app.use('/admin/login', loginRouter);
app.use('/admin/novedades', adminRouter);
app.use('/api', apiRouter);
const frontend = path.join(__dirname, '../frontend/build');
app.use(express.static(frontend));
app.get(['/', '/inicio', '/galeria', '/productos', '/ubicacion', '/contacto'], (req, res, next) => {
  res.sendFile(path.join(frontend, 'index.html'), (error) => {
    if (error) next(error);
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
