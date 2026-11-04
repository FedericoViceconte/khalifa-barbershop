const fotos = [
  ['/img/sillon.png', 'Sillón de barbería'],
  ['/img/espejo.png', 'Espejo de barbería'],
  ['/img/tijeraa.png', 'Tijera profesional']
];

const Galeria = () => {
  return (
    <main className="main">
      <div className="container-slider">
        <ul className="slider">
          {fotos.map(([imagen, descripcion], i) => (
            <li id={`slide${i + 1}`} key={imagen}>
              <img src={imagen} alt={descripcion} />
            </li>
          ))}
        </ul>
        <ul className="menu" aria-label="Elegir imagen">
          {fotos.map(([imagen, descripcion], i) => (
            <li key={imagen}><a href={`#slide${i + 1}`} aria-label={descripcion}>{i + 1}</a></li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default Galeria;
