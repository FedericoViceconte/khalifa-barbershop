// Rutas que funcionan sin MySQL: validaciones, modo demostración, cabeceras de seguridad, panel protegido y CSRF.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

process.env.SESSION_SECRET = 'x'.repeat(48);
process.env.SESSION_STORE = 'memoria';
process.env.NODE_ENV = 'test';
for (const name of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_EMAIL', 'TRUST_PROXY']) delete process.env[name];

const app = require('../app');
const pool = require('../models/bd');
const { iniciarServidor, crearCliente } = require('./cliente');
let server;
let base;

before(async () => {
  ({ server, base } = await iniciarServidor(app));
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

function post(ruta, body) {
  return fetch(`${base}${ruta}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

test('el contacto rechaza datos incompletos o un correo inválido', async () => {
  for (const body of [{}, { nombre: 'Ana', email: 'no-es-correo', mensaje: 'Hola' }, { nombre: ' ', email: 'ana@example.com', mensaje: 'Hola' }]) {
    const response = await post('/api/contacto', body);
    assert.equal(response.status, 400);
  }
});

test('sin SMTP el contacto responde en modo demostración', async () => {
  const response = await post('/api/contacto', { nombre: 'Ana', email: 'ana@example.com', mensaje: 'Quiero un turno' });
  assert.equal(response.status, 200);
  assert.match((await response.json()).message, /demostración/);
});

test('las respuestas llevan cabeceras de seguridad', async () => {
  const response = await fetch(`${base}/admin/login`);
  const csp = response.headers.get('content-security-policy');
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /script-src 'self'/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-powered-by'), null);
  assert.match(response.headers.get('set-cookie'), /khalifa\.sid=.*HttpOnly.*SameSite=Lax/);
});

test('las secciones del panel redirigen al login si no hay sesión', async () => {
  for (const ruta of ['/admin', '/admin/agenda', '/admin/turnos/nuevo', '/admin/novedades', '/admin/cuenta']) {
    const response = await fetch(`${base}${ruta}`, { redirect: 'manual' });
    assert.equal(response.status, 302, ruta);
    assert.equal(response.headers.get('location'), '/admin/login', ruta);
  }
});

test('el login incluye un token CSRF y rechaza envíos sin él o con uno falso', async () => {
  const cliente = crearCliente(base);
  const token = await cliente.token('/admin/login');
  assert.match(token, /^[a-f0-9]{64}$/);
  for (const form of [{ usuario: 'admin', password: 'clave' }, { usuario: 'admin', password: 'clave', csrfToken: 'f'.repeat(64) }]) {
    const response = await cliente.pedir('/admin/login', { method: 'POST', form });
    assert.equal(response.status, 403);
  }
});

test('la disponibilidad y las reservas validan los datos antes de ir a la base', async () => {
  const disponibilidad = await fetch(`${base}/api/turnos/disponibilidad?fecha=2020-01-01&servicio=corte`);
  assert.equal(disponibilidad.status, 400);
  const servicio = await fetch(`${base}/api/turnos/disponibilidad?fecha=2030-01-01&servicio=tintura`);
  assert.equal(servicio.status, 400);

  const reserva = await post('/api/turnos', { servicio: 'corte', fecha: '2020-01-01', hora: '10:00', nombre: 'Ana', telefono: '1123456789' });
  assert.equal(reserva.status, 400);
  assert.match((await reserva.json()).message, /fecha/);

  const consulta = await post('/api/turnos/consulta', { codigo: 'no', telefono: '1' });
  assert.equal(consulta.status, 404);
});

test('una ruta desconocida devuelve 404, en JSON dentro de la API', async () => {
  assert.equal((await fetch(`${base}/no-existe`)).status, 404);
  const api = await fetch(`${base}/api/no-existe`);
  assert.equal(api.status, 404);
  assert.deepEqual(await api.json(), { message: 'No existe.' });
});
