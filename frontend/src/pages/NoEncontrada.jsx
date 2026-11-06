import { Link } from 'react-router-dom';
import { asset } from '../asset';
import { useTitulo } from '../formato';

const NoEncontrada = () => {
  useTitulo('Página no encontrada');
  return (
    <main id="contenido" className="pagina">
      <section className="contenedor no-encontrada">
        <img src={asset('img/logo.png')} alt="" width="120" height="120" />
        <p className="sobretitulo">Error 404</p>
        <h1>Página no encontrada</h1>
        <p>La dirección que buscás no existe o cambió de lugar.</p>
        <div className="botones">
          <Link to="/" className="boton boton-primario">Volver al inicio</Link>
          <Link to="/reservar" className="boton boton-secundario">Reservar turno</Link>
        </div>
      </section>
    </main>
  );
};

export default NoEncontrada;
