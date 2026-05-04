# Evaluation 4 Frontend Integration

This frontend is connected to the NestJS backend at `http://localhost:3000/api/v1`.

- `api.js` centralizes all REST calls and sends the required `role` header.
- `evaluation4-integration.js` replaces local mock CRUD flows with backend calls for property, user, shortlist, visit, booking, and negotiation actions.
- `server.js` serves the static frontend correctly from `http://localhost:5500`.

Run the backend from `root/back-end`, then run the frontend from `root/front-end`.
