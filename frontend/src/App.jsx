import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

import Inicio from './pages/Inicio'
import Galeria from './pages/Galeria'
import Productos from './pages/Productos'
import Ubicacion from './pages/Ubicacion'
import Contacto from './pages/Contacto'




function App() {
  return (
    <div className="App">


      <BrowserRouter>
        <Header></Header>

      <Routes>
      <Route path='/' element={<Inicio/>} />
      <Route path='Inicio' element={<Inicio/>} />
      <Route path='Galeria' element={<Galeria/>} />
      <Route path='Productos' element={<Productos/>} />
      <Route path='Ubicacion' element={<Ubicacion/>} />
      <Route path='Contacto' element={<Contacto/>} />
      </Routes>
      </BrowserRouter>
      <Footer> </Footer>
    </div>
  );
}

export default App;
