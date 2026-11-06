import { Link } from 'react-router-dom';
import Icono from '../components/Icono';
import { COMO_LLEGAR, DIRECCION, MAPA } from '../datos';
import { useTitulo } from '../formato';

const DIAS = [
  ['Lunes', 'Cerrado'],
  ['Martes a viernes', '10 a 20 h'],
  ['Sábados', '10 a 20 h'],
  ['Domingos', 'Cerrado']
];

const Ubicacion = () => {
  useTitulo('Ubicación y horarios');
  return (
    <main id="contenido" className="pagina">
      <header className="contenedor cabecera-pagina">
        <p className="sobretitulo">Ubicación</p>
        <h1>Dónde encontrarnos</h1>
      </header>

      <div className="contenedor ubicacion">
        <div className="mapa">
          <iframe title="Mapa de Ciudad Evita" src={MAPA} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <aside className="tarjeta datos-local">
          <h2><Icono nombre="ubicacion" /> Dirección</h2>
          <p>{DIRECCION}</p>
          <a className="enlace-flecha" href={COMO_LLEGAR} target="_blank" rel="noopener noreferrer">
            Cómo llegar <Icono nombre="flecha" medida={16} />
          </a>
          <h2><Icono nombre="reloj" /> Horarios</h2>
          <table className="tabla-horarios">
            <tbody>
              {DIAS.map(([dia, horario]) => (
                <tr key={dia}>
                  <th scope="row">{dia}</th>
                  <td className={horario === 'Cerrado' ? 'tenue' : ''}>{horario}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/reservar" className="boton boton-primario">
            Reservar turno
          </Link>
        </aside>
      </div>
    </main>
  );
};

export default Ubicacion;
