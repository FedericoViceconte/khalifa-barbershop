import { asset } from './asset';

// Catálogo de productos. `precio` es el de lista; el descuento se aplica al mostrarlo.
export const productos = [
  { nombre: 'Patillera Babyliss', imagen: asset('img/patillera.png'), precio: 20000, descuento: 25, estrellas: 4, categoria: 'Máquinas' },
  { nombre: 'Espejo de barbería', imagen: asset('img/espejo.png'), precio: 3080, descuento: 15, estrellas: 3, categoria: 'Mobiliario' },
  { nombre: 'Tijera profesional', imagen: asset('img/tijeraa.png'), precio: 5820, descuento: 36, estrellas: 5, categoria: 'Herramientas' },
  { nombre: 'Sillón de barbería', imagen: asset('img/sillon.png'), precio: 60700, descuento: 45, estrellas: 4, categoria: 'Mobiliario' },
  { nombre: 'Secador de pelo', imagen: asset('img/secador.png'), precio: 4950, descuento: 10, estrellas: 3, categoria: 'Máquinas' },
  { nombre: 'Set de barbero profesional', imagen: asset('img/set.png'), precio: 2120, descuento: 30, estrellas: 5, categoria: 'Herramientas' }
];

export const galeria = [
  { imagen: asset('img/sillon.png'), titulo: 'El sillón', detalle: 'Sillón reclinable de estilo clásico.' },
  { imagen: asset('img/espejo.png'), titulo: 'El espejo', detalle: 'Espejo de pie con marco tipo baúl.' },
  { imagen: asset('img/tijeraa.png'), titulo: 'Las tijeras', detalle: 'Tijeras profesionales para corte y texturizado.' },
  { imagen: asset('img/patillera.png'), titulo: 'La patillera', detalle: 'Para perfilar nucas, patillas y barbas.' },
  { imagen: asset('img/set.png'), titulo: 'El set', detalle: 'Capa, peines y herramientas de trabajo.' },
  { imagen: asset('img/secador.png'), titulo: 'El secador', detalle: 'Secador profesional para las terminaciones.' }
];

export const DIRECCION = 'Ciudad Evita, Buenos Aires';
export const HORARIO_TEXTO = 'Martes a sábado, de 10 a 20 h';
export const MAPA = 'https://www.google.com/maps?q=Ciudad%20Evita%2C%20Buenos%20Aires&output=embed';
export const COMO_LLEGAR = 'https://www.google.com/maps/search/?api=1&query=Ciudad%20Evita%2C%20Buenos%20Aires';
