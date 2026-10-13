# truEstate Superuser Portal (React)

The superuser frontend (`superuser-login.html`, `superuser-dashboard.html` and
`superuser-dashboard.css`) is now a React app built with Vite. The backend is
unchanged: it still serves everything in `front-end/`, so the compiled app in
`front-end/superuser/` is available at `http://127.0.0.1:3001/superuser/`.

The old URLs still work. `superuser-login.html` and `superuser-dashboard.html`
are kept as redirect pages, so existing bookmarks and external links continue
working seamlessly.

## Run / Build

```bash
cd front-end/superuser-react
npm run dev      # http://localhost:5174 — /api and /uploads proxied to :3000
npm run build    # writes the production build to front-end/superuser/
```

Start the backend as usual (`npm run start:dev` in `back-end/`). The superuser
portal is available at `http://127.0.0.1:3001/superuser/#/login` or via
`http://127.0.0.1:3001/superuser-login.html`.

## Folder Structure

```
superuser-react/
├── index.html, vite.config.js, package.json
├── public/favicon.ico
└── src/
    ├── main.jsx, App.jsx        entry point + route table
    ├── api/                     session storage, fetch wrapper, superuser endpoints
    ├── context/                 toasts, session watcher, superuser profile
    ├── hooks/                   data loading + live refresh
    ├── components/              layout, modals, cards, icons, form controls
    ├── pages/                   LoginPage, DashboardOverview, UserManagement,
    │                            PropertyOperations, Revenue, SystemLogs, SystemSettings
    ├── utils/                   formatting (INR, bytes, IST timestamps, dates)
    └── styles/superuser.css     design system tokens & styles
```

## Routes (Old Section → React Page)

| URL (`/superuser/#…`) | Page                     | Description |
|-----------------------|--------------------------|-------------|
| `/login`              | `LoginPage.jsx`          | Superuser authentication & token storage |
| `/dashboard`          | `DashboardOverview.jsx`  | Platform health KPIs & system stats |
| `/users`              | `UserManagement.jsx`     | Full User CRUD (admin city desk, role management, block/delete) |
| `/properties`         | `PropertyOperations.jsx` | Property catalog management (edit & delete) |
| `/revenue`            | `Revenue.jsx`            | Financial dashboard (collected, receivable, MRR, streams, funnel) |
| `/logs`               | `SystemLogs.jsx`         | Real-time rotating system logs inspector (http, error, audit, app) |
| `/settings`           | `SystemSettings.jsx`     | Platform environment constants, DB configs, security policies |

## API Endpoints Used

- `POST /auth/login`: verifies superuser role and returns JWT
- `GET /users`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`: User CRUD
- `GET /properties`, `PATCH /properties/:id`, `DELETE /properties/:id`: Property catalog operations
- `GET /billing/revenue`: platform revenue breakdown
- `GET /logs`, `GET /logs/:channel`: channel inspection and real-time logs
