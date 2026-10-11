# truEstate Admin Portal (React)

The admin frontend (`admin-login.html`, `admin-dashboard.html` and
`admin-dashboard.css`) is now a React app built with Vite. The backend is
unchanged: it still serves everything in `front-end/`, so the compiled app in
`front-end/admin/` is available at `http://127.0.0.1:3001/admin/`.

The old URLs still work. `admin-login.html` and `admin-dashboard.html` are now
small redirect pages, so `index.html`, `app.js` and the backend's startup banner
keep linking to them.

## Run / build

```bash
cd front-end/admin-react
npm install
npm run dev      # http://localhost:5173 — /api and /uploads are proxied to :3000
npm run build    # writes the production build to front-end/admin/
```

Start the backend as usual. The admin portal is then at
`http://127.0.0.1:3001/admin-login.html`, which redirects to `/admin/#/login`.
Run `npm run build` again after changing anything in `src/`.

## Folder structure

```
admin-react/
├── index.html, vite.config.js, package.json
├── public/favicon.ico
└── src/
    ├── main.jsx, App.jsx        entry point + route table
    ├── api/                     session storage, fetch wrapper, endpoint list
    ├── context/                 toasts, session watcher, admin profile
    ├── hooks/                   data loading + 15-second live refresh
    ├── components/              layout and reusable UI (modals, cards, form fields…)
    ├── pages/                   one file per admin section
    ├── utils/                   formatting + validation helpers
    └── styles/admin.css         all styles (original values + responsive rules)
```

## Routes (old section → React page)

| URL (`/admin/#…`)         | Page                       | Old `data-section`   |
|---------------------------|----------------------------|----------------------|
| `/login`                  | `LoginPage.jsx`            | admin-login.html     |
| `/dashboard`              | `DashboardHome.jsx`        | `dashboard`          |
| `/users`                  | `UserManagement.jsx`       | `users`              |
| `/property-verification`  | `PropertyVerification.jsx` | `property-mgmt`      |
| `/listings`               | `ManageListings.jsx`       | `properties-crud`    |
| `/buyers`                 | `CurrentBuyers.jsx`        | `current-buyers`     |
| `/sellers`                | `CurrentSellers.jsx`       | `current-sellers`    |
| `/explore-sellers`        | `ExploreSellers.jsx`       | `explore-sellers` (no menu link, as before) |
| `/visits`                 | `ScheduledVisits.jsx`      | `schedule`           |
| `/negotiations`           | `Negotiations.jsx`         | `negotiations`       |
| `/purchases`              | `PurchaseTracking.jsx`     | `purchase-tracking`  |
| `/notifications`          | `Notifications.jsx`        | `notifications`      |
| `/profile`                | `Profile.jsx`              | `profile`            |

## What each file does

### Entry and routing
- **`main.jsx`**: mounts the app inside `HashRouter` and `ToastProvider`. It uses
  hash URLs (`#/users`) so the static backend needs no route fallback.
- **`App.jsx`**: the route table. `/login` is public. All other routes are
  wrapped in `ProtectedRoute` (admin only) and rendered inside `AdminLayout`.

### `api/`
- **`session.js`**: stores the logged-in admin under the same key
  (`truEstate_user`) and in the same way as `app.js` (sessionStorage per tab,
  with localStorage as a seed). `isAdminSession()` is the RBAC check.
- **`client.js`**: `api()` is the fetch wrapper ported from `TruEstate.api`.
  It adds the Bearer token and unwraps `{ success, message, data }`. On failure
  it throws an error carrying `.status` and `.errors`. A 401/403 that says
  "blocked" or "no longer exists" triggers `forceSignOut()`, which shows an
  alert and returns to the login page.
- **`adminApi.js`**: one function per backend endpoint the admin uses (see the
  API table below).

### `context/`
- **`ToastContext.jsx`**: `useToast()` returns `showToast(message, 'error'?)`.
  It replaces the global `showToast` from `app.js`.
- **`SessionContext.jsx`**: if this tab's session disappears or switches to
  another account, it covers the page with the "This session changed" overlay
  (ported from `TruEstate.onSessionChanged`).
- **`AdminProfileContext.jsx`**: the admin's name, avatar initials and city
  label for the sidebar, plus the Profile form values. The data is the account
  name/email merged with `localStorage.adminProfile`, exactly as before.

### `hooks/`
- **`useLiveRefresh.js`**: the port of `TruEstate.startLiveRefresh`. It polls
  every 15 seconds while the tab is visible, refreshes when the tab or window
  regains focus, and stops if the session changed.
- **`useAdminData.js`**: loads a page's data and returns
  `{ status, data, error, reload }`. `reload()` shows "Loading…" (used after
  actions). `reload(true)` refreshes silently (used by live refresh).
- **`useAdminSellers.js`**: groups the property review queue by seller and
  finds prospect sellers in `/users`. Used by Current Sellers and Explore Sellers.

### `components/` (reusable)
- **`AdminLayout.jsx`**: sidebar plus the page area, the mobile top bar and
  drawer, and Logout. Provides the session and profile contexts.
- **`Sidebar.jsx`**: navigation with the active highlight and green indicator,
  the collapsible "Sellers" group, and the admin card.
- **`ProtectedRoute.jsx`**: redirects any non-admin to `/login`.
- **`PageHeader.jsx`**: the black header with title, subtitle, and an optional
  icon or action button.
- **`Modal.jsx`**: dialog with backdrop. Closes on backdrop click or Escape.
- **`FormField.jsx`**: label, input/select/textarea and inline error. It also
  applies the live input restrictions (letters only, numbers only, lowercase
  email) and shows a hint, as `form-validation.js` did.
- **`PillFilters.jsx`**: All / Pending / … filter buttons with optional counts.
- **`StatCard.jsx`**: `StatCard` (dashboard KPI) and `SummaryCard` (verification totals).
- **`StateMessage.jsx`**: Loading / empty / error messages for lists.
- **`DealProgress.jsx`**: the 5-step purchase tracker.
- **`AddUserModal.jsx`**: `POST /users`. Only the "user" role can be chosen.
- **`EditPropertyModal.jsx`**: `GET` then `PATCH /properties/:id`.
- **`PropertyDetailsModal.jsx`** / **`SellerContactModal.jsx`**: the two
  dialogs on Current Sellers.
- **`ForgotPasswordModal.jsx`**: `POST /auth/forgot-password`.
- **`SessionChangedOverlay.jsx`**: the full-screen "This session changed" notice.
- **`Icons.jsx`**: the inline SVG icons from the old HTML.

### `pages/`
- **`LoginPage.jsx`**: `POST /auth/login`. Rejects non-admin roles, stores the
  session, updates `globalUsers`, then opens the dashboard.
- **`DashboardHome.jsx`**: the three KPI cards (static, as in the original).
- **`UserManagement.jsx`**: user table with search, role filter, Add User,
  Block/Unblock (`PATCH isBlocked`) and Delete. Superusers are shown as protected.
- **`PropertyVerification.jsx`**: review queue with totals, filter and search,
  photos and private documents. Verify uses `PATCH /verify`. Reject asks for a
  reason, then calls `PATCH /reject`.
- **`ManageListings.jsx`**: paginated listings (8 per page) with Edit and
  Delete. There is no "Add" because sellers create listings.
- **`CurrentBuyers.jsx`**: buyers built from the negotiation, visit and purchase
  queues.
- **`CurrentSellers.jsx`** / **`ExploreSellers.jsx`**: sellers on this desk,
  and prospect sellers.
- **`ScheduledVisits.jsx`**: Upcoming / Completed / Cancelled tabs with
  Confirm, Reschedule, Mark Completed and Cancel.
- **`Negotiations.jsx`**: read-only oversight with a status filter.
- **`PurchaseTracking.jsx`**: deal progress with Advance and Cancel. Advance is
  disabled while commission is unpaid.
- **`Notifications.jsx`**: the five static notification cards from the old page.
- **`Profile.jsx`**: profile card plus an editable form with validation
  (required fields, phone, email, DOB from 1900 to today). Saves to localStorage.

### `utils/` and `styles/`
- **`format.js`**: ₹ formatting (`fmtInr`, `formatINR`, `rupees`), initials,
  dates, avatar colours.
- **`validation.js`**: rules ported from `form-validation.js`: email and phone
  checks, input restrictions, DOB limits, and `validate()`.
- **`sellerStatus.js`**: labels and colours for verification status.
- **`styles/admin.css`**: all styles, using the original colours and sizes.
  Includes the old `admin-dashboard.css` classes and new responsive rules
  (drawer sidebar below 900px; grids collapse on phones; tables scroll).

## Backend APIs used (unchanged)

| Feature | Method & path |
|---|---|
| Login / forgot password | `POST /auth/login`, `POST /auth/forgot-password` |
| Users | `GET /users`, `POST /users`, `PATCH /users/:id` (`isBlocked`), `DELETE /users/:id` |
| Listings | `GET /properties?page&limit[&city]`, `GET /properties/:id`, `PATCH /properties/:id`, `DELETE /properties/:id` |
| Verification | `GET /properties/review-queue`, `PATCH /properties/:id/verify`, `PATCH /properties/:id/reject` |
| Negotiations | `GET /negotiations/review-queue` |
| Purchases | `GET /purchases/review-queue`, `PATCH /purchases/:id/advance`, `PATCH /purchases/:id/cancel` |
| Visits | `GET /visits/review-queue`, `PATCH /visits/:id/confirm` · `/reschedule` · `/complete` · `/cancel` |

Every request sends `Authorization: Bearer <JWT>`. The backend enforces the
admin role and city ownership on each endpoint.

## Intentional differences from the old pages
- **Edit Property now saves.** The old form also sent `state`, which the
  backend rejects ("property state should not exist") because it derives the
  state from the city. Every save on the old page failed. State is now shown
  read-only and is not sent.
- Each section has its own URL, so reloading the page keeps you on the same
  section.
- Responsive layout for tablets and phones. Toasts no longer block clicks on
  the buttons under them.
- Input restrictions are applied per field instead of by guessing from the
  element id. This avoids two old bugs: "Area (sqft)" was letters-only, so
  digits were wiped, and the property Title stripped digits (e.g. "3BHK").
- Not carried over: unreachable demo sections with invented data (`My Active
  Properties`, `Property Inquiries`, `Messages`) and the never-opened "Edit
  Profile" modal. The Profile page covers the same fields.
