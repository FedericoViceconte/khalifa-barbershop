import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import axios from 'axios';
import App from './App';
import { productos } from './pages/Productos';
import { NOVEDADES_DEMO } from './api';
import { crearIcs } from './calendario';

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const TURNO = {
  codigo: 'ABC234', servicio: 'Corte de cabello', barbero: 'Barbería clásica', fecha: '2026-11-10',
  hora: '10:30', duracion: 30, precio: 12000, nombre: 'Ana', estado: 'reservado', cancelable: true
};

beforeEach(() => {
  axios.get.mockImplementation(async (url) => {
    if (url === '/api/novedades') return { data: [{ id: 1, titulo: 'Novedad de prueba', subtitulo: 'Demo', cuerpo: 'Texto', fecha: '2026-11-01' }] };
    if (url === '/api/turnos/disponibilidad') return { data: { abierto: true, horarios: ['10:00', '10:30', '11:00'] } };
    throw new Error(`GET inesperado: ${url}`);
  });
  axios.post.mockImplementation(async (url) => {
    if (url === '/api/contacto') return { data: { message: 'Mensaje enviado.' } };
    if (url === '/api/turnos') return { data: TURNO };
    if (url === '/api/turnos/consulta') return { data: TURNO };
    if (url === '/api/turnos/cancelar') return { data: { message: 'Turno cancelado.', turno: { ...TURNO, estado: 'cancelado', cancelable: false } } };
    throw new Error(`POST inesperado: ${url}`);
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  window.localStorage.clear();
  window.history.pushState({}, '', '/');
});

function visit(path) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

test('muestra la portada, los servicios y las novedades', async () => {
  visit('/');
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('No es solo un corte.');
  expect(screen.getByRole('heading', { name: 'Corte y barba' })).toBeTruthy();
  expect(await screen.findByRole('heading', { name: 'Novedad de prueba' })).toBeTruthy();
  expect(screen.getByText('1 de noviembre de 2026')).toBeTruthy();
});

test('el menú marca la sección actual y se abre en pantallas chicas', () => {
  visit('/productos');
  const menu = screen.getByRole('navigation', { name: 'Secciones del sitio' });
  expect(within(menu).getByRole('link', { name: 'Productos' }).className).toContain('active');
  const boton = screen.getByRole('button', { name: 'Abrir el menú' });
  fireEvent.click(boton);
  expect(boton.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByRole('button', { name: 'Cerrar el menú' })).toBeTruthy();
});

test('los productos muestran el precio con descuento y se filtran y ordenan', () => {
  visit('/productos');
  for (const { nombre } of productos) expect(screen.getByRole('img', { name: nombre })).toBeTruthy();
  expect(screen.getAllByRole('link', { name: 'Consultar' })).toHaveLength(productos.length);
  // Patillera: $ 20.000 con 25 % de descuento.
  const patillera = screen.getByRole('heading', { name: 'Patillera Babyliss' }).closest('article');
  expect(within(patillera).getByText(/15\.000/)).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: 'Mobiliario' }));
  expect(screen.getAllByRole('link', { name: 'Consultar' })).toHaveLength(2);

  fireEvent.click(screen.getByRole('button', { name: 'Todos' }));
  fireEvent.change(screen.getByLabelText('Ordenar por'), { target: { value: 'menor' } });
  const catalogo = screen.getByRole('region', { name: 'Productos' });
  const nombres = within(catalogo).getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
  expect(nombres[0]).toBe('Set de barbero profesional');
  expect(nombres.at(-1)).toBe('Sillón de barbería');
});

test('reserva un turno: servicio, horario, datos y confirmación con código', async () => {
  visit('/reservar?servicio=corte');
  expect(screen.getByRole('button', { name: 'Confirmar reserva' }).disabled).toBe(true);

  fireEvent.click(await screen.findByRole('radio', { name: '10:30' }));
  fireEvent.change(screen.getByLabelText('Nombre y apellido'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '11 2345-6789' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar reserva' }));

  expect(await screen.findByRole('heading', { name: '¡Turno reservado!' })).toBeTruthy();
  expect(screen.getByText('ABC234')).toBeTruthy();
  expect(axios.post).toHaveBeenCalledWith('/api/turnos', expect.objectContaining({
    servicio: 'corte', barbero: 'cualquiera', hora: '10:30', nombre: 'Ana', telefono: '11 2345-6789'
  }));
  expect(axios.get).toHaveBeenCalledWith('/api/turnos/disponibilidad', {
    params: expect.objectContaining({ servicio: 'corte', barbero: 'cualquiera' })
  });
  expect(screen.getByRole('link', { name: 'Ver mi turno' }).getAttribute('href')).toBe('/mi-turno?codigo=ABC234');
});

test('si el horario se ocupa mientras tanto, avisa y vuelve a pedir la disponibilidad', async () => {
  axios.post.mockRejectedValueOnce({ response: { status: 409, data: { message: 'Ese horario ya no está disponible. Elegí otro.' } } });
  visit('/reservar?servicio=barba&barbero=moderna');
  fireEvent.click(await screen.findByRole('radio', { name: '11:00' }));
  fireEvent.change(screen.getByLabelText('Nombre y apellido'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '1123456789' } });
  const pedidos = axios.get.mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar reserva' }));
  expect((await screen.findByRole('alert')).textContent).toMatch(/ya no está disponible/);
  expect(axios.get.mock.calls.length).toBeGreaterThan(pedidos);
});

test('consulta y cancela un turno desde Mi turno', async () => {
  visit('/mi-turno?codigo=abc234');
  expect(screen.getByLabelText('Código de turno').value).toBe('ABC234');
  fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '1123456789' } });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar mi turno' }));

  expect(await screen.findByRole('heading', { name: 'Turno ABC234' })).toBeTruthy();
  expect(axios.post).toHaveBeenCalledWith('/api/turnos/consulta', { codigo: 'ABC234', telefono: '1123456789' });

  fireEvent.click(screen.getByRole('button', { name: 'Cancelar el turno' }));
  fireEvent.click(screen.getByRole('button', { name: 'Sí, cancelar' }));
  expect(await screen.findByText('Turno cancelado.')).toBeTruthy();
  expect(screen.getByText('Cancelado')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Cancelar el turno' })).toBeNull();
});

test('el formulario de contacto tiene etiquetas y envía los datos', async () => {
  visit('/contacto');
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'ana@example.com' } });
  fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Quiero un turno' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
  expect(await screen.findByText('Mensaje enviado.')).toBeTruthy();
  expect(axios.post).toHaveBeenCalledWith('/api/contacto', { nombre: 'Ana', email: 'ana@example.com', mensaje: 'Quiero un turno' });
  expect(screen.getByLabelText('Nombre').value).toBe('');
});

test('en la demo todo funciona sin servidor: novedades, reserva y consulta', async () => {
  vi.stubEnv('VITE_DEMO', 'true');
  visit('/');
  expect(screen.getByRole('note').textContent).toContain('Demo sin servidor');
  expect(await screen.findByRole('heading', { name: NOVEDADES_DEMO[0].titulo })).toBeTruthy();
  expect(screen.queryByRole('link', { name: 'Acceso para el equipo' })).toBeNull();
  cleanup();

  visit('/reservar?servicio=afeitado');
  const horarios = await screen.findAllByRole('radio', { name: /^\d{2}:\d{2}$/ });
  fireEvent.click(horarios[0]);
  fireEvent.change(screen.getByLabelText('Nombre y apellido'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '11 2345-6789' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar reserva' }));
  await screen.findByRole('heading', { name: '¡Turno reservado!' });
  const codigo = screen.getByText(/^[A-Z2-9]{6}$/).textContent;
  cleanup();

  visit(`/mi-turno?codigo=${codigo}`);
  fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '1123456789' } });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar mi turno' }));
  expect(await screen.findByRole('heading', { name: `Turno ${codigo}` })).toBeTruthy();
  expect(screen.getByText('Afeitado italiano')).toBeTruthy();
  expect(axios.get).not.toHaveBeenCalled();
  expect(axios.post).not.toHaveBeenCalled();
});

test('una dirección desconocida muestra la página no encontrada', () => {
  visit('/no-existe');
  expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeTruthy();
});

test('el archivo de calendario usa la hora argentina convertida a UTC', () => {
  const ics = crearIcs({ ...TURNO, servicio: 'Corte; barba' }, 'Ciudad Evita, Buenos Aires');
  expect(ics).toContain('DTSTART:20261110T133000Z');
  expect(ics).toContain('DTEND:20261110T140000Z');
  expect(ics).toContain('SUMMARY:Corte\\; barba en Khalifa Barbershop');
  expect(ics).toContain('LOCATION:Ciudad Evita\\, Buenos Aires');
});
