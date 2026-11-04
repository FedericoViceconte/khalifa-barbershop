import axios from 'axios';

// The public demo (VITE_DEMO=true) has no backend: it shows sample news and does not send mail.
export const isDemo = () => import.meta.env.VITE_DEMO === 'true';

export const NOVEDADES_DEMO = [
  {
    id: 2,
    titulo: 'Nuevo horario de verano',
    subtitulo: 'De martes a sábados, de 10 a 20 h',
    cuerpo: 'Desde diciembre ampliamos el horario para que puedas reservar tu turno después del trabajo.',
    imagen: ''
  },
  {
    id: 1,
    titulo: 'Afeitado italiano',
    subtitulo: 'El clásico de la casa',
    cuerpo: 'Dos toallas calientes, una fría, aceites aromáticos y terminación a navaja.',
    imagen: ''
  }
];

export async function getNovedades() {
  if (isDemo()) return NOVEDADES_DEMO;
  const response = await axios.get('/api/novedades');
  return response.data;
}

export async function enviarContacto(datos) {
  if (isDemo()) return { message: 'Esta es una demo sin servidor: el mensaje no se envió.' };
  const response = await axios.post('/api/contacto', datos);
  return response.data;
}
