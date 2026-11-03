import { Link } from 'react-router-dom';
import Nav from './Nav';

const Header = (props) => {
  return (

    <header className="header">
      <div className="container logo-nav-container">
        <Link to="/" className="logo"> <img src="img/logo.png" alt="logo" width="100px" height="100px" />
       </Link>
        <Nav />
      </div>

    </header>
  );
}
export default Header;
