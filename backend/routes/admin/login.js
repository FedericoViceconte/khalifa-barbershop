const router = require('express').Router();
const { getUserByUsernameAndPassword } = require('../../models/usuariosModel');
const limites = require('../../lib/limites');

router.get('/', (req, res) => {
  if (req.session.id_usuario) return res.redirect('/admin/agenda');
  res.render('admin/login');
});

router.post('/', limites.login, async (req, res, next) => {
  const account = await getUserByUsernameAndPassword(req.body.usuario, req.body.password);
  if (!account) {
    return res.status(401).render('admin/login', {
      error: 'Usuario o contraseña incorrectos.',
      usuario: typeof req.body.usuario === 'string' ? req.body.usuario.slice(0, 80) : ''
    });
  }
  // Una sesión nueva al entrar evita que alguien fije de antemano el identificador de sesión.
  req.session.regenerate((error) => {
    if (error) return next(error);
    req.session.id_usuario = account.id;
    req.session.nombre = account.usuario;
    req.session.save((saveError) => {
      if (saveError) return next(saveError);
      res.redirect('/admin/agenda');
    });
  });
});

module.exports = router;
