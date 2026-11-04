import { NavLink } from 'react-router-dom';

const secciones = [
  ['/inicio', 'Inicio'],
  ['/galeria', 'Galería'],
  ['/productos', 'Productos'],
  ['/ubicacion', 'Ubicación'],
  ['/contacto', 'Contacto']
];

const Nav = () => {
  return (
    <nav className="navigation" aria-label="Secciones del sitio">
      <ul>
        {secciones.map(([ruta, nombre]) => (
          <li key={ruta}><NavLink to={ruta}>{nombre}</NavLink></li>
        ))}
      </ul>
    </nav>
  );
};

export default Nav;
