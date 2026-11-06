import { useEffect, useRef, useState } from 'react';
import Icono from '../components/Icono';
import { galeria } from '../datos';
import { useTitulo } from '../formato';

const Galeria = () => {
  useTitulo('Galería');
  const [actual, setActual] = useState(null);
  const dialogo = useRef(null);

  useEffect(() => {
    const ventana = dialogo.current;
    if (!ventana) return;
    if (actual !== null && !ventana.open) ventana.showModal?.();
    if (actual === null && ventana.open) ventana.close?.();
  }, [actual]);

  const mover = (paso) => setActual((indice) => (indice + paso + galeria.length) % galeria.length);

  const teclas = (e) => {
    if (e.key === 'ArrowRight') mover(1);
    if (e.key === 'ArrowLeft') mover(-1);
  };

  const foto = actual !== null ? galeria[actual] : null;

  return (
    <main id="contenido" className="pagina">
      <header className="contenedor cabecera-pagina">
        <p className="sobretitulo">Galería</p>
        <h1>Herramientas del oficio</h1>
        <p>El mobiliario y las herramientas con los que trabajamos. Tocá una imagen para verla en grande.</p>
      </header>

      <ul className="contenedor rejilla-galeria">
        {galeria.map((item, indice) => (
          <li key={item.imagen}>
            <button type="button" className="foto" onClick={() => setActual(indice)} aria-label={`Ampliar: ${item.titulo}`}>
              <img src={item.imagen} alt={item.detalle} loading="lazy" width="412" height="412" />
              <span className="foto-titulo">{item.titulo}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog ref={dialogo} className="visor" aria-label={foto ? foto.titulo : 'Imagen ampliada'} onClose={() => setActual(null)} onKeyDown={teclas}>
        {foto && (
          <figure>
            <img src={foto.imagen} alt={foto.detalle} />
            <figcaption>
              <strong>{foto.titulo}</strong> · {foto.detalle}
              <span className="tenue"> ({actual + 1} de {galeria.length})</span>
            </figcaption>
          </figure>
        )}
        <div className="visor-controles">
          <button type="button" className="boton-icono" onClick={() => mover(-1)} aria-label="Imagen anterior">
            <Icono nombre="volver" />
          </button>
          <button type="button" className="boton-icono" onClick={() => mover(1)} aria-label="Imagen siguiente">
            <Icono nombre="flecha" />
          </button>
          <button type="button" className="boton-icono" onClick={() => setActual(null)} aria-label="Cerrar" autoFocus>
            <Icono nombre="cerrar" />
          </button>
        </div>
      </dialog>
    </main>
  );
};

export default Galeria;
