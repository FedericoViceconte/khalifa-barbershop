// Public files live under Vite's base: "/" with the backend, "/khalifa-barbershop/" on GitHub Pages.
export const asset = (path) => import.meta.env.BASE_URL + path.replace(/^\//, '');
