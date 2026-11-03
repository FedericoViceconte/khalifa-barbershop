const Productos = (props) => {
    return (
        <main className="main">


      <section className="shop">
        <h2>NUESTROS PRODUCTOS</h2>
          <div className="card estilo-c">
            <a href="#">
              <div className="img-container">
                <img src="img/patillera.png" alt="producto 1"/>
                <span className="promo">25% de descuento</span>
              </div>
             </a>
            <div className="info-container">
              <h3>Patillera Babyliss</h3>
              <strong>$20.000</strong>
              <span className="rating">★★★★☆</span>
              <a href="#" className="add-cart">Añadir al carrito</a>
            </div>
          </div>
          <div className="card estilo-c">
            <a href="#">
              <div className="img-container">
                <img src="img/espejo.png" alt="producto 1"/>
                <span className="promo">15% de descuento</span>
              </div>
              </a>
            <div className="info-container">
              <h3>Espejo Barberia</h3>
              <strong>$3.080</strong>
              <span className="rating">★★★☆☆</span>
              <a href="#" className="add-cart">Añadir al carrito</a>
            </div>
          </div>
          <div className="card estilo-c">
            <a href="#">
              <div className="img-container">
                <img src="img/tijeraa.png" alt="producto 1"/>
                <span className="promo">36% de descuento</span>
              </div>
              </a>
            <div className="info-container">
              <h3>Tijera Profesional</h3>
              <strong>$5.820</strong>
              <span className="rating">★★★★★</span>
              <a href="#" className="add-cart">Añadir al carrito</a>
            </div>
          </div>
          <div className="card estilo-c">
            <a href="#">
              <div className="img-container">
                <img src="img/sillon.png" alt="producto 1"/>
                <span className="promo">45% de descuento</span>
              </div>
             </a>
            <div className="info-container">
              <h3>Sillon Barberia</h3>
              <strong>$60.700</strong>
              <span className="rating">★★★★☆</span>
              <a href="#" className="add-cart">Añadir al carrito</a>
            </div>
          </div>
          <div className="card estilo-c">
            <a href="#">
              <div className="img-container">
                <img src="img/secador.png" alt="producto 1"/>
                <span className="promo">10% de descuento</span>
              </div>
              </a>
            <div className="info-container">
              <h3>Secador de Pelo</h3>
              <strong>$4.950</strong>
              <span className="rating">★★★☆☆</span>
              <a href="#" className="add-cart">Añadir al carrito</a>
            </div>
          </div>
          <div className="card estilo-c">
            <a href="#">
              <div className="img-container">
                <img src="img/set.png" alt="producto 1"/>
                <span className="promo">30% de descuento</span>
              </div>
              </a>
            <div className="info-container">
              <h3>Set barbero Profesional</h3>
              <strong>$2.120</strong>
              <span className="rating">★★★★★</span>
              <a href="#" className="add-cart">Añadir al carrito</a>
            </div>
            </div>
      </section>




</main>

    );
}
export default Productos;
