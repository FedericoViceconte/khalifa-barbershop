const { readFile } = require('node:fs/promises');
const path = require('node:path');
const pool = require('./bd');
const { contarUsuarios, crearUsuario } = require('./usuariosModel');

// Columnas agregadas después de la primera versión del esquema.
const COLUMNAS_NUEVAS = [
  ['novedades', 'creada', 'ADD COLUMN creada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP']
];

async function crearTablas() {
  const sql = await readFile(path.join(__dirname, '../sql/schema.sql'), 'utf8');
  const sentencias = sql
    .replace(/^--.*$/gm, '')
    .split(';')
    .map((sentencia) => sentencia.trim())
    .filter(Boolean);
  for (const sentencia of sentencias) await pool.query(sentencia);

  for (const [tabla, columna, alter] of COLUMNAS_NUEVAS) {
    const [[{ existe }]] = await pool.query(
      `SELECT COUNT(*) AS existe FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
      [tabla, columna]
    );
    if (!existe) await pool.query(`ALTER TABLE ${tabla} ${alter}`);
  }
}

// Si la base no tiene administradores y hay ADMIN_USER y ADMIN_PASSWORD, crea el primero (útil con Docker).
async function crearAdministradorInicial({ usuario = process.env.ADMIN_USER, password = process.env.ADMIN_PASSWORD } = {}) {
  if (!usuario || !password || (await contarUsuarios()) > 0) return false;
  await crearUsuario(usuario, password);
  return true;
}

async function prepararBase({ intentos = 1, espera = 3000, log = console.log } = {}) {
  for (let intento = 1; ; intento++) {
    try {
      await crearTablas();
      if (await crearAdministradorInicial()) log(`Administrador inicial creado: ${process.env.ADMIN_USER}.`);
      return;
    } catch (error) {
      if (intento >= intentos || !['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST'].includes(error.code)) {
        throw error;
      }
      log(`La base todavía no responde (${error.code}). Reintento ${intento} de ${intentos - 1}…`);
      await new Promise((resolve) => setTimeout(resolve, espera));
    }
  }
}

module.exports = { prepararBase, crearTablas, crearAdministradorInicial };
