# truEstate Seller Portal (React)

The seller frontend (`seller-dashboard.html`, `seller-dashboard.css` and seller workflows) is now a React app built with Vite. The backend is unchanged: it serves everything in `front-end/`, so the compiled app in `front-end/seller/` is available at `http://127.0.0.1:3001/seller/` (and on port `:3000`).

The original URLs still work seamlessly. `seller-dashboard.html` and `seller-login.html` are redirect pages, so `index.html`, `app.js` and external bookmarks redirect directly to the seller React dashboard.

## Run / Build

```bash
cd front-end/seller-react
npm install
npm run dev      # http://localhost:5175 — /api and /uploads are proxied to :3000
npm run build    # writes the production build to front-end/seller/
```

Start the backend as usual. The seller portal is available at:
`http://127.0.0.1:3000/seller/#/dashboard` or via `http://127.0.0.1:3000/seller-dashboard.html`.

## Folder Structure

```
seller-react/
├── index.html, vite.config.js, package.json
├── public/favicon.ico
└── src/
    ├── main.jsx, App.jsx        entry point + route table
    ├── api/                     session storage, fetch client, seller endpoints
    ├── context/                 toasts, session watcher, seller profile, checkout modal
    ├── hooks/                   live refresh hook (15s polling + on-focus)
    ├── components/              layout, sidebar, modals, cards, icons, stat cards
    ├── pages/                   LoginPage, DashboardHome, MyListings, AddProperty,
    │                            Negotiations, TrackPayments, SoldProperties,
    │                            RentGivenProperties, BillingPlans, Notifications, Profile
    ├── utils/                   formatting (INR, dates, initials, launch cities)
    └── styles/seller.css        rich dark-mode Spotify theme tokens & responsive rules
```

## Routes (Old Section → React Route)

| URL (`/seller/#…`)  | Page                     | Description |
|---------------------|--------------------------|-------------|
| `/login`            | `LoginPage.jsx`          | Seller authentication, registration & password reset |
| `/dashboard`        | `DashboardHome.jsx`      | Portfolio KPIs, recent listings, quota monitor |
| `/my-listings`      | `MyListings.jsx`         | All properties with status filters, photos, documents & delete |
| `/add-property`     | `AddProperty.jsx`        | Multi-step property creation with photo & document uploads |
| `/negotiate`        | `Negotiations.jsx`       | Buyer offer review, counter-offers & accept/reject |
| `/track-payment`    | `TrackPayments.jsx`      | Deal pipeline tracker & row-level commission payments |
| `/sold`             | `SoldProperties.jsx`     | Completed sales showcase, revenue & average sale price |
| `/rent-given`       | `RentGivenProperties.jsx`| Completed rental leases & monthly rental revenue |
| `/billing`          | `BillingPlans.jsx`       | Subscription tiers, promotional boosts, invoices & receipts |
| `/notifications`    | `Notifications.jsx`      | Real-time alerts on approvals, offers & bookings |
| `/profile`          | `Profile.jsx`            | Personal information sync & password change |

## API Endpoints Used

- `POST /auth/login`, `POST /auth/register`, `POST /auth/forgot-password`: Seller authentication
- `GET /properties/mine`: Retrieve seller's own submissions
- `POST /properties`: Submit new listing
- `POST /properties/:id/images`: Upload public property photos
- `POST /properties/:id/documents`: Upload private verification documents
- `DELETE /properties/:id`: Delete property listing
- `GET /negotiations/seller-queue`: Buyer negotiations queue
- `PATCH /negotiations/:id/accept`, `PATCH /negotiations/:id/reject`, `PATCH /negotiations/:id/counter`: Respond to offers
- `GET /purchases/seller-queue`: Deal pipeline progression
- `GET /billing/catalog`, `GET /billing/summary`: Plans, promotions, quotas & spend
- `POST /billing/checkout`, `POST /billing/verify`: Plan upgrade, listing promotions & commission checkout
- `PATCH /billing/subscription/cancel`: Downgrade to Starter tier
- `PATCH /auth/change-password`: Security password update
