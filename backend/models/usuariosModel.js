const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const pool = require('./bd');

const deriveKey = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await deriveKey(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}

async function getUserByUsernameAndPassword(user, password) {
  if (typeof user !== 'string' || user.length > 80 ||
      typeof password !== 'string' || password.length > 256) return;
  const [[account]] = await pool.execute(
    'SELECT id, usuario, password FROM usuarios WHERE usuario = ? LIMIT 1', [user]
  );
  if (!account || !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(account.password)) return;
  const [salt, hash] = account.password.split(':');
  const key = await deriveKey(password, salt, 64);
  if (timingSafeEqual(key, Buffer.from(hash, 'hex'))) return account;
}

module.exports = { hashPassword, getUserByUsernameAndPassword };
