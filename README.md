# 🛒 Store App

Frontend completo para la **Store API** (Spring Boot). Tienda pública accesible sin login + panel de administración protegido con HTTP Basic Auth.

---

## Stack

| Librería | Versión | Rol |
|---|---|---|
| **React** | 18 | UI |
| **Vite** | 5 | Build tool + dev server |
| **react-router-dom** | 6 | Routing SPA |
| **@tanstack/react-query** | 5 | Server state, caché, refetch automático |
| **axios** | 1.7 | HTTP client con interceptor de auth |
| **react-hook-form** | 7 | Formularios controlados |
| **zod** | 3 | Validación de esquemas |
| **react-hot-toast** | 2 | Notificaciones |
| **recharts** | 2 | Gráficos (Dashboard) |
| **tailwindcss** | 3 | Estilos utility-first |
| **lucide-react** | — | Íconos |
| **clsx + tailwind-merge** | — | Merge seguro de clases |
| **date-fns** | 3 | Utilidades de fechas |
| **prettier + eslint** | — | Calidad de código |

---

## Estructura de carpetas

He extraído la estructura completa del proyecto a un archivo independiente para facilitar su lectura y mantenimiento. Ver el árbol completo en [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md).

Resumen rápido:

```
src/                # Código fuente (componentes, páginas, API, hooks, context)
  api/              # Lógica de llamadas al backend (axios + endpoints)
  hooks/            # Hooks de React Query por recurso
  pages/            # Vistas públicas y panel admin
  components/       # Componentes compartidos
  context/          # Proveedores/global state
  router/           # Definición de rutas
  lib/              # Utilidades reutilizables
```

Para instrucciones de instalación, scripts y despliegue, sigue leyendo abajo.
---

## Instalación

### Requisitos previos

- Node.js 18+
- Backend de la Store API corriendo en `http://localhost:8080`

### Pasos

```bash
# 1. Cloná o descomprimí el proyecto
cd store-app

# 2. Copiá el archivo de entorno
cp .env.example .env

# 3. (Opcional) Editá .env si tu backend corre en otro puerto
#    VITE_API_BASE_URL=http://localhost:8080

# 4. Instalá dependencias
npm install

# 5. Arrancá el servidor de desarrollo
npm run dev
```

La app queda disponible en **http://localhost:5173**.

> El proxy de Vite redirige automáticamente `/api/*` → `VITE_API_BASE_URL` durante el desarrollo,
> por lo que no necesitás configurar CORS en el backend.

---

## Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo con HMR
npm run build      # Build de producción en /dist
npm run preview    # Previsualizar el build de producción
npm run lint       # Revisar errores de ESLint
npm run lint:fix   # Corregir errores automáticamente
npm run format     # Formatear código con Prettier
```

---

## Rutas

| Ruta | Descripción | Auth |
|---|---|---|
| `/` | Tienda pública — catálogo, búsqueda, filtros | No requerida |
| `/admin` | Redirecciona a `/admin/dashboard` | ADMIN |
| `/admin/dashboard` | Stats de ventas + gráfico | ADMIN |
| `/admin/productos` | CRUD de productos | ADMIN |
| `/admin/categorias` | CRUD de categorías | ADMIN |
| `/admin/companias` | CRUD de compañías | ADMIN |
| `/admin/ventas` | Registrar y ver ventas por período | ADMIN |
| `/admin/configuracion` | Datos de la tienda + nuevo admin | ADMIN |

---

## Autenticación

El login verifica credenciales haciendo `GET /api/ventas`:

- **401/403** → credenciales inválidas o sin rol ADMIN.
- **200** → sesión iniciada. Las credenciales se guardan en `sessionStorage` y se inyectan en cada request vía el interceptor de Axios: `Authorization: Basic base64(nombre:password)`.

Al cerrar el tab o el navegador, la sesión se pierde (comportamiento de `sessionStorage`).

---

## Configuración de la tienda

Los campos **Nombre**, **Dirección**, **Tagline** y **Descripción** se guardan en `localStorage` bajo la clave `store_settings`. Son editables desde **Admin → Configuración** y se muestran en la tienda pública sin requerir un endpoint extra en el backend.

---

## Cómo extender el proyecto

Para agregar un nuevo recurso de la API seguí el patrón existente:

```
1. src/api/nuevo.js          → funciones getAll / create / update / remove
2. src/hooks/useNuevo.js     → useQuery + useMutation con invalidación de caché
3. src/pages/admin/NuevoPage.jsx  → tabla + modal de formulario + confirm dialog
4. src/router/index.jsx      → agregar { path: 'nuevo', element: <NuevoPage /> }
5. AdminLayout.jsx           → agregar entrada al array NAV
```

---

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | URL base del backend (solo afecta el proxy de Vite en dev y el build de producción) |

---

## Deploy en producción

```bash
# Build
npm run build

# La carpeta /dist es estática — podés servirla con Nginx, Vercel, Netlify, etc.
# Asegurate de configurar redirects para SPA:
#   todas las rutas → index.html
```

Ejemplo de configuración para **Nginx**:

```nginx
server {
  listen 80;
  root /var/www/store-app/dist;
  index index.html;

  location /api/ {
    proxy_pass http://localhost:8080;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## Licencia

MIT
