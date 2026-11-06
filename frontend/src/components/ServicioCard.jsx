import { Link } from 'react-router-dom';
import Icono from './Icono';
import { pesos } from '../formato';

const ServicioCard = ({ servicio, detallada = false }) => (
  <article className={`tarjeta servicio${detallada ? ' servicio-detallada' : ''}`}>
    <span className="servicio-icono" aria-hidden="true">
      <Icono nombre={servicio.id} medida={26} />
    </span>
    <h3>{servicio.nombre}</h3>
    <p>{servicio.descripcion}</p>
    <div className="servicio-pie">
      <span className="servicio-precio">{pesos(servicio.precio)}</span>
      <span className="servicio-duracion">
        <Icono nombre="reloj" medida={16} /> {servicio.duracion} min
      </span>
    </div>
    <Link to={`/reservar?servicio=${servicio.id}`} className="boton boton-secundario boton-chico" aria-label={`Reservar ${servicio.nombre}`}>
      Reservar
    </Link>
  </article>
);

export default ServicioCard;
