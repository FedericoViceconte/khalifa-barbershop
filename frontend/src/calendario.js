// Archivo .ics para agregar el turno a Google Calendar, Outlook o el calendario del teléfono.
// Argentina está en UTC-3 todo el año, así que la hora local se pasa a UTC sumando tres horas.
const enUTC = (fecha, minutos) => {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia, 3, minutos)).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
};

const escapar = (texto) => String(texto).replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

export function crearIcs({ codigo, servicio, barbero, fecha, hora, duracion }, lugar) {
  const inicio = Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Khalifa Barbershop//Turnos//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${codigo}@khalifa-barbershop`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART:${enUTC(fecha, inicio)}`,
    `DTEND:${enUTC(fecha, inicio + duracion)}`,
    `SUMMARY:${escapar(`${servicio} en Khalifa Barbershop`)}`,
    `LOCATION:${escapar(lugar)}`,
    `DESCRIPTION:${escapar(`Barbero: ${barbero}. Código de turno: ${codigo}.`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    ''
  ].join('\r\n');
}

export function descargarIcs(turno, lugar) {
  const url = URL.createObjectURL(new Blob([crearIcs(turno, lugar)], { type: 'text/calendar;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `turno-khalifa-${turno.codigo}.ics`;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
