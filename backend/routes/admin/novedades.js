const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const model = require('../../models/novedadesModel');
const layout = 'admin/layout';

function readFields(body) {
  const { titulo, subtitulo, cuerpo } = body;
  if (![titulo, subtitulo, cuerpo].every((value) => typeof value === 'string' && value.trim()) ||
      titulo.length > 160 || subtitulo.length > 240 || cuerpo.length > 10000) return;
  return { titulo: titulo.trim(), subtitulo: subtitulo.trim(), cuerpo: cuerpo.trim() };
}

async function uploadImage(file) {
  if (!file) return null;
  if (!process.env.CLOUDINARY_URL || !['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
    throw new Error('La imagen requiere Cloudinary y debe ser PNG, JPG o WebP.');
  }
  const image = await new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    upload.end(file.data);
  });
  return image.public_id;
}

async function removeImage(id) {
  if (!id) return;
  try {
    await cloudinary.uploader.destroy(id);
  } catch {
    console.error('No se pudo eliminar una imagen de Cloudinary.');
  }
}

router.get('/', async (req, res, next) => {
  try {
    const novedades = (await model.getNovedades()).map((item) => ({
      ...item,
      imagen: item.img_id ? cloudinary.url(item.img_id, { secure: true, width: 70, height: 70, crop: 'fill' }) : null
    }));
    res.render('admin/novedades', { layout, usuario: req.session.nombre, novedades });
  } catch (error) {
    next(error);
  }
});

router.get('/agregar', (req, res) => res.render('admin/agregar', { layout }));

router.post('/agregar', async (req, res, next) => {
  const fields = readFields(req.body);
  if (!fields) return res.status(400).render('admin/agregar', { layout, error: true, message: 'Revisá los campos de la novedad.' });

  let image;
  try {
    image = await uploadImage(req.files?.imagen);
    await model.insertNovedad({ ...fields, img_id: image });
    res.redirect('/admin/novedades');
  } catch (error) {
    await removeImage(image);
    next(error);
  }
});

router.post('/eliminar/:id', async (req, res, next) => {
  try {
    const item = await model.getNovedadById(req.params.id);
    if (!item) return res.sendStatus(404);
    await model.deleteNovedadesById(item.id);
    await removeImage(item.img_id);
    res.redirect('/admin/novedades');
  } catch (error) {
    next(error);
  }
});

router.get('/modificar/:id', async (req, res, next) => {
  try {
    const novedad = await model.getNovedadById(req.params.id);
    if (!novedad) return res.sendStatus(404);
    res.render('admin/modificar', { layout, novedad });
  } catch (error) {
    next(error);
  }
});

router.post('/modificar', async (req, res, next) => {
  let image;
  try {
    const novedad = await model.getNovedadById(req.body.id);
    if (!novedad) return res.sendStatus(404);
    const fields = readFields(req.body);
    if (!fields) return res.status(400).render('admin/modificar', { layout, novedad, error: true, message: 'Revisá los campos de la novedad.' });

    image = await uploadImage(req.files?.imagen);
    const img_id = image || (req.body.img_delete === '1' ? null : novedad.img_id);
    await model.modificarNovedadById({ ...fields, img_id }, novedad.id);
    if (img_id !== novedad.img_id) await removeImage(novedad.img_id);
    res.redirect('/admin/novedades');
  } catch (error) {
    await removeImage(image);
    next(error);
  }
});

module.exports = router;
