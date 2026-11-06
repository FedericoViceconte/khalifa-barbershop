const session = require('express-session');
const pool = require('./bd');

const UN_DIA = 24 * 60 * 60 * 1000;

// Guarda las sesiones del panel en MySQL para que sobrevivan a un reinicio del servidor.
class SesionesMySQL extends session.Store {
  constructor({ limpiezaCada = 15 * 60 * 1000 } = {}) {
    super();
    this.limpieza = setInterval(() => this.limpiar().catch(() => {}), limpiezaCada);
    this.limpieza.unref();
  }

  static expiracion(sess) {
    const expira = sess?.cookie?.expires ? new Date(sess.cookie.expires).getTime() : NaN;
    return Number.isFinite(expira) ? expira : Date.now() + UN_DIA;
  }

  get(sid, callback) {
    pool
      .query('SELECT datos FROM sesiones WHERE id = ? AND expira > ?', [sid, Date.now()])
      .then(([[fila]]) => callback(null, fila ? JSON.parse(fila.datos) : null), callback);
  }

  set(sid, sess, callback = () => {}) {
    pool
      .query(
        'INSERT INTO sesiones (id, datos, expira) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE datos = VALUES(datos), expira = VALUES(expira)',
        [sid, JSON.stringify(sess), SesionesMySQL.expiracion(sess)]
      )
      .then(() => callback(null), callback);
  }

  touch(sid, sess, callback = () => {}) {
    pool
      .query('UPDATE sesiones SET expira = ? WHERE id = ?', [SesionesMySQL.expiracion(sess), sid])
      .then(() => callback(null), callback);
  }

  destroy(sid, callback = () => {}) {
    pool.query('DELETE FROM sesiones WHERE id = ?', [sid]).then(() => callback(null), callback);
  }

  async limpiar() {
    await pool.query('DELETE FROM sesiones WHERE expira <= ?', [Date.now()]);
  }

  cerrar() {
    clearInterval(this.limpieza);
  }
}

module.exports = SesionesMySQL;
