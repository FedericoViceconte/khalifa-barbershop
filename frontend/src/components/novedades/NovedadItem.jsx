const NovedadItem = ({ titulo, subtitulo, imagen, cuerpo }) => {
  return (
    <article className="novedad">
      <h3>{titulo}</h3>
      <h4>{subtitulo}</h4>
      {imagen && <img src={imagen} alt={titulo} />}
      <p>{cuerpo}</p>
    </article>
  );
};

export default NovedadItem;
