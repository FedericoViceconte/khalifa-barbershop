import { Link } from 'react-router-dom';
import { SERVICIOS, ANTICIPACION_MINIMA, DIAS_DE_RESERVA } from '../../../shared/agenda.mjs';
import ServicioCard from '../components/ServicioCard';
import Icono from '../components/Icono';
import { HORARIO_TEXTO } from '../datos';
import { useTitulo } from '../formato';

const Servicios = () => {
  useTitulo('Servicios y precios');
  return (
    <main id="contenido" className="pagina">
      <header className="contenedor cabecera-pagina">
        <p className="sobretitulo">Servicios</p>
        <h1>Servicios y precios</h1>
        <p>
          Trabajamos con turnos para darle a cada cliente el tiempo y el asesoramiento que necesita. Los precios son de
          ejemplo y se abonan en el local.
        </p>
      </header>

      <section className="contenedor rejilla-servicios" aria-label="Servicios">
        {SERVICIOS.map((servicio) => (
          <ServicioCard key={servicio.id} servicio={servicio} detallada />
        ))}
      </section>

      <section className="contenedor seccion" aria-labelledby="titulo-como">
        <h2 id="titulo-como" className="titulo-seccion">Cómo funcionan los turnos</h2>
        <ol className="pasos">
          <li>
            <Icono nombre="calendario" />
            <h3>Elegí día y horario</h3>
            <p>Atendemos {HORARIO_TEXTO.toLowerCase()}. Podés reservar con hasta {DIAS_DE_RESERVA} días de anticipación.</p>
          </li>
          <li>
            <Icono nombre="ticket" />
            <h3>Guardá tu código</h3>
            <p>Al confirmar recibís un código de seis caracteres para consultar o cancelar el turno.</p>
          </li>
          <li>
            <Icono nombre="reloj" />
            <h3>Cancelá a tiempo</h3>
            <p>Podés cancelar desde la web hasta {ANTICIPACION_MINIMA} minutos antes. Si se te hace tarde, avisanos.</p>
          </li>
        </ol>
        <Link to="/reservar" className="boton boton-primario">
          Reservar turno <Icono nombre="flecha" medida={18} />
        </Link>
      </section>
    </main>
  );
};

export default Servicios;
