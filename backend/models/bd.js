const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB_NAME
});
