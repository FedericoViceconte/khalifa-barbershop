import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { asset } from '../../asset';
import Icono from '../Icono';

export const secciones = [
  ['/servicios', 'Servicios'],
  ['/galeria', 'Galería'],
  ['/productos', 'Productos'],
  ['/ubicacion', 'Ubicación'],
  ['/contacto', 'Contacto']
];

const Header = () => {
  const [abierto, setAbierto] = useState(false);
  const [conFondo, setConFondo] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setAbierto(false), [pathname]);

  useEffect(() => {
    const actualizar = () => setConFondo(window.scrollY > 12);
    actualizar();
    window.addEventListener('scroll', actualizar, { passive: true });
    return () => window.removeEventListener('scroll', actualizar);
  }, []);

  useEffect(() => {
    if (!abierto) return undefined;
    const cerrar = (event) => event.key === 'Escape' && setAbierto(false);
    document.addEventListener('keydown', cerrar);
    return () => document.removeEventListener('keydown', cerrar);
  }, [abierto]);

  return (
    <header className={`encabezado${conFondo || abierto ? ' con-fondo' : ''}`}>
      <div className="contenedor encabezado-fila">
        <Link to="/" className="marca" aria-label="Khalifa Barbershop · Inicio">
          <img src={asset('img/logo.png')} alt="" width="44" height="44" />
          <span>
            Khalifa <small>Barbershop</small>
          </span>
        </Link>

        <button
          type="button"
          className="boton-menu"
          aria-expanded={abierto}
          aria-controls="navegacion"
          aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
          onClick={() => setAbierto((valor) => !valor)}
        >
          <Icono nombre={abierto ? 'cerrar' : 'menu'} />
        </button>

        <nav id="navegacion" className={`navegacion${abierto ? ' abierta' : ''}`} aria-label="Secciones del sitio">
          <ul>
            {secciones.map(([ruta, nombre]) => (
              <li key={ruta}>
                <NavLink to={ruta}>{nombre}</NavLink>
              </li>
            ))}
            <li className="nav-turno">
              <NavLink to="/mi-turno">Mi turno</NavLink>
            </li>
          </ul>
          <Link to="/reservar" className="boton boton-primario boton-chico">
            Reservar turno
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
