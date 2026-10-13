# truEstate — Real Estate Platform

A full-stack real estate marketplace where **buyers** discover and negotiate on
verified properties, **sellers** list and track their deals, **city admins**
verify listings and run each deal through to registration, and a **superuser**
oversees the whole platform.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Demo accounts](#demo-accounts)
- [Available scripts](#available-scripts)
- [How a deal works](#how-a-deal-works)
- [Revenue model](#revenue-model)
- [API overview](#api-overview)
- [Security & logging](#security--logging)
- [Configuration](#configuration)
- [Testing](#testing)
- [Further documentation](#further-documentation)

---

## Features

### Buyer
- Browse and filter verified listings (city, type, price, sale/rent) with pagination
- Shortlist properties and track the ones under consideration
- Schedule site visits and follow their status
- Make offers and negotiate (counter-offers) with the seller
- Follow each purchase step by step and pay through the built-in checkout
- Notifications and an activity feed for every update

### Seller
- Add properties with photos and ownership documents
- Manage listings, see verification status and rejection reasons
- Respond to buyer offers, track payments and closed deals
- Buy subscription plans (Starter / Silver / Gold) and featured-listing boosts

### Admin (one per city)
- Verify or reject seller-submitted listings and their documents
- Handle site visits, negotiations and purchase tracking for **their own city only**
- Manage buyers, sellers and listings

### Superuser
- Platform overview and revenue dashboard
- User management and property operations across all cities
- Read the server's HTTP, error, app and audit logs from the browser

---

## Tech stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19, React Router 7, Vite 7, Vitest + Testing Library |
| Backend    | NestJS 11, TypeScript, Passport JWT, class-validator, Swagger (OpenAPI) |
| Database   | MongoDB with Mongoose |
| Security   | bcrypt, helmet, rate limiting (`@nestjs/throttler`), NoSQL-injection filtering |
| Payments   | Razorpay, with a built-in offline gateway for local use (no keys needed) |
| Email      | Nodemailer over SMTP (logged to the console when SMTP is not configured) |

---

## Project structure

This is an npm **workspaces** monorepo with two packages:

```
.
├── back-end/                     NestJS API
│   ├── src/
│   │   ├── main.ts               App bootstrap — serves the API and the built frontend
│   │   ├── app.module.ts
│   │   ├── seed.ts               Seeds admins, superuser and sample properties
│   │   ├── config/               Environment-based configuration
│   │   ├── common/               Guards, decorators, middlewares, filters,
│   │   │                         interceptors, file logging, upload config
│   │   ├── shared/               Enums, pricing catalogue, service cities, helpers
│   │   └── modules/              Feature modules:
│   │       auth, users, buyers, sellers, admins, properties, listings,
│   │       property-images, property-documents, shortlists, visits,
│   │       negotiations, purchases, payments, billing, subscriptions,
│   │       commissions, bank-accounts, bookings, notifications,
│   │       reports, logs, mail
│   ├── test/                     End-to-end tests
│   ├── scripts/                  Dev helpers (kill ports, seed fixes, …)
│   ├── uploads/                  Uploaded images/documents (git-ignored)
│   ├── logs/                     Rotating log files (git-ignored)
│   └── .env.example              Copy to .env and adjust
│
├── front-end/                    React single-page app
│   ├── src/
│   │   ├── api/                  Fetch client and API service functions
│   │   ├── auth/                 Session handling and protected routes
│   │   ├── components/           Shared UI (layout, modals, forms, property cards, …)
│   │   ├── pages/                Landing, login, and the buyer / seller /
│   │   │                         admin / superuser dashboards
│   │   ├── hooks/ utils/ styles/
│   │   └── main.jsx, App.jsx
│   ├── legacy/                   The original static HTML version, kept for reference
│   └── vite.config.js
│
└── package.json                  Root scripts that drive both workspaces
```

In production the NestJS server serves the built React app (`front-end/dist`)
**and** the API from the same origin, so there is no separate frontend server
to deploy.

---

## Getting started

### Prerequisites

- **Node.js 20+** and npm
- **MongoDB** — a local instance or a MongoDB Atlas connection string

  ```bash
  # macOS (Homebrew)
  brew install mongodb-community && brew services start mongodb-community
  # or with Docker
  docker run -d -p 27017:27017 --name mongo mongo
  ```

### 1. Clone and install

```bash
git clone https://github.com/Sasidharchinnu/real-estate-backend-2.git
cd real-estate-backend-2
npm install
```

### 2. Configure the environment

```bash
cp back-end/.env.example back-end/.env
```

The defaults work for local development. At minimum check `MONGODB_URI`, and
set a strong `JWT_SECRET` for anything other than local use
(`openssl rand -hex 32`).

### 3. Seed the database

```bash
npm run seed
```

Creates the four city admins, the superuser and sample properties. It is safe
to run more than once.

### 4. Run

**Option A — single server (closest to production)**

```bash
npm run build:frontend   # builds the React app into front-end/dist
npm run start:dev        # NestJS with hot reload
```

**Option B — frontend hot reload**

```bash
npm run start:dev        # terminal 1: API on :3000
npm run dev:frontend     # terminal 2: Vite on :5173, proxies /api to :3000
```

### 5. Open the app

| What              | URL |
|-------------------|-----|
| Website           | http://localhost:3000 (or http://localhost:5173 with Option B) |
| Admin portal      | http://localhost:3001/admin/login |
| Superuser portal  | http://localhost:3002/superuser/login |
| REST API          | http://localhost:3000/api/v1 |
| Swagger docs      | http://localhost:3000/api/docs |
| Health check      | http://localhost:3000/health |

> Ports 3001 and 3002 run the same app — they just give each staff portal its
> own memorable address.

---

## Demo accounts

Created by `npm run seed` (passwords come from `back-end/.env`):

| Role       | Email                   | Password    | City      |
|------------|-------------------------|-------------|-----------|
| Superuser  | `superuser@gmail.com`   | `123456789` | All       |
| Admin      | `adminhyd@gmail.com`    | `123456789` | Hyderabad |
| Admin      | `adminchn@gmail.com`    | `123456789` | Chennai   |
| Admin      | `adminb@gmail.com`      | `123456789` | Bangalore |
| Admin      | `adminkoc@gmail.com`    | `123456789` | Kochi     |

Buyers and sellers sign up from the website. One email can hold both a buyer
and a seller account.

> ⚠️ These are development credentials. Change the seed passwords in `.env`
> before deploying anywhere public.

---

## Available scripts

Run from the repository root:

| Command                   | Description |
|---------------------------|-------------|
| `npm run start:dev`       | Start the backend in watch mode |
| `npm run dev:frontend`    | Start the Vite dev server for the frontend |
| `npm run build`           | Build frontend and backend for production |
| `npm run start:prod`      | Run the compiled backend (`back-end/dist`) |
| `npm run seed`            | Seed admins, superuser and sample properties |
| `npm test`                | Run backend (Jest) and frontend (Vitest) unit tests |
| `npm run test:e2e`        | Run backend end-to-end tests |
| `npm run test:cov`        | Backend test coverage report |
| `npm run lint`            | Lint backend and frontend |
| `npm run kill-ports`      | Free ports 3000–3002 if a previous run is stuck |
| `npm run restart`         | Kill ports, rebuild and start in production mode |

---

## How a deal works

```
Seller lists property ──► Admin verifies listing & documents ──► Listing goes live
                                                                         │
Buyer shortlists ──► Schedules site visit ──► Makes an offer ◄──► Seller counters
                                                                         │
                                                       Offer accepted ───┘
                                                              │
   Offer Accepted → Document Verification → Token Payment → Full Payment → Registration
```

- Listings are limited to the launch cities: **Hyderabad, Chennai, Bangalore and Kochi**.
- Seller listings start as **pending** and only appear in search once the
  city admin verifies them.
- Each admin only sees visits, negotiations and purchases from their own city.

---

## Revenue model

All prices live on the server (`back-end/src/shared/constants/pricing.ts`), and
checkout always recalculates the amount there, so the client can't change what
it is charged.

| Plan     | Price / month | Active listings | Commission discount |
|----------|---------------|-----------------|---------------------|
| Starter  | Free          | 2               | —                   |
| Silver   | ₹999          | 10              | 0.25%               |
| Gold     | ₹2,499        | Unlimited       | 0.50% + a free monthly Spotlight |

Quarterly billing is 10% off and yearly is 20% off.

**Featured listings:** Spotlight (₹499 / 7 days) and Premium (₹1,299 / 30 days).

**Commission:** sale is 2% from the seller and 1% from the buyer. Rent is 3% /
2%, calculated on the annual rent.

**Payments:** with no Razorpay keys set, the app uses a built-in offline gateway
that follows Razorpay's order and HMAC signature flow, so checkout works end to
end without real money (the dashboards show a **TEST MODE** banner). Add
`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` to switch to the real Razorpay checkout.

---

## API overview

All endpoints are under `/api/v1`, and responses use one consistent envelope:

```json
{ "success": true, "statusCode": 200, "message": "…", "data": { } }
```

| Area | Example endpoints |
|------|-------------------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, forgot / change password |
| Listings | `GET /listings/search` — public, filterable, paginated search |
| Properties | CRUD, image & document upload, admin verify / reject queue |
| Buyer flow | shortlists, visits, negotiations, purchases |
| Money | billing catalog & checkout, payments, payment webhook, commissions, bank accounts |
| Admin | users, buyers, sellers, admins, notifications, reports |
| Logs | `GET /logs`, `GET /logs/:channel` (admin / superuser) |

Swagger at **`/api/docs`** has the full interactive reference. Use **Authorize**
to paste a JWT from `/auth/login`.

---

## Security & logging

- **Authentication:** JWT access tokens, bcrypt password hashing
- **Authorization:** role-based guards (buyer / seller, admin, superuser), with city-scoped admin queues
- **Input validation:** every DTO is validated and unknown fields are rejected
- **Hardening:** helmet headers, API and static-file rate limiting, MongoDB
  operator and prototype-pollution filtering, request size limits
- **Uploads:** MIME allow-list, size caps, random filenames, and validation before anything is written to disk
- **Logging:** JSON log files split into four channels (`http`, `error`, `app`,
  `audit`) with daily and size-based rotation, automatic cleanup, IST timestamps
  and secret redaction. Every error response includes a `requestId` that matches its log entry.

---

## Configuration

Everything is set in `back-end/.env`. See
[`back-end/.env.example`](back-end/.env.example) for every option with comments.

| Variable | Purpose |
|----------|---------|
| `PORT`, `ADMIN_PORT`, `SUPERUSER_PORT`, `HOST` | Server ports and bind address |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Token signing (required in production) |
| `CORS_ORIGINS` | Allowed origins if the frontend is hosted elsewhere |
| `ADMIN_SEED_PASSWORD`, `SUPERUSER_SEED_*` | Seed account credentials |
| `SMTP_*`, `MAIL_FROM` | Outgoing email for password resets |
| `RAZORPAY_*` | Live payment gateway (optional) |
| `LOG_*` | Log directory, flush interval, rotation and retention |
| `MAX_UPLOAD_*`, `MAX_JSON_BODY_KB`, `STATIC_RATE_LIMIT*` | Request and upload limits |

> `back-end/.env` is git-ignored. Never commit real secrets.

---

## Testing

```bash
npm test              # all unit tests (backend Jest + frontend Vitest)
npm run test:backend  # backend only
npm run test:frontend # frontend only
npm run test:e2e      # backend end-to-end
npm run test:cov      # backend coverage
```

---

## Further documentation

- [`back-end/README.md`](back-end/README.md) covers the backend in depth:
  authentication, roles, negotiations and purchases, payments, document
  verification, the middleware pipeline and log management.
- [`front-end/docs/admin-react-explained.html`](front-end/docs/admin-react-explained.html)
  walks through the admin dashboard's React code.

---

## Author

**Kalluru Sasidhar Reddy** — [@Sasidharchinnu](https://github.com/Sasidharchinnu)
