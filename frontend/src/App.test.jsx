import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from './App';

vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: [{ id: 1, titulo: 'Novedad de prueba', subtitulo: 'Demo', cuerpo: 'Texto' }]
    })
  }
}));

test('muestra el inicio y carga las novedades', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'LA BARBERÍA' })).toBeTruthy();
  expect(await screen.findByText('Novedad de prueba')).toBeTruthy();
});
