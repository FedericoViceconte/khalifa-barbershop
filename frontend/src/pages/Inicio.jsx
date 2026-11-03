import { useState, useEffect } from "react";
import axios from 'axios';
import NovedadItem from "../components/novedades/NovedadItem";


const Inicio = (props) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [novedades, setNovedades] = useState([]);

    useEffect(() => {
        const cargarNovedades = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/novedades');
                setNovedades(response.data);
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
                    <div><img src="img/logo.png" alt="Khalifa Barbershop" width="180" height="180" /></div>
                    <p>Khalifabarbershop abrió sus puertas el 26 de junio de 2021.

                        El concepto desde aquel entonces hasta ahora, ha ido migrando año tras año, lo cual hace que hoy en dia se destaque como peluquería y barbería clásica tradicional de los años 20.

                        Se caracteriza por sus afeitados clásicos a navaja con toallas calientes y frias como asi también por sus arreglos de barbas , cortes de estilo europeo y estar siempre a la vanguardia sobre las nuevas tendencias masculinas.

                        Khalifabarbershop no es simplemente un corte de cabello.
                        #noessolouncorte #peluqueriaatr</p>


                </section>
            </div>

            <section className="servicios">
                <div className="servicios">
                    <h2 className="servicios_titulo">SERVICIOS</h2>
                    <div className="parrafos">
                        <p>En Khalifabarbershop trabajamos con citas para brindar el tiempo y asesoramiento necesario a cada <br /> cliente las cuales pueden ser solicitadas telefónicamente o atraves de la aplicación Booksy (IOS y Android).</p>
                        <h3><img src="img/silla.png" alt="silla" />CORTE DE CABELLO</h3>
                        <p>Corte de cabello  premium con terminaciones a navaja.</p>
                        <h3> <img src="img/tijera.png" alt="tijera" height="32px" width="32px" /> ARREGLO DE BARBA</h3>
                        <p>Arreglo de barba con fomento caliente y frío. Terminaciones a navaja y productos para el cuidado de tu piel y barba.</p>
                        <h3> <img src="img/afeitado.png" alt="afeitado" /> AFEITADO ITALIANO (CLÁSICO)</h3>
                        <p>Afeitado italiano con dos toallas caliente, una fría, aceites aromáticos y productos para el cuidado de la piel.</p>
                    </div>
                </div>
            </section>

            <section className="novedades">
                <div className="novedades">
                    <h2 className="novedades_titulo">STAFF</h2>
                    <div className="novedades_parrafos">
                        <p>En Khalifabarbershop trabajamos con profesionales! <br /> Conoce nuestro equipo y enterate de las ultimas noticias!</p>
                        <h3>Barbería clásica</h3>
                        <p>Barbero desde el 2018, Exelente profesional y con dominio en cortes con navaja.</p>
                        <h3>Cortes modernos</h3>
                        <p>Profesional desde el 2015, domina cortes modernos.</p>

                        <h3>ULTIMAS NOVEDADES</h3>


                        <section className="Holder">
                            <h2>No te pierdas esta seccion con las ultimas actualizaciones:</h2>
                            {
                                loading ? (
                                    <p>Cargando...</p>
                                ) : error ? (
                                    <p>No se pudieron cargar las novedades.</p>
                                ) : (
                                    novedades.map(item => <NovedadItem key={item.id}
                                        tittle={item.titulo} subtitle={item.subtitulo}
                                        imagen={item.imagen} body={item.cuerpo} />)
                                )
                            }
                        </section>


                    </div>
                </div>
            </section>

        </main>


    );
}
export default Inicio;
