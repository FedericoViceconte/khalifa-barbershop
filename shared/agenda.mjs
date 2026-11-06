// Reglas de la agenda que comparten el sitio (React) y el servidor (Express).
// Las fechas viajan como 'AAAA-MM-DD' y las horas como 'HH:MM', siempre en la hora de Buenos Aires.

export const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

// Precios de ejemplo, en pesos.
export const SERVICIOS = [
  {
    id: 'corte',
    nombre: 'Corte de cabello',
    descripcion: 'Corte premium con lavado y terminaciones a navaja.',
    duracion: 30,
    precio: 12000
  },
  {
    id: 'barba',
    nombre: 'Arreglo de barba',
    descripcion: 'Fomento caliente y frío, perfilado a navaja y productos para la piel.',
    duracion: 30,
    precio: 9000
  },
  {
    id: 'afeitado',
    nombre: 'Afeitado italiano',
    descripcion: 'Dos toallas calientes, una fría, aceites aromáticos y terminación a navaja.',
    duracion: 45,
    precio: 11000
  },
  {
    id: 'completo',
    nombre: 'Corte y barba',
    descripcion: 'El combo de la casa: corte de cabello y arreglo de barba en un solo turno.',
    duracion: 60,
    precio: 18000
  }
];

export const BARBEROS = [
  { id: 'clasica', nombre: 'Barbería clásica', detalle: 'Barbero desde 2018, especialista en navaja.' },
  { id: 'moderna', nombre: 'Cortes modernos', detalle: 'Profesional desde 2015, especialista en tendencias.' }
];

// Días de atención (0 = domingo) y franja en minutos desde la medianoche: martes a sábado, de 10 a 20.
export const HORARIO = { dias: [2, 3, 4, 5, 6], apertura: 10 * 60, cierre: 20 * 60, intervalo: 30 };

export const DIAS_DE_RESERVA = 21;
export const ANTICIPACION_MINIMA = 60;
export const ESTADOS = ['reservado', 'completado', 'ausente', 'cancelado'];

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export const buscarServicio = (id) => SERVICIOS.find((servicio) => servicio.id === id);
export const buscarBarbero = (id) => BARBEROS.find((barbero) => barbero.id === id);

export function aMinutos(hora) {
  if (typeof hora !== 'string' || !HORA.test(hora.slice(0, 5))) return NaN;
  return Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));
}

export function aHora(minutos) {
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
}

export function esFechaValida(fecha) {
  if (typeof fecha !== 'string' || !FECHA.test(fecha)) return false;
  const dia = new Date(`${fecha}T00:00:00Z`);
  return !Number.isNaN(dia.getTime()) && dia.toISOString().slice(0, 10) === fecha;
}

export function sumarDias(fecha, dias) {
  const dia = new Date(`${fecha}T00:00:00Z`);
  dia.setUTCDate(dia.getUTCDate() + dias);
  return dia.toISOString().slice(0, 10);
}

export const diaDeLaSemana = (fecha) => new Date(`${fecha}T00:00:00Z`).getUTCDay();
export const abre = (fecha) => HORARIO.dias.includes(diaDeLaSemana(fecha));

// Fecha y minutos actuales en Buenos Aires, sin depender de la zona horaria de la máquina.
export function ahoraEnArgentina(momento = new Date()) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: ZONA_HORARIA,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    })
      .formatToParts(momento)
      .map(({ type, value }) => [type, value])
  );
  return {
    fecha: `${partes.year}-${partes.month}-${partes.day}`,
    minutos: Number(partes.hour) * 60 + Number(partes.minute)
  };
}

// Los próximos días de reserva. `abierto` indica si la barbería atiende; `conLugar`, si todavía se llega a
// reservar ese día (hoy deja de tenerlo cuando falta menos que la anticipación mínima para el cierre).
export function fechasReservables(ahora = ahoraEnArgentina()) {
  const ultimoInicio = HORARIO.cierre - HORARIO.intervalo;
  return Array.from({ length: DIAS_DE_RESERVA }, (_, i) => {
    const fecha = sumarDias(ahora.fecha, i);
    const abierto = abre(fecha);
    return { fecha, abierto, conLugar: abierto && (i > 0 || ahora.minutos + ANTICIPACION_MINIMA <= ultimoInicio) };
  });
}

export function dentroDelPlazo(fecha, ahora = ahoraEnArgentina(), plazo = DIAS_DE_RESERVA) {
  return esFechaValida(fecha) && fecha >= ahora.fecha && fecha <= sumarDias(ahora.fecha, plazo - 1);
}

const seSuperponen = (inicio, fin, turno) => inicio < turno.fin && turno.inicio < fin;

// Horarios de inicio posibles para un servicio de `duracion` minutos con un barbero que ya tiene `ocupados`.
// `anticipacion` son los minutos mínimos entre ahora y el turno; el panel la ignora para cargar a quien llega sin turno.
export function horariosLibres({ fecha, duracion, ocupados = [], ahora = ahoraEnArgentina(), anticipacion = ANTICIPACION_MINIMA }) {
  if (!esFechaValida(fecha) || !abre(fecha) || fecha < ahora.fecha) return [];
  const limite = fecha === ahora.fecha ? ahora.minutos + anticipacion : -1;
  const libres = [];
  for (let inicio = HORARIO.apertura; inicio + duracion <= HORARIO.cierre; inicio += HORARIO.intervalo) {
    if (inicio < limite) continue;
    if (ocupados.some((turno) => seSuperponen(inicio, inicio + duracion, turno))) continue;
    libres.push(aHora(inicio));
  }
  return libres;
}

// Turnos activos de la base convertidos en franjas ocupadas por barbero.
export function ocupadosPorBarbero(turnos) {
  const ocupados = Object.fromEntries(BARBEROS.map(({ id }) => [id, []]));
  for (const turno of turnos) {
    if (turno.estado === 'cancelado' || !ocupados[turno.barbero]) continue;
    const inicio = aMinutos(turno.hora);
    ocupados[turno.barbero].push({ inicio, fin: inicio + Number(turno.duracion) });
  }
  return ocupados;
}

// Disponibilidad de un día. Con barbero 'cualquiera' se ofrece cada horario en que haya al menos uno libre.
export function disponibilidad({
  fecha,
  servicio,
  barbero = 'cualquiera',
  turnos = [],
  ahora = ahoraEnArgentina(),
  anticipacion = ANTICIPACION_MINIMA,
  plazo = DIAS_DE_RESERVA
}) {
  const elegido = buscarServicio(servicio);
  if (!elegido || !dentroDelPlazo(fecha, ahora, plazo)) return [];
  const candidatos = barbero === 'cualquiera' ? BARBEROS : BARBEROS.filter(({ id }) => id === barbero);
  const ocupados = ocupadosPorBarbero(turnos);
  const porHora = new Map();
  for (const { id } of candidatos) {
    for (const hora of horariosLibres({ fecha, duracion: elegido.duracion, ocupados: ocupados[id], ahora, anticipacion })) {
      if (!porHora.has(hora)) porHora.set(hora, []);
      porHora.get(hora).push(id);
    }
  }
  return [...porHora.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hora, barberos]) => ({ hora, barberos }));
}

// Elige al barbero libre con menos turnos ese día; ante un empate, el primero de la lista.
export function asignarBarbero({ hora, turnos = [], ...consulta }) {
  const libre = disponibilidad({ ...consulta, turnos }).find((franja) => franja.hora === hora);
  if (!libre) return null;
  const carga = (id) => turnos.filter((turno) => turno.barbero === id && turno.estado !== 'cancelado').length;
  return [...libre.barberos].sort((a, b) => carga(a) - carga(b))[0];
}

export const soloDigitos = (telefono) => String(telefono ?? '').replace(/\D/g, '');

export const precioConDescuento = (precio, descuento) => Math.round(precio * (1 - descuento / 100));
