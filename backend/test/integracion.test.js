// Recorrido completo contra una base MySQL o MariaDB real: reservas, consultas, panel y sesiones.
// Se ejecuta solo si MYSQL_TEST_DB indica una base de pruebas, que se vacía al empezar.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

const BASE_DE_PRUEBAS = process.env.MYSQL_TEST_DB;
const opciones = { skip: BASE_DE_PRUEBAS ? false : 'Definí MYSQL_TEST_DB (y MYSQL_USER, MYSQL_PASSWORD…) para correr estas pruebas.' };

let app, pool, agenda, servidor, base, crearCliente;
let dia; // un martes futuro, dentro del plazo de reserva
const ADMIN = { usuario: 'admin', password: 'clave-de-prueba-123' };

before(async () => {
  if (!BASE_DE_PRUEBAS) return;
  process.env.MYSQL_DB_NAME = BASE_DE_PRUEBAS;
  process.env.SESSION_SECRET = 'x'.repeat(48);
  process.env.SESSION_STORE = 'mysql';
  process.env.NODE_ENV = 'test';
  process.env.TRUST_PROXY = '1';
  for (const nombre of ['ADMIN_USER', 'ADMIN_PASSWORD', 'CLOUDINARY_URL']) delete process.env[nombre];

  app = require('../app');
  pool = require('../models/bd');
  agenda = require('../../shared/agenda.mjs');
  const { crearTablas } = require('../models/esquema');
  const { crearUsuario } = require('../models/usuariosModel');
  ({ crearCliente } = require('./cliente'));

  for (const tabla of ['turnos', 'novedades', 'usuarios', 'sesiones']) await pool.query(`DROP TABLE IF EXISTS ${tabla}`);
  await crearTablas();
  await crearUsuario(ADMIN.usuario, ADMIN.password);

  const hoy = agenda.ahoraEnArgentina().fecha;
  dia = agenda.sumarDias(hoy, 2);
  while (agenda.diaDeLaSemana(dia) !== 2) dia = agenda.sumarDias(dia, 1);

  ({ server: servidor, base } = await require('./cliente').iniciarServidor(app));
});

after(async () => {
  if (!BASE_DE_PRUEBAS) return;
  await new Promise((resolve) => servidor.close(resolve));
  await pool.end();
});

const reserva = (extra = {}) => ({
  servicio: 'corte', barbero: 'cualquiera', fecha: dia, hora: '10:00',
  nombre: 'Ana Pérez', telefono: '11 2345-6789', ...extra
});

async function reservar(cliente, datos) {
  const respuesta = await cliente.pedir('/api/turnos', { method: 'POST', json: datos });
  return { status: respuesta.status, cuerpo: await respuesta.json() };
}

test('la API informa los horarios libres de un día', opciones, async () => {
  const respuesta = await crearCliente(base).pedir(`/api/turnos/disponibilidad?fecha=${dia}&servicio=corte`);
  assert.equal(respuesta.status, 200);
  const { abierto, horarios } = await respuesta.json();
  assert.equal(abierto, true);
  assert.equal(horarios.length, 20);
});

test('reserva un turno, reparte entre barberos y rechaza un horario lleno', opciones, async () => {
  const cliente = crearCliente(base);
  const primero = await reservar(cliente, reserva());
  assert.equal(primero.status, 201);
  assert.match(primero.cuerpo.codigo, /^[A-Z2-9]{6}$/);
  assert.equal(primero.cuerpo.barbero, 'Barbería clásica');
  assert.equal(primero.cuerpo.precio, 12000);

  const segundo = await reservar(cliente, reserva({ nombre: 'Bruno' }));
  assert.equal(segundo.status, 201);
  assert.equal(segundo.cuerpo.barbero, 'Cortes modernos');

  const tercero = await reservar(cliente, reserva({ nombre: 'Carla' }));
  assert.equal(tercero.status, 409);

  const { horarios } = await (await cliente.pedir(`/api/turnos/disponibilidad?fecha=${dia}&servicio=corte`)).json();
  assert.ok(!horarios.includes('10:00'));
});

test('un servicio largo bloquea los horarios que pisa', opciones, async () => {
  const cliente = crearCliente(base);
  assert.equal((await reservar(cliente, reserva({ servicio: 'completo', barbero: 'clasica', hora: '11:00' }))).status, 201);
  assert.equal((await reservar(cliente, reserva({ barbero: 'clasica', hora: '11:30' }))).status, 409);
  assert.equal((await reservar(cliente, reserva({ barbero: 'clasica', hora: '12:00' }))).status, 201);
});

test('ante pedidos simultáneos por el mismo horario, solo uno se confirma', opciones, async () => {
  const pedidos = Array.from({ length: 6 }, (_, i) =>
    reservar(crearCliente(base), reserva({ barbero: 'moderna', hora: '15:00', nombre: `Cliente ${i}` }))
  );
  const estados = (await Promise.all(pedidos)).map(({ status }) => status).sort();
  assert.deepEqual(estados, [201, 409, 409, 409, 409, 409]);
});

test('valida los datos de la reserva', opciones, async () => {
  const cliente = crearCliente(base);
  for (const datos of [
    reserva({ servicio: 'tintura' }),
    reserva({ telefono: '123' }),
    reserva({ nombre: ' ' }),
    reserva({ hora: '10:15' }),
    reserva({ fecha: agenda.sumarDias(dia, -7 * 52) }),
    reserva({ fecha: agenda.sumarDias(dia, -1) })
  ]) {
    const { status } = await reservar(cliente, datos);
    assert.ok([400, 409].includes(status), `${JSON.stringify(datos)} → ${status}`);
  }
});

test('el cliente consulta y cancela su turno con el código y el teléfono', opciones, async () => {
  const cliente = crearCliente(base);
  const { cuerpo } = await reservar(cliente, reserva({ hora: '17:00', telefono: '+54 11 5555-0000' }));

  const mal = await cliente.pedir('/api/turnos/consulta', { method: 'POST', json: { codigo: cuerpo.codigo, telefono: '11 4444-0000' } });
  assert.equal(mal.status, 404);

  const consulta = await cliente.pedir('/api/turnos/consulta', {
    method: 'POST', json: { codigo: cuerpo.codigo.toLowerCase(), telefono: '541155550000' }
  });
  assert.equal(consulta.status, 200);
  const turno = await consulta.json();
  assert.equal(turno.estado, 'reservado');
  assert.equal(turno.cancelable, true);
  assert.equal(turno.telefono, undefined, 'no devuelve el teléfono');

  const cancelacion = await cliente.pedir('/api/turnos/cancelar', { method: 'POST', json: { codigo: cuerpo.codigo, telefono: '+54 11 5555-0000' } });
  assert.equal(cancelacion.status, 200);
  assert.equal((await cancelacion.json()).turno.estado, 'cancelado');

  const otraVez = await cliente.pedir('/api/turnos/cancelar', { method: 'POST', json: { codigo: cuerpo.codigo, telefono: '+54 11 5555-0000' } });
  assert.equal(otraVez.status, 409);
});

test('el panel muestra la agenda y cambia el estado de los turnos', opciones, async () => {
  const admin = crearCliente(base);
  const token = await admin.token('/admin/login');
  const entrada = await admin.pedir('/admin/login', { method: 'POST', form: { ...ADMIN, csrfToken: token } });
  assert.equal(entrada.status, 302);
  assert.equal(entrada.headers.get('location'), '/admin/agenda');

  const pagina = await admin.pedir(`/admin/agenda?fecha=${dia}`);
  assert.equal(pagina.status, 200);
  const html = await pagina.text();
  assert.match(html, /Ana Pérez/);
  assert.match(html, /Cortes modernos/);

  const [[turno]] = await pool.query("SELECT id FROM turnos WHERE nombre = 'Ana Pérez' AND hora = '10:00:00'");
  const csrf = html.match(/name="csrfToken" value="([a-f0-9]{64})"/)[1];
  const cambio = await admin.pedir(`/admin/turnos/${turno.id}/estado`, { method: 'POST', form: { estado: 'completado', csrfToken: csrf } });
  assert.equal(cambio.status, 302);
  const [[actualizado]] = await pool.query('SELECT estado FROM turnos WHERE id = ?', [turno.id]);
  assert.equal(actualizado.estado, 'completado');

  const [[{ sesiones }]] = await pool.query('SELECT COUNT(*) AS sesiones FROM sesiones');
  assert.ok(sesiones >= 1, 'la sesión se guarda en la base');
});

test('el panel carga turnos y no permite superponerlos', opciones, async () => {
  const admin = crearCliente(base);
  const token = await admin.token('/admin/login');
  await admin.pedir('/admin/login', { method: 'POST', form: { ...ADMIN, csrfToken: token } });

  const csrf = await admin.token('/admin/turnos/nuevo');
  const datos = { servicio: 'afeitado', barbero: 'clasica', fecha: dia, hora: '18:00', nombre: 'Diego', telefono: '1133334444', csrfToken: csrf };
  const alta = await admin.pedir('/admin/turnos/nuevo', { method: 'POST', form: datos });
  assert.equal(alta.status, 302);
  const [[nuevo]] = await pool.query("SELECT origen, duracion FROM turnos WHERE nombre = 'Diego'");
  assert.deepEqual({ ...nuevo }, { origen: 'panel', duracion: 45 });

  const superpuesto = await admin.pedir('/admin/turnos/nuevo', { method: 'POST', form: { ...datos, hora: '18:30', nombre: 'Elena' } });
  assert.equal(superpuesto.status, 400);
  assert.match(await superpuesto.text(), /ya no está disponible/);
});

test('el panel publica, edita y borra novedades', opciones, async () => {
  const admin = crearCliente(base);
  await admin.pedir('/admin/login', { method: 'POST', form: { ...ADMIN, csrfToken: await admin.token('/admin/login') } });

  let csrf = await admin.token('/admin/novedades/agregar');
  const alta = await admin.pedir('/admin/novedades/agregar', {
    method: 'POST', form: { titulo: 'Horario de fiestas', subtitulo: 'Diciembre', cuerpo: 'Abrimos también los lunes.', csrfToken: csrf }
  });
  assert.equal(alta.status, 302);
  let publicas = await (await fetch(`${base}/api/novedades`)).json();
  assert.equal(publicas[0].titulo, 'Horario de fiestas');
  assert.match(publicas[0].fecha, /^\d{4}-\d{2}-\d{2}$/);

  const id = publicas[0].id;
  csrf = await admin.token(`/admin/novedades/modificar/${id}`);
  await admin.pedir(`/admin/novedades/modificar/${id}`, {
    method: 'POST', form: { titulo: 'Horario de fiestas 2026', subtitulo: 'Diciembre', cuerpo: 'Abrimos también los lunes.', csrfToken: csrf }
  });
  publicas = await (await fetch(`${base}/api/novedades`)).json();
  assert.equal(publicas[0].titulo, 'Horario de fiestas 2026');

  csrf = await admin.token('/admin/novedades');
  await admin.pedir(`/admin/novedades/eliminar/${id}`, { method: 'POST', form: { csrfToken: csrf } });
  publicas = await (await fetch(`${base}/api/novedades`)).json();
  assert.equal(publicas.length, 0);
});

test('cambia la contraseña del administrador', opciones, async () => {
  const admin = crearCliente(base);
  await admin.pedir('/admin/login', { method: 'POST', form: { ...ADMIN, csrfToken: await admin.token('/admin/login') } });

  let csrf = await admin.token('/admin/cuenta');
  const corta = await admin.pedir('/admin/cuenta', { method: 'POST', form: { actual: ADMIN.password, nueva: 'corta', repetida: 'corta', csrfToken: csrf } });
  assert.equal(corta.status, 400);

  const nueva = 'otra-clave-segura-456';
  csrf = await admin.token('/admin/cuenta');
  const cambio = await admin.pedir('/admin/cuenta', { method: 'POST', form: { actual: ADMIN.password, nueva, repetida: nueva, csrfToken: csrf } });
  assert.equal(cambio.status, 302);
  ADMIN.password = nueva;

  const otra = crearCliente(base);
  const entrada = await otra.pedir('/admin/login', { method: 'POST', form: { ...ADMIN, csrfToken: await otra.token('/admin/login') } });
  assert.equal(entrada.status, 302);
});

// Va al final: después de este caso la IP de las pruebas queda bloqueada para iniciar sesión.
test('bloquea el inicio de sesión después de 5 intentos fallidos', opciones, async () => {
  const intruso = crearCliente(base);
  const token = await intruso.token('/admin/login');
  const estados = [];
  for (let i = 0; i < 6; i++) {
    const respuesta = await intruso.pedir('/admin/login', { method: 'POST', form: { usuario: 'admin', password: `intento-${i}`, csrfToken: token } });
    estados.push(respuesta.status);
  }
  assert.deepEqual(estados, [401, 401, 401, 401, 401, 429]);
});
