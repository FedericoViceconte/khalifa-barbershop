# Khalifa Barbershop

Proyecto académico full stack iniciado en 2022. El sitio presenta los servicios y productos de una barbería, muestra novedades y ofrece un formulario de contacto. Un panel de administración permite crear, editar y eliminar novedades.

- `frontend/` contiene el sitio en React, React Router y Vite.
- `backend/` contiene la API y el panel en Node.js, Express, Handlebars y MySQL.

## Ejecutar en local

Requisitos: Node.js 22.12 o posterior y MySQL.

1. Creá una base vacía llamada `khalifa_barbershop`. Importá `backend/sql/schema.sql` y, si querés ver una novedad de muestra, `backend/sql/demo.sql`. Por ejemplo, con el cliente de MySQL:

   ```sh
   mysql -u TU_USUARIO -p khalifa_barbershop < backend/sql/schema.sql
   mysql -u TU_USUARIO -p khalifa_barbershop < backend/sql/demo.sql
   ```

2. Copiá `backend/.env.example` a `backend/.env`. Completá `MYSQL_USER` y `MYSQL_PASSWORD`. Generá un secreto de sesión con `node -p "require('node:crypto').randomBytes(32).toString('hex')"` y guardalo en `SESSION_SECRET`.
3. Desde la raíz, instalá las dependencias, compilá el frontend y arrancá el servidor.

   ```sh
   npm --prefix frontend ci
   npm --prefix frontend run build
   npm --prefix backend ci
   npm --prefix backend start
   ```

4. Abrí [el sitio local](http://localhost:3000/). Para el panel, agregá temporalmente `ADMIN_PASSWORD` a `backend/.env` con una contraseña de al menos 12 caracteres. Ejecutá `npm --prefix backend run create-admin -- admin`, quitá esa variable del archivo y entrá en [Administración](http://localhost:3000/admin/login).

El formulario devuelve una respuesta de demostración mientras SMTP esté sin configurar. El correo real requiere las variables `SMTP_*` y `CONTACT_EMAIL`. Para adjuntar imágenes a las novedades, configurá `CLOUDINARY_URL`.

## Desarrollo

Con el backend en el puerto 3000, ejecutá `npm --prefix frontend start` para abrir la vista previa con recarga en vivo en el puerto 3001. El proxy de desarrollo reenvía `/api` al backend. Para correr la prueba del frontend, usá `npm --prefix frontend test`.

La configuración documentada es para una demo local. El servidor escucha en la interfaz local por defecto y las sesiones se guardan en memoria.
