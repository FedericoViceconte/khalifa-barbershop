import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import axios from 'axios';
import App from './App';
import { productos } from './pages/Productos';
import { NOVEDADES_DEMO } from './api';

vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: [{ id: 1, titulo: 'Novedad de prueba', subtitulo: 'Demo', cuerpo: 'Texto' }]
    }),
    post: vi.fn().mockResolvedValue({ data: { message: 'Mensaje enviado.' } })
  }
}));

afterEach(() => {
  cleanup();
  window.history.pushState({}, '', '/');
});

function visit(path) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

test('muestra el inicio y carga las novedades', async () => {
  visit('/');
  expect(screen.getByRole('heading', { name: 'LA BARBERÍA' })).toBeTruthy();
  expect(await screen.findByRole('heading', { name: 'Novedad de prueba' })).toBeTruthy();
});

test('el menú marca la sección actual', () => {
  visit('/productos');
  const link = screen.getByRole('link', { name: 'Productos' });
  expect(link.className).toContain('active');
});

test('cada producto tiene su nombre como texto alternativo y un botón para consultar', () => {
  visit('/productos');
  for (const { nombre } of productos) {
    expect(screen.getByRole('img', { name: nombre })).toBeTruthy();
  }
  const consultas = screen.getAllByRole('link', { name: 'Consultar' });
  expect(consultas).toHaveLength(productos.length);
  expect(consultas[0].getAttribute('href')).toBe('/contacto');
});

test('el formulario de contacto tiene etiquetas y envía los datos', async () => {
  visit('/contacto');
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'ana@example.com' } });
  fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Quiero un turno' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
  expect(await screen.findByText('Mensaje enviado.')).toBeTruthy();
  expect(axios.post).toHaveBeenCalledWith('/api/contacto', {
    nombre: 'Ana', email: 'ana@example.com', mensaje: 'Quiero un turno'
  });
  expect(screen.getByLabelText('Nombre').value).toBe('');
});

test('en la demo usa novedades de ejemplo, avisa y no llama al servidor', async () => {
  vi.stubEnv('VITE_DEMO', 'true');
  axios.get.mockClear();
  axios.post.mockClear();
  visit('/contacto');
  expect(screen.getByRole('note').textContent).toContain('Demo sin servidor');
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'ana@example.com' } });
  fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Hola' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
  expect(await screen.findByText(/el mensaje no se envió/)).toBeTruthy();
  cleanup();
  visit('/');
  expect(await screen.findByRole('heading', { name: NOVEDADES_DEMO[0].titulo })).toBeTruthy();
  expect(axios.get).not.toHaveBeenCalled();
  expect(axios.post).not.toHaveBeenCalled();
  vi.unstubAllEnvs();
});

test('una dirección desconocida muestra la página no encontrada', () => {
  visit('/no-existe');
  expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeTruthy();
});
