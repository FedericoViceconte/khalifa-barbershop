import { Link } from 'react-router-dom';
import { asset } from '../asset';

export const productos = [
  { nombre: 'Patillera Babyliss', imagen: asset('img/patillera.png'), precio: 20000, descuento: 25, estrellas: 4 },
  { nombre: 'Espejo de barbería', imagen: asset('img/espejo.png'), precio: 3080, descuento: 15, estrellas: 3 },
  { nombre: 'Tijera profesional', imagen: asset('img/tijeraa.png'), precio: 5820, descuento: 36, estrellas: 5 },
  { nombre: 'Sillón de barbería', imagen: asset('img/sillon.png'), precio: 60700, descuento: 45, estrellas: 4 },
  { nombre: 'Secador de pelo', imagen: asset('img/secador.png'), precio: 4950, descuento: 10, estrellas: 3 },
  { nombre: 'Set de barbero profesional', imagen: asset('img/set.png'), precio: 2120, descuento: 30, estrellas: 5 }
];

const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const Productos = () => {
  return (
    <main className="main">
      <section className="shop">
        <h2>NUESTROS PRODUCTOS</h2>
        {productos.map(({ nombre, imagen, precio, descuento, estrellas }) => (
          <article className="card estilo-c" key={nombre}>
            <div className="img-container">
              <img src={imagen} alt={nombre} />
              <span className="promo">{descuento}% de descuento</span>
            </div>
            <div className="info-container">
              <h3>{nombre}</h3>
              <strong>{pesos.format(precio)}</strong>
              <span className="rating" role="img" aria-label={`${estrellas} de 5 estrellas`}>
                {'★'.repeat(estrellas) + '☆'.repeat(5 - estrellas)}
              </span>
              <Link to="/contacto" className="add-cart">Consultar</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Productos;
