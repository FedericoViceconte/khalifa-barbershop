INSERT INTO novedades (id, titulo, subtitulo, cuerpo) VALUES
  (1, 'Bienvenidos a Khalifa Barbershop', 'Novedad de demostración', 'Conocé los servicios de corte clásico, arreglo de barba y afeitado.')
ON DUPLICATE KEY UPDATE id = id;
