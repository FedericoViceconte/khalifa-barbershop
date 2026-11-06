import { Link } from 'react-router-dom';
import { asset } from '../../asset';
import { DIRECCION, HORARIO_TEXTO } from '../../datos';
import { secciones } from './Header';
import Icono from '../Icono';
import { isDemo } from '../../api';

const Footer = () => (
  <footer className="pie">
    <div className="contenedor pie-rejilla">
      <div className="pie-marca">
        <img src={asset('img/logo.png')} alt="" width="64" height="64" loading="lazy" />
        <p>
          Barbería clásica inspirada en los años 20. Cortes, barbas y afeitados a navaja desde 2021.
          <br />
          <strong>#noessolouncorte</strong>
        </p>
      </div>
      <div>
        <h2>Visitanos</h2>
        <p className="pie-dato">
          <Icono nombre="ubicacion" medida={18} /> {DIRECCION}
        </p>
        <p className="pie-dato">
          <Icono nombre="reloj" medida={18} /> {HORARIO_TEXTO}
        </p>
      </div>
      <nav aria-label="Enlaces del pie">
        <h2>Secciones</h2>
        <ul>
          <li><Link to="/reservar">Reservar turno</Link></li>
          <li><Link to="/mi-turno">Consultar o cancelar un turno</Link></li>
          {secciones.map(([ruta, nombre]) => (
            <li key={ruta}><Link to={ruta}>{nombre}</Link></li>
          ))}
        </ul>
      </nav>
    </div>
    <div className="contenedor pie-final">
      <p>&copy; 2022–{new Date().getFullYear()} Khalifa Barbershop · Proyecto académico</p>
      {!isDemo() && <a href="/admin/login">Acceso para el equipo</a>}
    </div>
  </footer>
);

export default Footer;
