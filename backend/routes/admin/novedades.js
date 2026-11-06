const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const model = require('../../models/novedadesModel');
const { validarNovedad } = require('../../lib/validaciones');

const TIPOS = ['image/png', 'image/jpeg', 'image/webp'];

class ErrorDeImagen extends Error {}

async function uploadImage(file) {
  if (!file) return null;
  if (!process.env.CLOUDINARY_URL) throw new ErrorDeImagen('Para subir imágenes hay que configurar CLOUDINARY_URL.');
  if (!TIPOS.includes(file.mimetype)) throw new ErrorDeImagen('La imagen debe ser PNG, JPG o WebP.');
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

const miniatura = (id) => (id ? cloudinary.url(id, { secure: true, width: 160, height: 160, crop: 'fill' }) : null);

function formulario(res, { novedad = {}, error, status = 200 } = {}) {
  res.status(status).render('admin/novedad-form', {
    titulo: novedad.id ? 'Editar novedad' : 'Nueva novedad',
    novedad: { ...novedad, imagen: miniatura(novedad.img_id) },
    cloudinary: Boolean(process.env.CLOUDINARY_URL),
    error
  });
}

router.get('/', async (req, res) => {
  const novedades = (await model.getNovedades()).map((item) => ({ ...item, imagen: miniatura(item.img_id) }));
  res.render('admin/novedades', { titulo: 'Novedades', novedades });
});

router.get('/agregar', (req, res) => formulario(res));

router.post('/agregar', async (req, res) => {
  const fields = validarNovedad(req.body);
  if (!fields) return formulario(res, { novedad: req.body, error: 'Completá el título, el subtítulo y el texto.', status: 400 });

  let image;
  try {
    image = await uploadImage(req.files?.imagen);
    await model.insertNovedad({ ...fields, img_id: image });
  } catch (error) {
    await removeImage(image);
    if (error instanceof ErrorDeImagen) return formulario(res, { novedad: req.body, error: error.message, status: 400 });
    throw error;
  }
  req.avisar('exito', 'Novedad publicada.');
  res.redirect('/admin/novedades');
});

router.get('/modificar/:id', async (req, res) => {
  const novedad = await model.getNovedadById(req.params.id);
  if (!novedad) return res.status(404).render('error', { titulo: 'Novedad no encontrada', mensaje: 'Puede que la hayan borrado.' });
  formulario(res, { novedad });
});

router.post('/modificar/:id', async (req, res) => {
  const novedad = await model.getNovedadById(req.params.id);
  if (!novedad) return res.status(404).render('error', { titulo: 'Novedad no encontrada', mensaje: 'Puede que la hayan borrado.' });
  const fields = validarNovedad(req.body);
  if (!fields) {
    return formulario(res, { novedad: { ...novedad, ...req.body, id: novedad.id }, error: 'Completá el título, el subtítulo y el texto.', status: 400 });
  }

  let image;
  try {
    image = await uploadImage(req.files?.imagen);
    const img_id = image || (req.body.img_delete === '1' ? null : novedad.img_id);
    await model.modificarNovedadById({ ...fields, img_id }, novedad.id);
    if (img_id !== novedad.img_id) await removeImage(novedad.img_id);
  } catch (error) {
    await removeImage(image);
    if (error instanceof ErrorDeImagen) return formulario(res, { novedad: { ...novedad, ...fields }, error: error.message, status: 400 });
    throw error;
  }
  req.avisar('exito', 'Novedad actualizada.');
  res.redirect('/admin/novedades');
});

router.post('/eliminar/:id', async (req, res) => {
  const item = await model.getNovedadById(req.params.id);
  if (!item) return res.status(404).render('error', { titulo: 'Novedad no encontrada', mensaje: 'Puede que la hayan borrado.' });
  await model.deleteNovedadesById(item.id);
  await removeImage(item.img_id);
  req.avisar('exito', 'Novedad eliminada.');
  res.redirect('/admin/novedades');
});

module.exports = router;
