import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { precioConDescuento } from '../../../shared/agenda.mjs';
import { productos } from '../datos';
import { pesos, useTitulo } from '../formato';

export { productos };

const CATEGORIAS = ['Todos', ...new Set(productos.map(({ categoria }) => categoria))];
const ORDENES = {
  destacados: { nombre: 'Destacados', comparar: () => 0 },
  menor: { nombre: 'Menor precio', comparar: (a, b) => a.final - b.final },
  mayor: { nombre: 'Mayor precio', comparar: (a, b) => b.final - a.final },
  descuento: { nombre: 'Mayor descuento', comparar: (a, b) => b.descuento - a.descuento }
};

const Productos = () => {
  useTitulo('Productos');
  const [categoria, setCategoria] = useState('Todos');
  const [orden, setOrden] = useState('destacados');

  const lista = useMemo(
    () =>
      productos
        .map((producto) => ({ ...producto, final: precioConDescuento(producto.precio, producto.descuento) }))
        .filter((producto) => categoria === 'Todos' || producto.categoria === categoria)
        .sort(ORDENES[orden].comparar),
    [categoria, orden]
  );

  return (
    <main id="contenido" className="pagina">
      <header className="contenedor cabecera-pagina">
        <p className="sobretitulo">Tienda</p>
        <h1>Nuestros productos</h1>
        <p>Herramientas y mobiliario profesional. Consultanos por stock y formas de pago.</p>
      </header>

      <div className="contenedor filtros">
        <div className="chips" role="group" aria-label="Filtrar por categoría">
          {CATEGORIAS.map((nombre) => (
            <button key={nombre} type="button" className="chip" aria-pressed={categoria === nombre} onClick={() => setCategoria(nombre)}>
              {nombre}
            </button>
          ))}
        </div>
        <label className="orden">
          Ordenar por
          <select value={orden} onChange={(e) => setOrden(e.target.value)}>
            {Object.entries(ORDENES).map(([clave, { nombre }]) => (
              <option key={clave} value={clave}>{nombre}</option>
            ))}
          </select>
        </label>
      </div>

      <section className="contenedor rejilla-productos" aria-label="Productos" aria-live="polite">
        {lista.map(({ nombre, imagen, precio, descuento, estrellas, final, categoria: rubro }) => (
          <article className="tarjeta producto" key={nombre}>
            <div className="producto-imagen">
              <img src={imagen} alt={nombre} loading="lazy" width="412" height="412" />
              <span className="producto-descuento">−{descuento}%</span>
            </div>
            <div className="producto-info">
              <p className="producto-rubro">{rubro}</p>
              <h2>{nombre}</h2>
              <span className="valoracion" role="img" aria-label={`${estrellas} de 5 estrellas`}>
                {'★'.repeat(estrellas)}
                <span className="valoracion-vacia">{'★'.repeat(5 - estrellas)}</span>
              </span>
              <p className="producto-precio">
                <strong>{pesos(final)}</strong>
                <s aria-label={`Antes ${pesos(precio)}`}>{pesos(precio)}</s>
              </p>
              <Link to="/contacto" className="boton boton-secundario boton-chico">
                Consultar
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Productos;
