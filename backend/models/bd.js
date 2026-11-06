const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB_NAME,
  // Fechas y horas como texto ('2026-11-10', '14:30:00'): la agenda trabaja con la hora local sin conversiones.
  dateStrings: true
});

// Argentina no tiene horario de verano: las marcas de tiempo de la base usan su hora local.
pool.pool.on('connection', (connection) => {
  connection.query("SET time_zone = '-03:00'");
});

module.exports = pool;
