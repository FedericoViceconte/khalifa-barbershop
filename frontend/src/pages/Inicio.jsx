import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SERVICIOS, BARBEROS } from '../../../shared/agenda.mjs';
import NovedadItem from '../components/novedades/NovedadItem';
import ServicioCard from '../components/ServicioCard';
import Icono from '../components/Icono';
import { getNovedades } from '../api';
import { asset } from '../asset';
import { DIRECCION, HORARIO_TEXTO } from '../datos';
import { useTitulo } from '../formato';

const Inicio = () => {
  useTitulo('');
  const [estado, setEstado] = useState({ cargando: true, error: false, novedades: [] });

  useEffect(() => {
    let vigente = true;
    getNovedades()
      .then((novedades) => vigente && setEstado({ cargando: false, error: false, novedades }))
      .catch(() => vigente && setEstado({ cargando: false, error: true, novedades: [] }));
    return () => {
      vigente = false;
    };
  }, []);

  return (
    <main id="contenido">
      <section className="portada">
        <div className="contenedor portada-rejilla">
          <div className="portada-texto">
            <p className="sobretitulo">Barbería clásica · Ciudad Evita</p>
            <h1>
              No es solo <em>un corte.</em>
            </h1>
            <p className="portada-bajada">
              Cortes de estilo europeo, arreglos de barba y afeitados a navaja con toallas calientes, en una barbería
              inspirada en los años 20.
            </p>
            <div className="botones">
              <Link to="/reservar" className="boton boton-primario">
                Reservar turno <Icono nombre="flecha" medida={18} />
              </Link>
              <Link to="/servicios" className="boton boton-secundario">
                Ver servicios y precios
              </Link>
            </div>
            <dl className="datos-rapidos">
              <div>
                <dt>Desde</dt>
                <dd>2021</dd>
              </div>
              <div>
                <dt>Horario</dt>
                <dd>Mar a sáb · 10 a 20 h</dd>
              </div>
              <div>
                <dt>Reservas</dt>
                <dd>Online, en un minuto</dd>
              </div>
            </dl>
          </div>
          <div className="portada-logo">
            <img src={asset('img/logo.png')} alt="Logo de Khalifa Barbershop" width="420" height="420" fetchpriority="high" />
          </div>
        </div>
      </section>

      <section className="seccion contenedor historia" aria-labelledby="titulo-historia">
        <p className="sobretitulo">La barbería</p>
        <h2 id="titulo-historia" className="titulo-seccion">Tradición con mirada actual</h2>
        <div className="historia-texto">
          <p>
            Khalifa Barbershop abrió sus puertas el 26 de junio de 2021. Desde entonces su concepto fue cambiando año tras
            año, y hoy se destaca como peluquería y barbería clásica, inspirada en los años 20.
          </p>
          <p>
            Se caracteriza por sus afeitados clásicos a navaja con toallas calientes y frías, sus arreglos de barba, los
            cortes de estilo europeo y por estar siempre a la vanguardia de las nuevas tendencias masculinas.
          </p>
        </div>
      </section>

      <section className="seccion seccion-alterna" aria-labelledby="titulo-servicios">
        <div className="contenedor">
          <div className="encabezado-seccion">
            <div>
              <p className="sobretitulo">Servicios</p>
              <h2 id="titulo-servicios" className="titulo-seccion">Elegí tu servicio</h2>
            </div>
            <Link to="/servicios" className="enlace-flecha">
              Todos los detalles <Icono nombre="flecha" medida={16} />
            </Link>
          </div>
          <div className="rejilla-servicios">
            {SERVICIOS.map((servicio) => (
              <ServicioCard key={servicio.id} servicio={servicio} />
            ))}
          </div>
        </div>
      </section>

      <section className="seccion contenedor" aria-labelledby="titulo-equipo">
        <p className="sobretitulo">Staff</p>
        <h2 id="titulo-equipo" className="titulo-seccion">Profesionales de la navaja y la tijera</h2>
        <div className="rejilla-equipo">
          {BARBEROS.map((barbero) => (
            <article className="tarjeta barbero" key={barbero.id}>
              <span className="barbero-icono" aria-hidden="true">
                <Icono nombre={barbero.id === 'clasica' ? 'afeitado' : 'corte'} medida={26} />
              </span>
              <div>
                <h3>{barbero.nombre}</h3>
                <p>{barbero.detalle}</p>
                <Link to={`/reservar?barbero=${barbero.id}`} className="enlace-flecha">
                  Reservar con este barbero <Icono nombre="flecha" medida={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="seccion seccion-alterna" aria-labelledby="titulo-novedades">
        <div className="contenedor">
          <p className="sobretitulo">Novedades</p>
          <h2 id="titulo-novedades" className="titulo-seccion">Últimas novedades</h2>
          <div aria-live="polite">
            {estado.cargando ? (
              <p className="tenue">Cargando…</p>
            ) : estado.error ? (
              <p className="tenue">No se pudieron cargar las novedades.</p>
            ) : estado.novedades.length === 0 ? (
              <p className="tenue">Todavía no hay novedades publicadas.</p>
            ) : (
              <div className="rejilla-novedades">
                {estado.novedades.map((item) => (
                  <NovedadItem key={item.id} {...item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="seccion contenedor">
        <div className="llamado">
          <div>
            <h2>Reservá tu próximo turno</h2>
            <p>
              Elegí servicio, barbero y horario. Te damos un código para consultar o cancelar cuando quieras.
            </p>
            <p className="llamado-datos">
              <span><Icono nombre="ubicacion" medida={18} /> {DIRECCION}</span>
              <span><Icono nombre="reloj" medida={18} /> {HORARIO_TEXTO}</span>
            </p>
          </div>
          <Link to="/reservar" className="boton boton-primario">
            Reservar ahora <Icono nombre="flecha" medida={18} />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Inicio;
