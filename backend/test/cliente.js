const { randomInt } = require('node:crypto');

// Cliente HTTP mínimo para las pruebas: guarda la cookie de sesión y lee el token CSRF de los formularios.
// Cada cliente simula una IP propia (con TRUST_PROXY=1) para que los límites de pedidos no se mezclen entre casos.
function crearCliente(base, { ip = `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}` } = {}) {
  let cookie = '';

  async function pedir(ruta, { method = 'GET', form, json, headers = {} } = {}) {
    const opciones = { method, redirect: 'manual', headers: { 'x-forwarded-for': ip, ...headers } };
    if (cookie) opciones.headers.cookie = cookie;
    if (form) {
      opciones.headers['content-type'] = 'application/x-www-form-urlencoded';
      opciones.body = new URLSearchParams(form).toString();
    }
    if (json) {
      opciones.headers['content-type'] = 'application/json';
      opciones.body = JSON.stringify(json);
    }
    const respuesta = await fetch(base + ruta, opciones);
    const nueva = respuesta.headers.get('set-cookie');
    if (nueva) cookie = nueva.split(';')[0];
    return respuesta;
  }

  async function token(ruta) {
    const html = await (await pedir(ruta)).text();
    const encontrado = html.match(/name="csrfToken" value="([a-f0-9]{64})"/);
    if (!encontrado) throw new Error(`No hay token CSRF en ${ruta}`);
    return encontrado[1];
  }

  return { pedir, token, olvidar: () => { cookie = ''; } };
}

async function iniciarServidor(app) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}

module.exports = { crearCliente, iniciarServidor };
