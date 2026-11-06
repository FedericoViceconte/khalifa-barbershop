// Reglas de la agenda compartidas con el sitio: horarios, superposiciones, plazos y zona horaria.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const agenda = require('../../shared/agenda.mjs');

// Un martes cualquiera, visto desde el lunes anterior a las 9 de la mañana.
const MARTES = '2026-11-10';
const ANTES = { fecha: '2026-11-09', minutos: 9 * 60 };

test('ofrece turnos de martes a sábado, dentro del horario y según la duración del servicio', () => {
  const corte = agenda.horariosLibres({ fecha: MARTES, duracion: 30, ahora: ANTES });
  assert.equal(corte[0], '10:00');
  assert.equal(corte.at(-1), '19:30');
  assert.equal(corte.length, 20);

  const completo = agenda.horariosLibres({ fecha: MARTES, duracion: 60, ahora: ANTES });
  assert.equal(completo.at(-1), '19:00');

  assert.deepEqual(agenda.horariosLibres({ fecha: '2026-11-08', duracion: 30, ahora: ANTES }), [], 'domingo');
  assert.deepEqual(agenda.horariosLibres({ fecha: '2026-11-09', duracion: 30, ahora: { fecha: '2026-11-08', minutos: 0 } }), [], 'lunes');
});

test('descarta los horarios que se superponen con turnos tomados', () => {
  const ocupados = [{ inicio: 10 * 60, fin: 10 * 60 + 45 }];
  const libres = agenda.horariosLibres({ fecha: MARTES, duracion: 30, ocupados, ahora: ANTES });
  assert.ok(!libres.includes('10:00'));
  assert.ok(!libres.includes('10:30'));
  assert.ok(libres.includes('11:00'));

  // Un servicio de una hora no entra a las 9:30 de un hueco que termina a las 10:00.
  const largos = agenda.horariosLibres({ fecha: MARTES, duracion: 60, ocupados: [{ inicio: 11 * 60, fin: 11 * 60 + 30 }], ahora: ANTES });
  assert.ok(largos.includes('10:00'));
  assert.ok(!largos.includes('10:30'));
  assert.ok(!largos.includes('11:00'));
  assert.ok(largos.includes('11:30'));
});

test('el mismo día exige la anticipación mínima, salvo desde el panel', () => {
  const ahora = { fecha: MARTES, minutos: 14 * 60 + 10 };
  const web = agenda.horariosLibres({ fecha: MARTES, duracion: 30, ahora });
  assert.equal(web[0], '15:30');

  const panel = agenda.horariosLibres({ fecha: MARTES, duracion: 30, ahora, anticipacion: -24 * 60 });
  assert.equal(panel[0], '10:00');

  assert.deepEqual(agenda.horariosLibres({ fecha: '2026-11-03', duracion: 30, ahora }), [], 'una fecha pasada no tiene horarios');
});

test('con "cualquiera" ofrece el horario si hay al menos un barbero libre', () => {
  const turnos = [
    { barbero: 'clasica', hora: '10:00:00', duracion: 30, estado: 'reservado' },
    { barbero: 'moderna', hora: '10:00', duracion: 30, estado: 'reservado' },
    { barbero: 'moderna', hora: '11:00', duracion: 60, estado: 'reservado' },
    { barbero: 'clasica', hora: '12:00', duracion: 30, estado: 'cancelado' }
  ];
  const cualquiera = agenda.disponibilidad({ fecha: MARTES, servicio: 'corte', turnos, ahora: ANTES });
  assert.equal(cualquiera[0].hora, '10:30');
  assert.deepEqual(cualquiera.find((franja) => franja.hora === '11:00').barberos, ['clasica']);
  assert.deepEqual(cualquiera.find((franja) => franja.hora === '12:00').barberos, ['clasica', 'moderna'], 'un turno cancelado libera el horario');

  const moderna = agenda.disponibilidad({ fecha: MARTES, servicio: 'corte', barbero: 'moderna', turnos, ahora: ANTES });
  assert.ok(!moderna.some((franja) => ['10:00', '11:00', '11:30'].includes(franja.hora)));

  assert.deepEqual(agenda.disponibilidad({ fecha: MARTES, servicio: 'tintura', turnos, ahora: ANTES }), [], 'servicio inexistente');
});

test('asigna el barbero libre con menos turnos y devuelve null si no hay lugar', () => {
  const turnos = [{ barbero: 'clasica', hora: '15:00', duracion: 30, estado: 'reservado' }];
  assert.equal(agenda.asignarBarbero({ fecha: MARTES, hora: '10:00', servicio: 'corte', turnos, ahora: ANTES }), 'moderna');
  assert.equal(agenda.asignarBarbero({ fecha: MARTES, hora: '10:00', servicio: 'corte', turnos: [], ahora: ANTES }), 'clasica');
  assert.equal(agenda.asignarBarbero({ fecha: MARTES, hora: '15:00', servicio: 'corte', barbero: 'clasica', turnos, ahora: ANTES }), null);
  assert.equal(agenda.asignarBarbero({ fecha: MARTES, hora: '10:15', servicio: 'corte', turnos, ahora: ANTES }), null, 'fuera de la grilla');
});

test('respeta el plazo de reserva', () => {
  assert.ok(agenda.dentroDelPlazo(ANTES.fecha, ANTES));
  assert.ok(agenda.dentroDelPlazo(agenda.sumarDias(ANTES.fecha, agenda.DIAS_DE_RESERVA - 1), ANTES));
  assert.ok(!agenda.dentroDelPlazo(agenda.sumarDias(ANTES.fecha, agenda.DIAS_DE_RESERVA), ANTES));
  assert.ok(!agenda.dentroDelPlazo('2026-11-08', ANTES));
  assert.ok(agenda.dentroDelPlazo(agenda.sumarDias(ANTES.fecha, 60), ANTES, 90));
});

test('calcula la fecha y la hora de Buenos Aires sin importar la zona de la máquina', () => {
  assert.deepEqual(agenda.ahoraEnArgentina(new Date('2026-11-10T02:30:00Z')), { fecha: '2026-11-09', minutos: 23 * 60 + 30 });
  assert.deepEqual(agenda.ahoraEnArgentina(new Date('2026-11-10T13:05:00Z')), { fecha: '2026-11-10', minutos: 10 * 60 + 5 });
});

test('valida fechas y horas y convierte entre formatos', () => {
  assert.ok(agenda.esFechaValida('2028-02-29'));
  assert.ok(!agenda.esFechaValida('2026-02-30'));
  assert.ok(!agenda.esFechaValida('10/11/2026'));
  assert.equal(agenda.aMinutos('09:45'), 585);
  assert.ok(Number.isNaN(agenda.aMinutos('25:00')));
  assert.equal(agenda.aHora(585), '09:45');
  assert.equal(agenda.sumarDias('2026-12-30', 3), '2027-01-02');
  assert.equal(agenda.soloDigitos('+54 (11) 2345-6789'), '541123456789');
  assert.equal(agenda.precioConDescuento(20000, 25), 15000);
});
