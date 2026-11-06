// jsdom no implementa el desplazamiento de la ventana; el sitio lo usa al cambiar de página.
window.scrollTo = () => {};
