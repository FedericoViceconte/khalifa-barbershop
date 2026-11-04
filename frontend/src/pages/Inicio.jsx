import { useState, useEffect } from 'react';
import NovedadItem from '../components/novedades/NovedadItem';
import { getNovedades } from '../api';
import { asset } from '../asset';

const servicios = [
  [asset('img/silla.png'), 'Corte de cabello', 'Corte de cabello premium con terminaciones a navaja.'],
  [asset('img/tijera.png'), 'Arreglo de barba', 'Arreglo de barba con fomento caliente y frío. Terminaciones a navaja y productos para el cuidado de tu piel y barba.'],
  [asset('img/afeitado.png'), 'Afeitado italiano (clásico)', 'Afeitado italiano con dos toallas calientes, una fría, aceites aromáticos y productos para el cuidado de la piel.']
];

const Inicio = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [novedades, setNovedades] = useState([]);

  useEffect(() => {
    const cargarNovedades = async () => {
      setLoading(true);
      try {
        setNovedades(await getNovedades());
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    cargarNovedades();
  }, []);

  return (
    <main className="main">
      <div className="container">
        <section className="barberia">
          <h1>LA BARBERÍA</h1>
          <img src={asset('img/logo.png')} alt="Logo de Khalifa Barbershop" width="180" height="180" />
          <p>
            Khalifa Barbershop abrió sus puertas el 26 de junio de 2021. Desde entonces su concepto fue
            cambiando año tras año, y hoy se destaca como peluquería y barbería clásica, inspirada en los
            años 20.
          </p>
          <p>
            Se caracteriza por sus afeitados clásicos a navaja con toallas calientes y frías, sus arreglos
            de barba, los cortes de estilo europeo y por estar siempre a la vanguardia de las nuevas
            tendencias masculinas. Khalifa Barbershop no es simplemente un corte de cabello.
            #noessolouncorte
          </p>
        </section>
      </div>

      <section className="servicios">
        <h2 className="servicios_titulo">SERVICIOS</h2>
        <div className="parrafos">
          <p>
            Trabajamos con turnos para darle a cada cliente el tiempo y el asesoramiento que necesita.
            Podés pedirlos por teléfono o a través de la aplicación Booksy (iOS y Android).
          </p>
          {servicios.map(([icono, nombre, descripcion]) => (
            <div className="servicio" key={nombre}>
              <h3><img src={icono} alt="" width="32" height="32" /> {nombre.toUpperCase()}</h3>
              <p>{descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="novedades">
        <h2 className="novedades_titulo">STAFF</h2>
        <div className="novedades_parrafos">
          <p>Trabajamos con profesionales. Conocé a nuestro equipo y enterate de las últimas noticias.</p>
          <h3>Barbería clásica</h3>
          <p>Barbero desde 2018, excelente profesional y con dominio de los cortes a navaja.</p>
          <h3>Cortes modernos</h3>
          <p>Profesional desde 2015, especialista en cortes modernos.</p>

          <section className="holder" aria-live="polite">
            <h2>Últimas novedades</h2>
            {loading ? (
              <p>Cargando…</p>
            ) : error ? (
              <p>No se pudieron cargar las novedades.</p>
            ) : novedades.length === 0 ? (
              <p>Todavía no hay novedades publicadas.</p>
            ) : (
              novedades.map((item) => (
                <NovedadItem
                  key={item.id}
                  titulo={item.titulo}
                  subtitulo={item.subtitulo}
                  imagen={item.imagen}
                  cuerpo={item.cuerpo}
                />
              ))
            )}
          </section>
        </div>
      </section>
    </main>
  );
};

export default Inicio;
