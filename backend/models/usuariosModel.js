const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const pool = require('./bd');

const deriveKey = promisify(scrypt);
const FORMATO = /^[a-f0-9]{32}:[a-f0-9]{128}$/;

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await deriveKey(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}

async function verificarPassword(password, guardada) {
  if (typeof password !== 'string' || password.length > 256 || !FORMATO.test(guardada ?? '')) return false;
  const [salt, hash] = guardada.split(':');
  const key = await deriveKey(password, salt, 64);
  return timingSafeEqual(key, Buffer.from(hash, 'hex'));
}

function validarPasswordNueva(password, usuario) {
  if (typeof password !== 'string' || password.length < 12) return 'La contraseña nueva debe tener al menos 12 caracteres.';
  if (password.length > 256) return 'La contraseña nueva no puede superar los 256 caracteres.';
  if (usuario && password.toLowerCase().includes(usuario.toLowerCase())) return 'La contraseña no puede contener el nombre de usuario.';
  return null;
}

async function getUserByUsernameAndPassword(user, password) {
  if (typeof user !== 'string' || user.length > 80 || typeof password !== 'string' || password.length > 256) return;
  const [[account]] = await pool.execute('SELECT id, usuario, password FROM usuarios WHERE usuario = ? LIMIT 1', [user]);
  if (account && (await verificarPassword(password, account.password))) return { id: account.id, usuario: account.usuario };
}

async function contarUsuarios() {
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
  return Number(total);
}

async function crearUsuario(usuario, password) {
  if (typeof usuario !== 'string' || !/^[\w.-]{3,80}$/.test(usuario)) {
    throw new Error('El usuario debe tener entre 3 y 80 letras, números, puntos o guiones.');
  }
  const error = validarPasswordNueva(password, usuario);
  if (error) throw new Error(error);
  await pool.execute('INSERT INTO usuarios (usuario, password) VALUES (?, ?)', [usuario, await hashPassword(password)]);
}

async function cambiarPassword(id, actual, nueva) {
  const [[account]] = await pool.execute('SELECT usuario, password FROM usuarios WHERE id = ?', [id]);
  if (!account || !(await verificarPassword(actual, account.password))) return 'La contraseña actual no es correcta.';
  const error = validarPasswordNueva(nueva, account.usuario);
  if (error) return error;
  if (actual === nueva) return 'La contraseña nueva tiene que ser distinta de la actual.';
  await pool.execute('UPDATE usuarios SET password = ? WHERE id = ?', [await hashPassword(nueva), id]);
  return null;
}

module.exports = {
  hashPassword,
  verificarPassword,
  validarPasswordNueva,
  getUserByUsernameAndPassword,
  contarUsuarios,
  crearUsuario,
  cambiarPassword
};
