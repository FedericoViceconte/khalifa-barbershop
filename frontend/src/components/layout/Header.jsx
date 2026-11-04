import { Link } from 'react-router-dom';
import Nav from './Nav';
import { asset } from '../../asset';

const Header = () => {
  return (
    <header className="header">
      <div className="container logo-nav-container">
        <Link to="/" className="logo">
          <img src={asset('img/logo.png')} alt="Khalifa Barbershop · Inicio" width="100" height="100" />
        </Link>
        <Nav />
      </div>
    </header>
  );
};

export default Header;
