# Sasidhar Reddy Kalluru — truEstate

The frontend and backend are now separated without changing the application’s
behaviour or URLs:

```
.
├── front-end/                 Static HTML, CSS, JavaScript, and assets
│   └── legacy/                Original downloaded UI reference
├── back-end/                  NestJS API, MongoDB integration, tests, and scripts
│   ├── src/
│   ├── uploads/
│   ├── logs/
│   └── .env                   Backend runtime configuration (local only)
├── package.json               Workspace commands
└── package-lock.json
```

The NestJS backend continues to serve `front-end/`, so the existing pages,
relative API calls, authentication, uploads, dashboards, and API routes work
on the same addresses as before.

## Run the project

```bash
npm install
npm run start:dev
```

Use `back-end/.env.example` to create or update `back-end/.env`. The existing
local configuration was moved there during this reorganisation.

- App: `http://127.0.0.1:3000/index.html`
- Admin: `http://127.0.0.1:3001/admin-login.html`
- Superuser: `http://127.0.0.1:3002/superuser-login.html`
- API: `http://127.0.0.1:3000/api/v1`
- Swagger: `http://127.0.0.1:3000/api/docs`

Useful commands remain available from this root: `npm run build`, `npm run
seed`, `npm run test`, `npm run test:e2e`, and `npm run start:prod`. See
[`back-end/README.md`](back-end/README.md) for API and feature details.
