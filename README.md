# RIVA Store

RIVA Store is a full-stack e-commerce demo built with React, Redux, Express, and MongoDB. Customers can browse a product catalog, manage a cart and wishlist, create an account, place and track orders, and request cancellations or returns. An admin dashboard supports product and order management. Razorpay integration is available for online payments when configured.

> This repository is a development/demo application, not a production-hardened store. Read [Security and Performance Notes](#security-and-performance-notes) before deploying it or using real customer or payment data.

## Features

- Product browsing across categories, with product details, cart, and wishlist.
- Customer registration, login, profile, order history, cancellation, and return requests.
- Admin product management and order/return workflows.
- Cash-on-delivery orders and optional Razorpay checkout.
- Redux state persistence in the browser.

## Technology

- **Frontend:** React, React Router, Redux Toolkit, Create React App
- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs
- **Database:** MongoDB
- **Payments:** Razorpay (optional; use test mode for development)
- **Containers:** Docker Compose configuration is provided in `docker_compose.yml`.

## Requirements

- Node.js and npm
- MongoDB running locally, or Docker with Docker Compose
- Razorpay test credentials only if testing online payments

## Run Locally

The frontend and backend run as separate processes. MongoDB must be available at the URI configured for the backend.

### 1. Configure and start the backend

In PowerShell:

```powershell
Set-Location backend
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Edit `.env` and set a unique, strong `JWT_SECRET`. The default `MONGO_URI` is `mongodb://localhost:27017/ShoppingWebsite`. Razorpay variables may remain unset if you only need the non-payment flows; configure valid Razorpay **test** credentials to exercise online checkout.

Start the API:

```powershell
npm run dev
```

The API listens on `http://localhost:5000` by default. Its health route is `http://localhost:5000/`.

### 2. Start the frontend

Open a second terminal:

```powershell
Set-Location frontend
npm install
npm start
```

Create React App normally opens `http://localhost:3000`. If that port is occupied, it may offer another port. The frontend API client defaults to `http://localhost:5000/api`; set `REACT_APP_API_URL` before starting the frontend if your API uses a different URL.

## Seed Demo Data

From `backend/`, run:

```powershell
npm run seed
```

**Warning:** the seed script creates demo user/admin accounts and deletes and recreates the entire product catalog, resetting seeded product stock. Run it only against a disposable local database. The demo credentials in the source are fixed and weak; never use them outside local development or expose them publicly.

## Docker Compose

The Compose file starts MongoDB, the backend, and the frontend. In PowerShell, from the repository root:

```powershell
$env:PUBLIC_IP_HOST_MACHINE = "localhost"
docker compose -f docker_compose.yml up --build
```

Open `http://localhost:3000`; the API is exposed on port `5000`. The Compose configuration is for development only: it includes a fixed JWT secret, placeholder payment credentials, and exposes MongoDB without database authentication. Do not deploy it as-is or use it with real customer data. Stop the services with `docker compose -f docker_compose.yml down`.

## Useful Commands

Run these from the corresponding `frontend/` or `backend/` directory:

| Command | Purpose |
| --- | --- |
| `npm start` | Start the React development server (`frontend/`) |
| `npm run build` | Create an optimized frontend build (`frontend/`) |
| `npm test -- --watchAll=false` | Run frontend tests once (`frontend/`) |
| `npm run dev` | Start the backend with Nodemon (`backend/`) |
| `npm start` | Start the backend with Node (`backend/`) |
| `npm run seed` | Seed demo accounts and replace the product catalog (`backend/`) |

There is no backend test script currently defined in `backend/package.json`.

## API Overview

The API is mounted under `/api`:

| Area | Routes |
| --- | --- |
| Authentication and profile | `POST /register`, `POST /login`, `POST /admin/login`, `GET /me`, `PUT /me` |
| Catalog | `GET /products`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id` |
| Customer orders | `POST /orders`, `GET /orders`, `PATCH /orders/:id/cancel`, `POST /orders/:id/return-request` |
| Admin orders | `GET /admin/orders`, `PATCH /admin/orders/:id/status`, `PATCH /admin/orders/:id/return` |
| Razorpay | `POST /payments/razorpay/order` |

Protected routes require a bearer token. Product creation, editing, deletion, and admin order operations additionally require the admin role.

## Security and Performance Notes

Some useful protections are implemented: passwords are hashed with bcrypt, protected API routes verify JWTs, admin operations check the role on the server, customer order queries are scoped to the authenticated user, and the Razorpay flow checks a payment signature. Stock decrements use a conditional database update.

Important limitations remain:

- The backend falls back to a hard-coded JWT secret if `JWT_SECRET` is missing. Configure a strong secret and change the application to reject missing production configuration before deployment.
- The order endpoint stores a client-supplied total rather than recalculating the final total from database prices. Payment verification also does not fully check that the payment order, amount, and user match the order being created. Do not use this implementation for real payments without correcting and testing those checks.
- CORS is permissive, and the API does not configure authentication rate limiting or common security-header middleware. The frontend stores its bearer token and application state in localStorage.
- The Compose setup exposes MongoDB without authentication and contains development-only configuration. Do not commit real credentials; `backend/.env` is git-ignored.
- Catalog and admin-order endpoints return full collections without pagination; category filtering happens in the browser. Product images do not currently use lazy loading or responsive source sizes, routes are imported eagerly, and the admin dashboard polls every 15 seconds.

These are source-code observations, not penetration-test findings or performance measurements. Benchmark the app with representative data before making performance claims, and complete a security review before any production deployment.