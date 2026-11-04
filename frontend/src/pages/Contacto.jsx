import { useState } from 'react';
import { enviarContacto } from '../api';

const initialForm = { nombre: '', email: '', mensaje: '' };

const Contacto = () => {
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [formData, setFormData] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((oldData) => ({ ...oldData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setSending(true);
    try {
      setMsg((await enviarContacto(formData)).message);
      setFormData(initialForm);
    } catch (error) {
      setMsg(error.response?.data?.message || 'No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="main">
      <div className="container-form">
        <div className="info-form">
          <h2>Contactanos</h2>
          <p>
            ¿Necesitás hablar con nosotros? Estamos para ayudarte. Completá el formulario y nos vamos a
            comunicar con vos a la brevedad.
          </p>
          <p>Dirección: Ciudad Evita, Buenos Aires</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="nombre">Nombre</label>
          <input id="nombre" type="text" name="nombre" value={formData.nombre} onChange={handleChange}
            placeholder="Ingresá tu nombre" className="campo" maxLength={120} autoComplete="name" required />
          <label className="visually-hidden" htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" name="email" value={formData.email} onChange={handleChange}
            placeholder="Ingresá tu correo" className="campo" maxLength={254} autoComplete="email" required />
          <label className="visually-hidden" htmlFor="mensaje">Mensaje</label>
          <textarea id="mensaje" name="mensaje" value={formData.mensaje} onChange={handleChange}
            placeholder="Ingresá tu mensaje" className="campo" maxLength={3000} required />
          <button type="submit" disabled={sending} className="btn-enviar">
            {sending ? 'Enviando…' : 'Enviar mensaje'}
          </button>
          <p className="estado" role="status" aria-live="polite">{msg}</p>
        </form>
      </div>
    </main>
  );
};

export default Contacto;
