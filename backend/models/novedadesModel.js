const pool = require('./bd');

const COLUMNAS = 'id, titulo, subtitulo, cuerpo, img_id, creada';

async function getNovedades({ limite } = {}) {
  const sql = `SELECT ${COLUMNAS} FROM novedades ORDER BY creada DESC, id DESC${limite ? ' LIMIT ?' : ''}`;
  const [rows] = await pool.query(sql, limite ? [limite] : []);
  return rows;
}

async function insertNovedad({ titulo, subtitulo, cuerpo, img_id }) {
  const [result] = await pool.execute(
    'INSERT INTO novedades (titulo, subtitulo, cuerpo, img_id) VALUES (?, ?, ?, ?)',
    [titulo, subtitulo, cuerpo, img_id ?? null]
  );
  return result;
}

async function deleteNovedadesById(id) {
  const [result] = await pool.execute('DELETE FROM novedades WHERE id = ?', [id]);
  return result;
}

async function getNovedadById(id) {
  if (!/^\d{1,10}$/.test(String(id))) return;
  const [rows] = await pool.execute(`SELECT ${COLUMNAS} FROM novedades WHERE id = ?`, [id]);
  return rows[0];
}

async function modificarNovedadById({ titulo, subtitulo, cuerpo, img_id }, id) {
  const [result] = await pool.execute(
    'UPDATE novedades SET titulo = ?, subtitulo = ?, cuerpo = ?, img_id = ? WHERE id = ?',
    [titulo, subtitulo, cuerpo, img_id ?? null, id]
  );
  return result;
}

module.exports = { getNovedades, insertNovedad, deleteNovedadesById, getNovedadById, modificarNovedadById };
