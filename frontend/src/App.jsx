import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import Inicio from './pages/Inicio';
import Galeria from './pages/Galeria';
import Productos from './pages/Productos';
import Ubicacion from './pages/Ubicacion';
import Contacto from './pages/Contacto';
import NoEncontrada from './pages/NoEncontrada';
import { isDemo } from './api';

function App() {
  return (
    <div className="App">
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Header />
        {isDemo() && (
          <p className="aviso-demo" role="note">
            Demo sin servidor: las novedades son de ejemplo y el formulario no envía correos.
          </p>
        )}
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ubicacion" element={<Ubicacion />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App;
