// Routes that work without MySQL: validation, demo contact mode, admin protection and CSRF.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

process.env.SESSION_SECRET = 'x'.repeat(48);
for (const name of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_EMAIL']) delete process.env[name];

const app = require('../app');
const pool = require('../models/bd');
let server;
let base;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

function contacto(body) {
  return fetch(`${base}/api/contacto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

test('el contacto rechaza datos incompletos o un correo inválido', async () => {
  for (const body of [{}, { nombre: 'Ana', email: 'no-es-correo', mensaje: 'Hola' }, { nombre: ' ', email: 'ana@example.com', mensaje: 'Hola' }]) {
    const response = await contacto(body);
    assert.equal(response.status, 400);
  }
});

test('sin SMTP el contacto responde en modo demostración', async () => {
  const response = await contacto({ nombre: 'Ana', email: 'ana@example.com', mensaje: 'Quiero un turno' });
  assert.equal(response.status, 200);
  assert.match((await response.json()).message, /demostración/);
});

test('el panel redirige al login si no hay sesión', async () => {
  const response = await fetch(`${base}/admin/novedades`, { redirect: 'manual' });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/admin/login');
});

test('el login incluye un token CSRF y rechaza envíos sin él', async () => {
  const page = await fetch(`${base}/admin/login`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /name="csrfToken" value="[a-f0-9]{64}"/);
  const response = await fetch(`${base}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', cookie: page.headers.get('set-cookie') },
    body: 'usuario=admin&password=clave-de-prueba'
  });
  assert.equal(response.status, 403);
});

test('una ruta desconocida devuelve 404', async () => {
  const response = await fetch(`${base}/no-existe`);
  assert.equal(response.status, 404);
});
