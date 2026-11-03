import React, { useState } from 'react';

import axios from 'axios';



const Contacto = (props) => {

    const initialForm = {
        nombre: '',
        email: '',
        mensaje: ''
    }

    const [sending, setSending] = useState(false);
    const [msg, setMsg] = useState('');
    const [formData, setFormData] = useState(initialForm);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(oldData => ({
            ...oldData,
            [name]: value
        }));
    }

    const handleSubmit = async e => {
        e.preventDefault();
        setMsg('');
        setSending(true)
        try {
            const response = await axios.post('/api/contacto', formData);
            setMsg(response.data.message);
            setFormData(initialForm);
        } catch (error) {
            setMsg(error.response?.data?.message || 'No se pudo enviar el mensaje.');
        } finally {
            setSending(false);
        }
    }


    return (
        <main className="main">
            <div className="container-form">
                <div className="info-form">
                    <h2>Contactanos</h2>
                    <p>¿Necesitás hablar con nosotros? ¡Estamos para ayudarte!
                        Te detallamos debajo todos los medios de contacto que podes utilizar para comunicarte, tambien podes llenar el formulario y esperar que nosotros nos comuniquemos con vos!</p>
                        <p>Direccion: Ciudad Evita,Bs As</p>
                </div>

                <form action='/contacto' onSubmit={handleSubmit}>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ingresa tu nombre" className="campo" required />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Ingresa tu correo" className="campo" required />
                <textarea name="mensaje" value={formData.mensaje} onChange={handleChange} placeholder="Ingresa tu mensaje" className="campo" required />
                <input type="submit" disabled={sending} name="enviar" value="enviar mensaje" className="btn-enviar" />



                </form>

                {sending ? <p>Enviando...</p> : null}
                {msg ? <p>{msg}</p> : null}

            </div>



        </main>

    );
}
export default Contacto;
