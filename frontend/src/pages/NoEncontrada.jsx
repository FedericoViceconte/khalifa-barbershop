import { Link } from 'react-router-dom';

const NoEncontrada = () => {
  return (
    <main className="main">
      <section className="container no-encontrada">
        <h1>Página no encontrada</h1>
        <p>La dirección que buscás no existe o cambió de lugar.</p>
        <Link to="/" className="boton">Volver al inicio</Link>
      </section>
    </main>
  );
};

export default NoEncontrada;
