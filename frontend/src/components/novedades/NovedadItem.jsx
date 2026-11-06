import { fechaConAnio } from '../../formato';

const NovedadItem = ({ titulo, subtitulo, imagen, cuerpo, fecha }) => (
  <article className="tarjeta novedad">
    {imagen && <img src={imagen} alt="" loading="lazy" />}
    <div className="novedad-texto">
      {fecha && <time dateTime={fecha}>{fechaConAnio(fecha)}</time>}
      <h3>{titulo}</h3>
      <p className="novedad-subtitulo">{subtitulo}</p>
      <p>{cuerpo}</p>
    </div>
  </article>
);

export default NovedadItem;
