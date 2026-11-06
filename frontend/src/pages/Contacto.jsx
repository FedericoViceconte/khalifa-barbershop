import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icono from '../components/Icono';
import { enviarContacto } from '../api';
import { DIRECCION, HORARIO_TEXTO } from '../datos';
import { useTitulo } from '../formato';

const initialForm = { nombre: '', email: '', mensaje: '' };

const Contacto = () => {
  useTitulo('Contacto');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [formData, setFormData] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((oldData) => ({ ...oldData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ tipo: '', texto: '' });
    setSending(true);
    try {
      setMsg({ tipo: 'exito', texto: (await enviarContacto(formData)).message });
      setFormData(initialForm);
    } catch (error) {
      setMsg({ tipo: 'error', texto: error.response?.data?.message || 'No se pudo enviar el mensaje.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <main id="contenido" className="pagina">
      <header className="contenedor cabecera-pagina">
        <p className="sobretitulo">Contacto</p>
        <h1>Contactanos</h1>
        <p>¿Necesitás hablar con nosotros? Completá el formulario y te respondemos a la brevedad.</p>
      </header>

      <div className="contenedor contacto">
        <form className="tarjeta formulario" onSubmit={handleSubmit}>
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" type="text" name="nombre" value={formData.nombre} onChange={handleChange}
            maxLength={120} autoComplete="name" required />
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" name="email" value={formData.email} onChange={handleChange}
            maxLength={254} autoComplete="email" required />
          <label htmlFor="mensaje">Mensaje</label>
          <textarea id="mensaje" name="mensaje" value={formData.mensaje} onChange={handleChange}
            maxLength={3000} rows={6} required />
          <button type="submit" disabled={sending} className="boton boton-primario">
            {sending ? 'Enviando…' : 'Enviar mensaje'}
          </button>
          <p className={`estado ${msg.tipo ? `mensaje-${msg.tipo}` : ''}`} role="status" aria-live="polite">{msg.texto}</p>
        </form>

        <aside className="contacto-datos">
          <div className="tarjeta">
            <Icono nombre="calendario" />
            <h2>¿Querés un turno?</h2>
            <p>No hace falta escribirnos: reservalo online y elegí el horario que te quede cómodo.</p>
            <Link to="/reservar" className="enlace-flecha">Reservar turno <Icono nombre="flecha" medida={16} /></Link>
          </div>
          <div className="tarjeta">
            <Icono nombre="ubicacion" />
            <h2>Visitanos</h2>
            <p>{DIRECCION}<br />{HORARIO_TEXTO}</p>
            <Link to="/ubicacion" className="enlace-flecha">Ver el mapa <Icono nombre="flecha" medida={16} /></Link>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Contacto;
