// Íconos de línea en SVG, del mismo color que el texto que los rodea.
const trazos = {
  corte: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" />
    </>
  ),
  barba: (
    <>
      <path d="M6 4v5a6 6 0 0 0 12 0V4" />
      <path d="M6 9c0 6 2.5 11 6 11s6-5 6-11" />
      <path d="M9.5 13.5c1.5.8 3.5.8 5 0" />
    </>
  ),
  afeitado: (
    <>
      <path d="M3 17 14 6l4 4-11 11H3z" />
      <path d="m14 6 2-2a2.8 2.8 0 0 1 4 4l-2 2" />
      <path d="M7 13l4 4" />
    </>
  ),
  completo: (
    <>
      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4l-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M16 2.5v4M8 2.5v4M3 10h18" />
    </>
  ),
  ubicacion: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  persona: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  flecha: <path d="M5 12h14M13 6l6 6-6 6" />,
  volver: <path d="M19 12H5M11 6l-6 6 6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  cerrar: <path d="M18 6 6 18M6 6l12 12" />,
  ticket: (
    <>
      <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" />
      <path d="M13 6v12" strokeDasharray="2 2" />
    </>
  ),
  mensaje: (
    <>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
    </>
  )
};

const Icono = ({ nombre, medida = 22, className = '' }) => (
  <svg
    className={`icono ${className}`.trim()}
    viewBox="0 0 24 24"
    width={medida}
    height={medida}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {trazos[nombre]}
  </svg>
);

export default Icono;
