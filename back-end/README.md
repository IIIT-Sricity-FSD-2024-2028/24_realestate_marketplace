# truEstate — Real Estate Platform

A real estate application with a production-ready **NestJS + MongoDB** backend
and the existing static **HTML/CSS/JS** frontend, wired together end-to-end.

- REST API with JWT authentication, bcrypt password hashing, role-based
  authorization (Admin / User), DTO validation, and Swagger docs.
- MongoDB persistence via `@nestjs/mongoose`, with a `Property.adminId → User._id`
  relationship.
- The frontend (`../front-end/`) is served by the same NestJS app and talks to the API
  over `fetch()` — no separate frontend server required.

## Project structure

```
src/
├── auth/                     modules/auth — register, login, /auth/me, JWT strategy & guard
├── modules/
│   ├── users/                Mongoose User schema, admin-managed CRUD
│   ├── properties/            Mongoose Property schema, CRUD, ownership, search/pagination
│   ├── listings/               Public search — thin wrapper over properties search
│   ├── admins / bank-accounts / bookings / buyers / negotiations /
│   │   notifications / payments / property-documents / property-images /
│   │   purchases / reports / sellers / shortlists / visits
│   │                          MongoDB-backed workflow modules
│   └── logs/                  Read-only API over the log files (admin/superuser)
├── common/
│   ├── decorators/            @ApiRole, @CurrentUser, @Roles, Swagger helpers
│   ├── guards/                JwtAuthGuard, RolesGuard
│   ├── middlewares/            Request context, HTTP logging, security, auditing,
│   │                            upload validation, Express error handler
│   ├── logging/                File logger (buffered + rotating), Nest logger adapter
│   ├── upload/                 Shared multer (file-upload) configuration
│   ├── filters/                Global HTTP exception filter (standard error envelope)
│   ├── interceptors/           Global response envelope { success, statusCode, message, data }
│   └── enums/                  Role (admin | user)
├── config/                    Environment-based configuration
├── seed.ts                    Seeds the default admin + sample properties
├── app.module.ts
└── main.ts

../front-end/                  Existing frontend (unchanged UI), now wired to the API:
├── index.html                 Landing page — real login/signup + live, filterable, paginated
│                               property listings from the database
├── admin-login.html           Real admin login (POST /auth/login)
├── admin-dashboard.html       Real "Manage Listings" (Property CRUD) + "User Management"
├── superuser-login.html       Real superuser login (POST /auth/login)
├── superuser-dashboard.html   Real User Management + Property Operations CRUD (System Settings stays a local demo)
├── Buyer Dashboard - truEstate.html / seller-dashboard.html
│                               Unchanged — see "Scope" below
└── app.js                      Shared TruEstate.api() fetch wrapper + JWT/session helpers
```

## Prerequisites

- Node.js 18+ (tested on Node 24)
- MongoDB running locally (or a connection string to Atlas / any MongoDB instance)

## Setup

Run these commands from the workspace root (the directory containing
`front-end/` and `back-end/`):

```bash
npm install
cp back-end/.env.example back-end/.env      # already created for you; edit if needed
```

`.env` (see `.env.example` for all options):

```
PORT=3000
HOST=127.0.0.1
MONGODB_URI=mongodb://127.0.0.1:27017/real_estate
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=1d
ADMIN_SEED_EMAIL=admin@gmail.com
ADMIN_SEED_PASSWORD=123456789
```

> If your machine doesn't have MongoDB installed: `brew install mongodb-community@7.0 && brew services start mongodb-community@7.0` (macOS), or run `docker run -d -p 27017:27017 mongo`.

## Build, seed, and run

```bash
npm run build     # compiles src/ -> dist/
npm run seed      # creates the admin account + sample properties (idempotent)
npm run start:prod   # node dist/main — serves the API *and* the frontend on :3000
```

For development with hot-reload:

```bash
npm run start:dev
```

Then open:
- **App / frontend:** http://127.0.0.1:3000/index.html (buyer/seller landing, login, signup, live listings)
- **Admin login:** http://127.0.0.1:3000/admin-login.html
- **API base:** http://127.0.0.1:3000/api/v1
- **Swagger docs:** http://127.0.0.1:3000/api/docs

### Seeded credentials

```
Admin:     admin@gmail.com     / 123456789   → admin-login.html
Superuser: superuser@gmail.com / 123456789   → superuser-login.html
```

(Matches the credentials those login pages always advertised; now backed by
real bcrypt-hashed users in MongoDB instead of a hardcoded check.)

## How authentication works

- `POST /api/v1/auth/register` — public self-registration. Always creates a
  `Role.USER` account (optionally tagged `userType: buyer|seller` for display).
  Returns a JWT immediately.
- `POST /api/v1/auth/login` — verifies the bcrypt hash, returns a JWT
  (`{ accessToken, tokenType, expiresIn, user }`).
- `GET /api/v1/auth/me` — returns the profile for the bearer token.
- `POST /api/v1/auth/forgot-password` (`{ email, userType? }`) — always
  responds 200 whether or not the account exists (no enumeration). ⚠️ This
  demo has no email service configured, so the reset token is returned
  directly in the response (and logged server-side) instead of being
  emailed — a real deployment would only ever email it. Expires in 1 hour,
  single-use. Wired up on `index.html`, `admin-login.html`, and
  `superuser-login.html` via `TruEstate.openForgotPasswordModal(userType?)`
  in `app.js` (a self-built modal, no extra markup needed per page).
- `POST /api/v1/auth/reset-password` (`{ token, newPassword }`) — consumes
  the token and sets a new password.
- Protected routes use `@ApiRole(Role.ADMIN)` / `@ApiRole(Role.USER)`, which
  chains `JwtAuthGuard` (verifies the token) → `RolesGuard` (checks
  `request.user.role`). Admin-only routes (e.g. property create/update/delete,
  all of `/users`) reject non-admins with 403; anonymous requests get 401.
- Elevated (Admin/Superuser) accounts are **not** self-registrable — they're
  created via `POST /users` by an existing admin/superuser, or via `npm run seed`.

### Three roles: Admin, User, Superuser

`Role.SUPERUSER` is a superset role: `RolesGuard` grants it automatic access
to *any* `@ApiRole(...)`-guarded route, so every admin-only endpoint (all of
`/users`, property create/update/delete, etc.) is reachable by a superuser
without listing it explicitly on each route. Seeded via `npm run seed`
alongside the admin account (see credentials below).

### One email, multiple accounts (buyer + seller)

Uniqueness is enforced on **(email, userType)**, not on email alone. This
means the same email can own up to three separate accounts: a buyer account,
a seller account, and an admin/type-less account — each with its own
password. `POST /auth/login` and `POST /auth/register` both take an optional
`userType` field to say which one you mean:

- The buyer/seller tabs on `index.html` send `userType` automatically, so
  logging in on the "Seller" tab only ever matches that email's seller
  account (never silently logs you into its buyer account).
- Omitting `userType` (as `admin-login.html` does) matches the admin/type-less
  account for that email.
- Registering the same (email, userType) pair twice still correctly 409s;
  registering a *different* userType for an already-used email now succeeds.

The frontend stores `{ id, name, email, role, token }` in `localStorage`
(`truEstate_user`, via the existing `TruEstate.setUser/getUser` helpers) and
sends `Authorization: Bearer <token>` on every API call through the new
`TruEstate.api()` wrapper in `../front-end/app.js`.

## Properties: ownership, filtering, pagination

- Every property has an `adminId` (Mongoose ref to `User`), automatically set
  to the creating admin unless a different `adminId` is explicitly supplied.
- `GET /api/v1/properties` and `GET /api/v1/listings/search` both accept:
  `city`, `state`, `type`, `listingType`, `status`, `minPrice`, `maxPrice`,
  `minBedrooms`, `minAreaSqft`, `page`, `limit` (max 50/page) — filtered and
  paginated at the MongoDB query level (not in memory).
- `GET /api/v1/properties/mine` returns the authenticated user's own listings
  (an admin's owned properties, or a seller's submissions in any state).

## Negotiations & purchase tracking

A buyer submits an offer, an admin/superuser can counter/accept/reject it, and
accepting either side's number auto-creates a tracked Purchase — fully real,
persisted, and visible to both the buyer and every admin (previously this was
entirely client-side `localStorage`, invisible outside the buyer's own browser).

- `POST /api/v1/negotiations` (buyer, userType=seller blocked) — submit an
  offer on a property. Starts `pending`.
- `PATCH /api/v1/negotiations/:id/counter` (admin/superuser) → `countered`.
- `PATCH /api/v1/negotiations/:id/accept` (admin/superuser) — accepts the
  buyer's offer as-is → `accepted`, **auto-creates a Purchase**.
- `PATCH /api/v1/negotiations/:id/accept-counter` (buyer, owner only) —
  accepts the admin's counter → `accepted`, **auto-creates a Purchase**.
- `PATCH /api/v1/negotiations/:id/reject` (admin/superuser, optional reason)
  and `.../withdraw` (buyer, owner only) → terminal states.
- `GET /api/v1/negotiations/mine` (buyer) / `GET /api/v1/negotiations/review-queue`
  (admin/superuser, buyer+property populated, filterable by status).
- A `Purchase` moves through 5 fixed steps (Offer Accepted → Document
  Verification → Token Payment → Full Payment → Registration) via
  `PATCH /api/v1/purchases/:id/advance` (admin/superuser) — auto-completes
  after the last step. `GET /api/v1/purchases/mine` / `.../review-queue`
  mirror the negotiations endpoints.

Frontend: `Buyer Dashboard - truEstate.html`'s Negotiate, Purchase Initiation,
and Purchased Vault pages, and `admin-dashboard.html`'s new **Negotiations**
and **Purchase Tracking** nav sections, are all wired to this. Because the
buyer dashboard's property showcase is a fixed local demo catalog (not the
live `/properties` search), `loadRealPropertyIds()` matches each showcase
card to a real seeded property by exact title (`src/seed.ts` seeds 13
properties with titles matching the showcase) so offers land on a real
property — see the code comment there before renaming either side.

**Also fixed:** `Buyer Dashboard - truEstate.html`'s "Under Consideration"
button — it pushed the property into the list, then immediately re-checked
the same now-always-true condition, so the "added!" toast and list refresh
were unreachable dead code; every add silently looked like "already added."

**Also added:** `admin-dashboard.html` had a whole "Negotiations" section
with no sidebar nav item pointing to it at all (`data-nav="negotiations"`
didn't exist) — it was unreachable regardless of backend wiring. Added the
missing nav entry alongside the real data.

## Revenue model & payments

The platform earns from three streams, each one attached to something that
actually happens in the product rather than bolted on beside it:

| Stream | Who pays | When | Rate |
|---|---|---|---|
| **Listing plans** (subscription) | Seller | Monthly / quarterly / yearly | Starter free (2 listings) · Silver ₹999/mo (10) · Gold ₹2,499/mo (unlimited) |
| **Featured listings** (one-off) | Seller | Per promoted listing | Spotlight ₹499 / 7 days · Premium ₹1,299 / 30 days |
| **Deal commission** | Buyer **and** seller | Only when a purchase *completes* | Sale 2% seller + 1% buyer · Rent 3% + 2% of annual rent |

18% GST is added to every charge. The whole rate card lives in one file,
`src/shared/constants/pricing.ts`, and is published to the dashboards over
`GET /api/v1/billing/catalog` — the frontend never hard-codes a price, and
checkout re-derives the amount server-side from the plan/pack *code* the
client sent, so a tampered request can change what is bought but never what
it costs.

**Commission is billed at the Registration step**, the last of the five
purchase-tracking stages:

```
Offer Accepted → Document Verification → Token Payment → Full Payment → Registration
                                                                            ▲
                                    commission raised here, and the deal cannot
                                    be marked complete until it is settled
```

Advancing into Registration raises two `accrued` commission lines (buyer-side
and seller-side) and takes the property off the market — Full Payment is
already behind it. The deal then *parks* there: `PATCH /purchases/:id/advance`
answers **402 Payment Required** while anything is outstanding, so the admin
literally cannot close the registration until the platform has been paid. That
is deliberate — after registration there is no leverage left to collect. A deal
that stalls or is cancelled before Registration bills nobody.

The seller's plan buys down their rate (Gold takes 2% → 1.50%), which is what
makes a plan pay for itself on a single sale. Because lines are `accrued` when
raised, the revenue report separates *collected* (money in the bank) from
*receivable* (earned, not yet settled).

Purchase responses carry `commissionDue`, `commissionPaid`, `awaitingCommission`
and the individual `commissions` lines, so every dashboard renders the invoice
on the deal itself: the buyer pays from their purchase-tracking card, the seller
from Track Payment, and the admin's advance button is disabled with the reason
on it rather than left live to fail.

### Payment gateway

Payments go through a driver interface with two implementations, chosen at
boot by whether `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are set:

- **`mock` (default)** — implements Razorpay's real protocol locally:
  server-created `order_…` ids and HMAC-SHA256 signatures over
  `orderId|paymentId`. The verification path the application depends on is
  therefore the genuine one; only the source of the signature differs. Works
  offline, with no account and no real money, and the dashboards show a
  non-dismissible TEST MODE banner.
- **`razorpay`** — the live driver. Talks to the REST API over `fetch` (no
  SDK dependency) and opens their hosted checkout widget in the browser.

Going live is a `.env` change, not a rewrite. Nothing outside
`src/modules/payments/gateway/` knows which driver is loaded.

Checkout is three calls, mirroring how a real gateway works:

```
POST /api/v1/billing/checkout   → server prices it, opens an order (nothing granted)
     … the customer pays in the gateway's widget …
POST /api/v1/billing/verify     → server verifies the signature, THEN unlocks it
```

A payment is only ever marked `paid` after `verifySignature()` returns true,
and fulfilment reads the payment's own `metadata` (recorded when the order was
opened) rather than anything the client sends back — so even a validly signed
response cannot redirect a ₹499 promotion payment into activating a Gold plan.
`POST /api/v1/payments/webhook` is the safety net for a customer who pays and
then closes the tab; it verifies the signature against the **raw** request body
(which is why `main.ts` enables `rawBody`).

### Endpoints

- `GET /api/v1/billing/catalog` — the published rate card + active gateway.
- `GET /api/v1/billing/summary` — one call that fills a seller's or buyer's
  billing page: plan, quota usage, promotable listings, invoices, history.
- `POST /api/v1/billing/checkout` / `POST /api/v1/billing/verify` — the flow above.
- `POST /api/v1/billing/demo-checkout/:orderId` — offline driver only; returns
  a genuine signature for the order. Refuses outright once real keys are set.
- `PATCH /api/v1/billing/subscription/cancel` — drop back to the free tier.
- `GET /api/v1/billing/revenue` (superuser) — collected by stream and by month,
  receivable, MRR, revenue per city, and the checkout conversion funnel.
- `GET /api/v1/commissions/mine` / `GET /api/v1/commissions` (superuser) /
  `PATCH /api/v1/commissions/:id/waive` (superuser write-off).
- `GET /api/v1/payments/mine` / `GET /api/v1/payments` (superuser ledger).

### Where it shows up

- **`seller-dashboard.html` → Billing & Plans** — plan cards with a
  monthly/quarterly/yearly switch, a live quota meter, promotion purchase,
  commission invoices, and receipts.
- **`Buyer Dashboard - truEstate.html` → Payments** — buyer-side commission
  invoices as full cards showing the arithmetic (deal value → rate → commission
  → GST), not table rows. The same invoice also appears inline on the
  Purchase Initiation card once the deal reaches Registration. Promoted listings
  carry a ★ badge in the browse list and sort to the top of search.
- **`superuser-dashboard.html` → Revenue** — the report above, charted with
  plain CSS (no chart library, no CDN).

Enforcement worth knowing about: creating a listing past your plan's quota
answers **402 Payment Required** (not 403) with the plan and usage in the body,
which is what the seller dashboard keys its upgrade prompt off.

**Every property on the account counts against the quota, sold and rented ones
included** — a plan caps the size of a seller's portfolio, not how many
listings happen to be open right now. Deleting a listing is the only way to
free a slot without upgrading. (An earlier version let a closed listing release
its slot; a seller holding two properties with one sold could then still add a
third, which reads exactly like the limit is broken.) The count comes from
`PropertiesService.countListingsForQuota()`, and `GET /billing/summary` reports
that same method rather than recomputing — a banner that disagrees with what
the server will accept is worse than no banner.

The seller dashboard shows the quota **before** the form (on Add Property and
My Listings), not only on rejection, and a 402 opens an upgrade prompt with the
form left filled in rather than a toast that fades in three seconds.

`npm run seed` puts the demo seller on Gold, because the 20-property sample
catalogue does not fit in the free tier's 2 slots.

## Seller submissions & document verification

Sellers (Role.USER with userType=seller) can submit listings too, via the same
`POST /api/v1/properties` endpoint — the backend branches on the caller's role:

- **Admin/superuser** creates a listing → auto-`verified`, owned via `adminId`.
- **Seller** creates a listing → starts `verificationStatus: pending`, owned
  via `sellerId`, and is **hidden from public search** until reviewed.
- Sellers may upload verification documents (deed, ID, etc.) to their own
  listing: `POST /api/v1/properties/:id/documents` (multipart, PDF/JPEG/PNG/WEBP,
  ≤10MB each, ≤10 files) — stored on disk under `uploads/property-documents/<id>/`
  and served statically at `/uploads/...`.
- **Admin/superuser** reviews everything via `GET /api/v1/properties/review-queue`
  (any verification state, seller name/email populated), then
  `PATCH /api/v1/properties/:id/verify` or `.../reject` (with an optional reason).
- A seller editing their own listing (`PATCH /api/v1/properties/:id`) resets it
  to `pending` for re-review. Sellers may only edit/delete their own
  submissions; admins/superusers can manage any property.

Frontend: `seller-dashboard.html`'s "Add New Property" form and "My Listings"
table, and `admin-dashboard.html`'s "Property Document Verification" tab, are
both wired to this end-to-end (previously both were fully local-only mocks
that never actually talked to each other — a seller's submission never
appeared for admin review, and the admin page's document viewer/verify/reject
buttons were built around a `#docModal` element that didn't exist in the page,
so they silently did nothing).

## What's wired to the real backend vs. what's still a demo

| Wired to the real API (MongoDB + JWT) | Still local demo data (unchanged) |
|---|---|
| `index.html` / `admin-login.html` / `superuser-login.html` — login, signup, forgot/reset password, live property listings with server-side filter + pagination | Buyer/Seller dashboards' bookings, shortlists, notifications |
| `admin-dashboard.html` — "Manage Listings" (property CRUD), "User Management" (list/create/delete), "Property Document Verification", "Negotiations", "Purchase Tracking" | Property *photo* uploads (still a placeholder — only verification *documents* are wired) |
| `seller-dashboard.html` — "Add New Property" (real submission + document upload), "My Listings" (real data, delete), and "Billing & Plans" (plans, promotions, invoices, receipts) | superuser-dashboard.html's "System Settings" tab (no backend concept for it) |
| `Buyer Dashboard - truEstate.html` — offer submission, Negotiate, Purchase Initiation, Purchased Vault, Payments | Block/Unblock on the admin Users table (cosmetic — no backend field for it) |
| `superuser-dashboard.html` — "User Management", "Property Operations" (both full CRUD) and "Revenue" | |

**Removed:** `seller-dashboard.html`'s "Site Visits" page and its nav entry —
sellers don't need to manage visit scheduling (only buyers request visits and
admins manage them), and the feature was non-functional to begin with (built
around a `seller-crud.js` file and `.visit-request-card` markup that never
existed in the page).

The remaining backend modules (`admins`, `bank-accounts`, `bookings`,
`buyers`, `notifications`, `property-documents`,
`property-images`, `reports`, `sellers`, `shortlists`, `visits`) persist their
records in MongoDB as well. Their protected routes use the JWT-based
`@ApiRole` guard and require a real bearer token.

## Verifying it works

```bash
# Register + login
curl -X POST http://127.0.0.1:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Secure@123","userType":"buyer"}'

curl -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@gmail.com","password":"123456789"}'

# Filter + paginate properties (public)
curl "http://127.0.0.1:3000/api/v1/properties?city=Chennai&type=apartment&page=1&limit=5"

# Create a property (admin only — use the accessToken from the admin login above)
curl -X POST http://127.0.0.1:3000/api/v1/properties \
  -H "Authorization: Bearer <token>" -H 'Content-Type: application/json' \
  -d '{"title":"3BHK in Anna Nagar","description":"A lovely 3BHK apartment close to schools.","type":"apartment","listingType":"sale","price":7500000,"areaSqft":1200,"bedrooms":3,"bathrooms":2,"address":"42 5th Ave","city":"Chennai","state":"Tamil Nadu"}'

# Seller submits a listing (starts pending, hidden from public search) + uploads a document
curl -X POST http://127.0.0.1:3000/api/v1/properties \
  -H "Authorization: Bearer <seller-token>" -H 'Content-Type: application/json' \
  -d '{"title":"Seller Submitted Villa","description":"A lovely villa awaiting admin verification.","type":"villa","listingType":"sale","price":8500000,"areaSqft":2200,"bedrooms":4,"bathrooms":3,"address":"22 Seller Lane","city":"Nagpur","state":"Maharashtra"}'

curl -X POST http://127.0.0.1:3000/api/v1/properties/<property-id>/documents \
  -H "Authorization: Bearer <seller-token>" -F "files=@deed.pdf"

# Admin reviews and verifies it
curl http://127.0.0.1:3000/api/v1/properties/review-queue?verificationStatus=pending \
  -H "Authorization: Bearer <admin-token>"

curl -X PATCH http://127.0.0.1:3000/api/v1/properties/<property-id>/verify \
  -H "Authorization: Bearer <admin-token>"
```

## Middleware

> A full write-up — every middleware, why it exists, what it does, and which log file records what —
> is kept outside this repository as **`middleware-and-logging.pdf`**
> (regenerate it from the `middleware-and-logging.html` beside it).

Every request passes through the chain below. The first three are **application-level**
(registered in `main.ts`, so they also cover static page loads); the rest are
**router-level**, bound to specific route groups in `AppModule.configure()`.

| # | Middleware | Type | Bound to | What it does |
|---|-----------|------|----------|--------------|
| 1 | `RequestContextMiddleware` | application | every request | Assigns a request id (or honours an incoming `X-Request-Id`), starts the latency timer, echoes the id on the response. Every log line carries it, so one `grep` reconstructs a whole request. |
| 2 | `HttpLoggerMiddleware` | application | every request | Writes **one line per request** to `logs/http/http-<date>.log` — method, path, status, latency, bytes, IP, user agent, and the authenticated user. Logged on the response's `finish`/`close` event, so the status and the caller are known. |
| 3 | `helmet` | application (security) | every request | Standard security response headers (HSTS, nosniff, frameguard, …). |
| 4 | `SecurityMiddleware` | router (`*`) | all `/api/v1/*` + `/health` | Strips MongoDB operator keys (`$ne`, `$where`, dotted paths) and prototype-pollution keys from body and query, rejects oversized URLs/bodies, drops `X-Powered-By`. Anything stripped is written to the audit log. |
| 5 | `AuthAuditMiddleware` | router | `AuthController` | Records every sign-in / registration / password-reset attempt and its outcome in `logs/audit/`. Never touches the password. |
| 6 | `AdminAuditMiddleware` | router | Admins, Users, Properties, Purchases, Payments, BankAccounts | Records every state-changing call (POST/PUT/PATCH/DELETE) with the acting user — the "who approved this listing" trail. |
| 7 | `UploadValidationMiddleware` | router | `POST /properties/:id/{documents,images}` | Runs **before** multer: rejects non-multipart bodies (415) and oversized requests (413) so nothing is streamed to disk, then audits what was actually stored. |
| 8 | multer via `FilesInterceptor` | file upload | the two upload routes | Disk storage under `uploads/<kind>/<propertyId>/`, random filenames, extension derived from the declared MIME type, MIME allow-list, per-file and per-request size caps — all from `common/upload/upload.config.ts`. |
| 9 | `ValidationPipe` | global pipe | every DTO | Whitelists, transforms and rejects unknown fields. |
| 10 | `HttpExceptionFilter` | error handling | every request | Turns any thrown value into the standard error envelope and writes the full failure (stack, redacted body, user, request id) to `logs/error/`. |
| 11 | `errorHandlerMiddleware` | error handling (Express) | last in the stack | The four-argument Express error handler, registered after the router. Catches what happens *outside* Nest's pipeline — static-asset failures, parser-level errors — which a filter never sees. |

Rate limiting (`ThrottlerGuard`) and CORS are configured globally alongside these.

## Log and error management

Logs are written to **files on disk**, in four separate channels, one directory each:

```
logs/
├── http/    http-2026-08-28.log     one line per HTTP request
├── error/   error-2026-08-28.log    every handled + unhandled error, with stack traces
├── app/     app-2026-08-28.log      application/framework output (bootstrap, Mongoose, services)
└── audit/   audit-2026-08-28.log    sign-ins, privileged writes, uploads, blocked payloads
```

Every timestamp — in the log files, in the error responses and on the console — is **India
Standard Time**, written as `2026-08-28T09:38:44.859+05:30`. The `+05:30` offset is applied
explicitly rather than read from the server clock, so a deployment on a UTC host still logs in
IST; keeping the offset on the string means it stays sortable and `new Date(...)` still parses it
back to the correct instant.

Each line is a JSON object, so the files can be read by eye *or* piped into `jq`:

```bash
tail -f logs/http/http-$(date +%F).log | jq -r '"\(.statusCode) \(.method) \(.url) \(.durationMs)ms"'
jq 'select(.statusCode >= 500)' logs/error/error-*.log
grep <request-id> logs/*/*.log          # the whole story of one request
```

How the writing works (`src/common/logging/file-logger.ts`):

- **Buffered, flushed at regular intervals** — lines are queued in memory and written
  every `LOG_FLUSH_INTERVAL_MS` (default 5s), keeping a synchronous disk write off the
  request path. **Errors bypass the buffer** and are written immediately, and the buffer
  is also flushed early once `LOG_MAX_BUFFERED_LINES` pile up.
- **Rotation** — a new file per day (rolling over at **IST midnight**), plus size-based rolling to
  `<name>.1.log` once a file would pass `LOG_MAX_FILE_SIZE_MB` (default 5MB).
- **Retention** — files older than `LOG_RETENTION_DAYS` (default 14) are pruned automatically.
- **Nothing is lost on exit** — `SIGTERM`/`SIGINT`, `uncaughtException` and
  `unhandledRejection` all flush the buffer before the process goes away.
- **Secrets never reach disk** — passwords, tokens and OTPs in a failed request body are
  replaced with `[REDACTED]`; `Authorization` and `Cookie` headers likewise.

Every error response also carries a `requestId` the user can quote, which matches the
entry in both `logs/http/` and `logs/error/`.

### Reading the logs over the API

```bash
GET /api/v1/logs                 # every channel, its files and their sizes   (admin/superuser)
GET /api/v1/logs/http?lines=50   # tail the current file
GET /api/v1/logs/error?level=error&lines=20
GET /api/v1/logs/audit?file=audit-2026-08-27.log
```

All logging is configurable from `.env` — see the `LOG_*` block in `.env.example`.

## Tests

```bash
npm test         # unit tests (42 suites, 92 tests)
npm run test:e2e
```

## Environment note

If this project was transferred via AirDrop/WhatsApp/etc., macOS may quarantine
native binaries inside `node_modules`, breaking `npm test`/postinstall scripts
with `bad interpreter: Operation not permitted`. Fix with:

```bash
xattr -dr com.apple.quarantine node_modules
```
