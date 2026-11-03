const router = require('express').Router();
const { getUserByUsernameAndPassword } = require('../../models/usuariosModel');
const layout = 'admin/layout';

router.get('/', (req, res) => {
  if (req.session.id_usuario) return res.redirect('/admin/novedades');
  res.render('admin/login', { layout });
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
});

router.post('/', async (req, res, next) => {
  try {
    const account = await getUserByUsernameAndPassword(req.body.usuario, req.body.password);
    if (!account) return res.status(401).render('admin/login', { layout, error: true });
    req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.id_usuario = account.id;
      req.session.nombre = account.usuario;
      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        res.redirect('/admin/novedades');
      });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
