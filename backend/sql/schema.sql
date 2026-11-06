-- El servidor ejecuta este archivo al arrancar: crea las tablas que falten y no toca las existentes.

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(80) NOT NULL UNIQUE,
  password VARCHAR(161) NOT NULL
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS novedades (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  subtitulo VARCHAR(240) NOT NULL,
  cuerpo TEXT NOT NULL,
  img_id VARCHAR(255) DEFAULT NULL,
  creada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS turnos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo CHAR(6) NOT NULL UNIQUE,
  servicio VARCHAR(40) NOT NULL,
  barbero VARCHAR(40) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  duracion SMALLINT UNSIGNED NOT NULL,
  precio INT UNSIGNED NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  email VARCHAR(254) DEFAULT NULL,
  notas VARCHAR(500) DEFAULT NULL,
  estado ENUM('reservado', 'completado', 'ausente', 'cancelado') NOT NULL DEFAULT 'reservado',
  origen ENUM('web', 'panel') NOT NULL DEFAULT 'web',
  creado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_turnos_agenda (fecha, barbero, hora)
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sesiones (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  datos TEXT NOT NULL,
  expira BIGINT UNSIGNED NOT NULL,
  INDEX idx_sesiones_expira (expira)
) DEFAULT CHARSET=utf8mb4;
