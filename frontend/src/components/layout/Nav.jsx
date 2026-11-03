import { Link } from "react-router-dom";

const Nav = (props) => {
    return (

        <nav className="navigation">
        <ul>
       <li> <Link to="/inicio">Inicio</Link></li>
       <li> <Link to="/galeria">Galeria</Link></li>
       <li> <Link to="/productos">Productos</Link></li>
       <li> <Link to="/ubicacion">Ubicacion</Link></li>
       <li> <Link to="/contacto">Contacto</Link></li>
        </ul>
    </nav>

    );
}
export default Nav;
