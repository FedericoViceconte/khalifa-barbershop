const Galeria = (props) => {
    return (
        <main className="main">

    <div className="container-slider">
        <ul className="slider">
            <li id="slide1">
                <img src="img/afeitado.png" alt="Afeitado clásico" />
            </li>
            <li id="slide2">
                <img src="img/polo.png" alt="Poste de barbería" />
            </li>
            <li id="slide3">
                <img src="img/tijera.png" alt="Tijeras de barbería" />
            </li>
        </ul>
        <ul className="menu">
            <li>
                <a href="#slide1">1</a>
            </li>
            <li>
                <a href="#slide2">2</a>
            </li>
            <li>
                <a href="#slide3">3</a>
            </li>


        </ul>
    </div>



</main>

    );
}
export default Galeria;
