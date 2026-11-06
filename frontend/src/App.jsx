import './App.css';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import Inicio from './pages/Inicio';
import Servicios from './pages/Servicios';
import Reservar from './pages/Reservar';
import MiTurno from './pages/MiTurno';
import Galeria from './pages/Galeria';
import Productos from './pages/Productos';
import Ubicacion from './pages/Ubicacion';
import Contacto from './pages/Contacto';
import NoEncontrada from './pages/NoEncontrada';
import { isDemo } from './api';

// Al cambiar de página se vuelve arriba, salvo que el enlace apunte a una sección (#).
function AlCambiarDePagina() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AlCambiarDePagina />
      <a className="saltar" href="#contenido">Saltar al contenido</a>
      <Header />
      {isDemo() && (
        <p className="aviso-demo" role="note">
          Demo sin servidor: las novedades son de ejemplo, la agenda es simulada y el formulario no envía correos.
        </p>
      )}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/reservar" element={<Reservar />} />
        <Route path="/mi-turno" element={<MiTurno />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/ubicacion" element={<Ubicacion />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
