# Estructura de carpetas

Árbol completo del proyecto `store-app` (versión resumida y fácil de navegar):

```
store-app/
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── src/
│   ├── api/
│   │   ├── axios.js
│   │   ├── admins.js
│   │   ├── categories.js
│   │   ├── companies.js
│   │   ├── config.js
│   │   ├── products.js
│   │   └── sales.js
│   ├── components/
│   │   └── shared/
│   │       ├── ConfirmDialog.jsx
│   │       ├── LoginModal.jsx
│   │       └── Modal.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useCategories.js
│   │   ├── useCompanies.js
│   │   ├── useConfig.js
│   │   ├── useProducts.js
│   │   └── useSales.js
│   ├── lib/
│   │   └── utils.js
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── CategoriesPage.jsx
│   │   │   ├── CompaniesPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── SalesPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   └── store/
│   │       ├── ProductCard.jsx
│   │       ├── ProductModal.jsx
│   │       └── StorePage.jsx
│   ├── router/
│   │   └── index.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── dockerignore
├── env
├── env.example
├── eslint.config.js
├── index.html
├── nginx.conf
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── vite.config.js
└── package-lock.json (opcional)
```

Notas:

- Las rutas y nombres corresponden a la versión presente en el workspace; pueden cambiar al añadir recursos.
- Para añadir un nuevo recurso sigue el patrón: `src/api/nuevo.js`, `src/hooks/useNuevo.js`, `src/pages/admin/NuevoPage.jsx`.

Si quieres, puedo:

- Añadir enlaces directos en el `README.md` a secciones específicas del árbol.
- Generar un diagrama Mermaid con la estructura.
