import { useEffect } from 'react';

const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const largo = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const mesCorto = new Intl.DateTimeFormat('es-AR', { month: 'short', timeZone: 'UTC' });
const diaCorto = new Intl.DateTimeFormat('es-AR', { weekday: 'short', timeZone: 'UTC' });
const mesLargo = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// Las fechas son 'AAAA-MM-DD' en hora argentina; se formatean como UTC para no correrse de día.
const aFecha = (fecha) => new Date(`${fecha}T00:00:00Z`);
const sinPunto = (texto) => texto.replace('.', '');

export const pesos = (valor) => moneda.format(valor);
export const fechaLarga = (fecha) => largo.format(aFecha(fecha));
export const fechaConAnio = (fecha) => mesLargo.format(aFecha(fecha));
export const partesDeFecha = (fecha) => ({
  dia: sinPunto(diaCorto.format(aFecha(fecha))),
  numero: aFecha(fecha).getUTCDate(),
  mes: sinPunto(mesCorto.format(aFecha(fecha)))
});
export const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Khalifa Barbershop` : 'Khalifa Barbershop · Barbería clásica en Ciudad Evita';
  }, [titulo]);
}
