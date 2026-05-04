# Evaluation 4 Completion Notes

## Run

Backend API:

```bash
npm run build
npm run start
```

API base URL: http://localhost:3000/api/v1

Swagger: http://localhost:3000/api/docs

Optional static frontend server:

```bash
node server.js
```

Frontend URL: http://localhost:5500

## RBAC Header

Protected APIs use the `role` request header.

Allowed roles:

- `superuser`
- `admin`
- `agent`
- `seller`
- `buyer`

## Completed Requirement Coverage

- NestJS backend with modules, controllers, services, DTOs, guards, filters, and interceptors.
- In-memory data stores using `Map` for CRUD entities.
- REST APIs for users, properties, listings, bookings, agents, admins, buyers, sellers, visits, shortlists, negotiations, purchases, payments, notifications, reports, property images, property documents, and bank accounts.
- RBAC enforced with a NestJS guard using the `role` header.
- Validation through DTOs and global `ValidationPipe`.
- Consistent success/error response format.
- Swagger documentation with request schemas, response envelopes, and role header security.
- Frontend API integration through `api.js` and `evaluation4-integration.js`.
- Seller property CRUD, admin property verification/rejection, buyer listings, buyer shortlist, buyer visit, and buyer negotiation flows now call backend APIs.

## Verification Performed

- TypeScript build passed.
- Live API checks passed for:
  - seeded property listing
  - seller property creation
  - admin property approval
  - buyer shortlist creation
  - buyer visit creation
  - buyer negotiation creation
  - RBAC missing-role error handling
  - Swagger JSON generation
- Static frontend pages served successfully through `server.js`.
