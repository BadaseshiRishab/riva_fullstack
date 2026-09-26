# RIVA Store: Website, Security, and Performance Walkthrough

**Audience:** Technical reviewer
**Language:** English
**Target duration:** 6-7 minutes

## Before Recording

- Start on the working storefront at `http://localhost:3001`. Confirm the backend can reach MongoDB and that login, product loading, and the selected demo flow work before recording.
- Use local/disposable data and COD or Razorpay test mode only. Do not show real credentials, `.env` contents, access tokens, personal data, or payment details.
- Avoid running `backend/seed.js` against a shared database; it replaces catalog data.
- Keep the browser visible for the user flow, then switch to the relevant source file. Keep each code excerpt brief and readable.
- This is a source-code walkthrough, not a penetration test or a measured performance benchmark.

## Timed Script

### 0:00-0:35 | What the Website Does

**Show:** Storefront, then `frontend/src/App.js`, `backend/server.js`, and `backend/config/db.js`.

**Say:**

“This is RIVA Store, a full-stack shopping website. A customer can browse products, save items to a wishlist, manage a cart, place an order, and track that order. There is also an admin area for managing products and orders. The frontend is built with React and Redux, the API uses Express and MongoDB, and Razorpay is available for online payments. I’ll follow a customer flow, then look at how access control and payment handling work, and finish with security and performance findings from the code.”

### 0:35-1:15 | Browse and Shop

**Show:** Open a category, product detail, wishlist, and cart. In the editor, show `frontend/src/pages/Men.js`, `frontend/src/components/ProductSection.js`, and `frontend/src/components/ProductItem.js`.

**Say:**

“The category pages load product data through the API and then filter the catalog by category in the frontend. Product cards connect browsing to the wishlist and cart. This keeps the interactions easy to follow, but it means the browser currently receives the full catalog before filtering. That is reasonable for a small demo catalog; for a much larger catalog, filtering and pagination should move to the API.”

### 1:15-2:00 | Login and Session Security

**Show:** Sign in with a demo account, then show `backend/models/User.js`, `backend/middleware/authMiddleware.js`, and the login/session code in `frontend/src/App.js`.

**Say:**

“Passwords are hashed with bcrypt before they are saved, and login compares the submitted password with the stored hash. Protected API routes verify a bearer JWT, reload the user from the database, and exclude the password field. The generated token expires after seven days. On the frontend, the token is stored in localStorage and used when restoring a session. That is convenient, but JavaScript-accessible storage means an XSS vulnerability could expose the token. Also, the backend falls back to a hard-coded JWT secret if configuration is missing, so production should fail to start without a strong secret instead.”

### 2:00-3:25 | Checkout and Payment Integrity

**Show:** Place a COD test order, or use Razorpay test mode if already configured. Show the order creation and payment handlers in `backend/server.js`; do not reveal request headers or payment credentials.

**Say:**

“For a Razorpay order, the server looks up each product and calculates the payment amount from database prices. The order endpoint also computes an HMAC signature and rejects a signature that does not match. During order creation, stock is decremented only when enough inventory remains, using a conditional database update.

“There is an important gap here. The final order endpoint accepts the total sent by the client and stores that value, instead of recalculating it from the normalized database products. It checks the signature for the submitted Razorpay order and payment IDs, but does not independently confirm that the payment order belongs to this user or that its amount matches this order. COD totals are also client supplied. Before production, the server should calculate every order total itself and verify the payment order, amount, and user association on the server.”

### 3:25-4:15 | Order History and Ownership

**Show:** Open the customer’s orders. If the demo data permits, show a cancellation or return request. Then show `/api/orders` and the cancellation/return handlers in `backend/server.js`.

**Say:**

“Order history is queried using the authenticated user’s ID, and cancellation and return requests look up the order using both its ID and that same user ID. This is an important server-side ownership check: hiding another customer’s order in the interface would not be enough. The API also checks whether an order is in a state that can be cancelled or returned.”

### 4:15-4:55 | Admin Authorization

**Show:** Open `frontend/src/pages/AdminDashboard.js`, then show an admin API route in `backend/server.js`.

**Say:**

“The admin dashboard supports catalog and order management. The frontend redirects users without an admin role, but that is only a user-interface behavior. The important enforcement happens in the API: admin routes check the authenticated role before changing products or orders. The server-side check is what protects these operations.”

### 4:55-6:35 | Security and Performance Findings

**Show:** Briefly show the JWT configuration in `backend/server.js`, the CORS setup and `docker_compose.yml` without displaying secret values, then `backend/server.js`, `frontend/src/components/ProductItem.js`, `frontend/src/App.js`, and the refresh effect in `frontend/src/pages/AdminDashboard.js`.

**Say:**

“The positive security controls are bcrypt password hashing, JWT-protected routes, server-side admin checks, user-scoped order operations, Razorpay signature verification, and conditional stock updates. The main improvements are to remove the default JWT-secret fallback, restrict allowed CORS origins, avoid exposing development database ports, protect credentials and demo accounts, and add authentication rate limits and security headers. The example configuration and seed/demo login should never be treated as production credentials.

“For performance and scale, product and admin-order endpoints currently return full collections without pagination, category filtering is client-side, and product images are plain image elements without lazy loading or responsive source sizes. Routes are imported eagerly, and the admin dashboard refreshes its data every 15 seconds. Potential improvements include API pagination and filtering, responsive lazy-loaded images, route-level code splitting, and a refresh strategy that updates only when needed.

“These are observations from reading the implementation. I have not run a penetration test or measured performance, so I’m not presenting them as test results. Overall, RIVA demonstrates the main storefront and administration flows, with clear next steps for production security and scaling.”

## Recording Notes

- If a demo action fails, narrate the intended flow from the source rather than showing tokens, credentials, or production data.
- Keep code zoomed enough to read the relevant handler; avoid scrolling through secrets or unrelated files.
- Suggested closing slide: **Implemented controls**, **Security gaps to address**, and **Performance improvements to measure**.