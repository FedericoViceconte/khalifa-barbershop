const router = require('express').Router();
const { cambiarPassword } = require('../../models/usuariosModel');

router.get('/', (req, res) => res.render('admin/cuenta', { titulo: 'Mi cuenta' }));

router.post('/', async (req, res) => {
  const { actual, nueva, repetida } = req.body;
  let error = null;
  if (typeof nueva !== 'string' || nueva !== repetida) error = 'Las contraseñas nuevas no coinciden.';
  else error = await cambiarPassword(req.session.id_usuario, actual, nueva);

  if (error) return res.status(400).render('admin/cuenta', { titulo: 'Mi cuenta', error });
  req.avisar('exito', 'Contraseña actualizada.');
  res.redirect('/admin/cuenta');
});

module.exports = router;
