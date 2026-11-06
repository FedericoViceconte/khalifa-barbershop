import axios from 'axios';
import * as agenda from '../../shared/agenda.mjs';

// La demo pública (VITE_DEMO=true) no tiene servidor: usa novedades de ejemplo, simula la agenda
// y guarda las reservas solo en este navegador.
export const isDemo = () => import.meta.env.VITE_DEMO === 'true';

export const NOVEDADES_DEMO = [
  {
    id: 2,
    titulo: 'Nuevo horario de verano',
    subtitulo: 'De martes a sábados, de 10 a 20 h',
    cuerpo: 'Desde diciembre ampliamos el horario para que puedas reservar tu turno después del trabajo.',
    fecha: '2026-11-02',
    imagen: ''
  },
  {
    id: 1,
    titulo: 'Afeitado italiano',
    subtitulo: 'El clásico de la casa',
    cuerpo: 'Dos toallas calientes, una fría, aceites aromáticos y terminación a navaja.',
    fecha: '2026-10-18',
    imagen: ''
  }
];

const mensaje = (error, porDefecto) => error.response?.data?.message || porDefecto;

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

// ---- Demo: agenda simulada --------------------------------------------------------------

const CLAVE_DEMO = 'khalifa-demo-turnos';

function leerDemo() {
  try {
    return JSON.parse(window.localStorage.getItem(CLAVE_DEMO)) ?? [];
  } catch {
    return [];
  }
}

function guardarDemo(turnos) {
  try {
    window.localStorage.setItem(CLAVE_DEMO, JSON.stringify(turnos));
  } catch {
    // Sin almacenamiento (modo privado): la reserva de la demo solo dura hasta recargar.
  }
}

// Algunos horarios aparecen ocupados para que la demo se parezca a una agenda real. Siempre los mismos por día.
function turnosSimulados(fecha) {
  let semilla = [...fecha].reduce((total, letra) => total * 31 + letra.charCodeAt(0), 7) >>> 0;
  const azar = () => {
    semilla = (semilla * 1103515245 + 12345) >>> 0;
    return semilla / 2 ** 32;
  };
  const turnos = [];
  for (const { id } of agenda.BARBEROS) {
    for (let inicio = agenda.HORARIO.apertura; inicio < agenda.HORARIO.cierre; inicio += 60) {
      if (azar() < 0.35) turnos.push({ barbero: id, hora: agenda.aHora(inicio), duracion: 30, estado: 'reservado' });
    }
  }
  return turnos;
}

function codigoDemo() {
  const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from(window.crypto.getRandomValues(new Uint32Array(6)), (n) => alfabeto[n % alfabeto.length]).join('');
}

const turnosDemoDelDia = (fecha) => [...turnosSimulados(fecha), ...leerDemo().filter((turno) => turno.fecha === fecha)];

function turnoPublico(turno) {
  return {
    ...turno,
    servicio: agenda.buscarServicio(turno.servicio)?.nombre ?? turno.servicio,
    barbero: agenda.buscarBarbero(turno.barbero)?.nombre ?? turno.barbero,
    cancelable: turno.estado === 'reservado'
  };
}

// ---- Turnos -------------------------------------------------------------------------------

export async function getDisponibilidad({ fecha, servicio, barbero }) {
  if (isDemo()) {
    const horarios = agenda.disponibilidad({ fecha, servicio, barbero, turnos: turnosDemoDelDia(fecha) }).map(({ hora }) => hora);
    return { fecha, abierto: agenda.abre(fecha), horarios };
  }
  try {
    const response = await axios.get('/api/turnos/disponibilidad', { params: { fecha, servicio, barbero } });
    return response.data;
  } catch (error) {
    throw new Error(mensaje(error, 'No se pudieron cargar los horarios.'));
  }
}

export async function reservarTurno(datos) {
  if (isDemo()) {
    const asignado = agenda.asignarBarbero({ ...datos, turnos: turnosDemoDelDia(datos.fecha) });
    if (!asignado) throw new Error('Ese horario ya no está disponible. Elegí otro.');
    const servicio = agenda.buscarServicio(datos.servicio);
    const turno = {
      ...datos,
      barbero: asignado,
      codigo: codigoDemo(),
      duracion: servicio.duracion,
      precio: servicio.precio,
      estado: 'reservado'
    };
    guardarDemo([...leerDemo(), turno]);
    return turnoPublico(turno);
  }
  try {
    const response = await axios.post('/api/turnos', datos);
    return response.data;
  } catch (error) {
    throw new Error(mensaje(error, 'No se pudo reservar el turno. Probá de nuevo.'));
  }
}

function buscarDemo(codigo, telefono) {
  const digitos = agenda.soloDigitos(telefono);
  return leerDemo().find((turno) => turno.codigo === codigo.trim().toUpperCase() && agenda.soloDigitos(turno.telefono) === digitos);
}

export async function consultarTurno({ codigo, telefono }) {
  if (isDemo()) {
    const turno = buscarDemo(codigo, telefono);
    if (!turno) throw new Error('No encontramos un turno con ese código y teléfono. En la demo solo existen los que reservaste en este navegador.');
    return turnoPublico(turno);
  }
  try {
    const response = await axios.post('/api/turnos/consulta', { codigo, telefono });
    return response.data;
  } catch (error) {
    throw new Error(mensaje(error, 'No se pudo consultar el turno.'));
  }
}

export async function cancelarTurno({ codigo, telefono }) {
  if (isDemo()) {
    const turno = buscarDemo(codigo, telefono);
    if (!turno) throw new Error('No encontramos un turno con ese código y teléfono.');
    turno.estado = 'cancelado';
    guardarDemo(leerDemo().map((guardado) => (guardado.codigo === turno.codigo ? turno : guardado)));
    return { message: 'Turno cancelado. ¡Te esperamos otro día!', turno: turnoPublico(turno) };
  }
  try {
    const response = await axios.post('/api/turnos/cancelar', { codigo, telefono });
    return response.data;
  } catch (error) {
    throw new Error(mensaje(error, 'No se pudo cancelar el turno.'));
  }
}
