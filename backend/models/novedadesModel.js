const pool = require('./bd');

async function getNovedades() {
  const [rows] = await pool.query('SELECT * FROM novedades ORDER BY id DESC');
  return rows;
}

async function insertNovedad(novedad) {
  const [result] = await pool.query('INSERT INTO novedades SET ?', [novedad]);
  return result;
}

async function deleteNovedadesById(id) {
  const [result] = await pool.query('DELETE FROM novedades WHERE id = ?', [id]);
  return result;
}

async function getNovedadById(id) {
  const [rows] = await pool.query('SELECT * FROM novedades WHERE id = ?', [id]);
  return rows[0];
}

async function modificarNovedadById(novedad, id) {
  const [result] = await pool.query('UPDATE novedades SET ? WHERE id = ?', [novedad, id]);
  return result;
}

module.exports = { getNovedades, insertNovedad, deleteNovedadesById, getNovedadById, modificarNovedadById };
