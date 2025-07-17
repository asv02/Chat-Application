# Chat Application Backend

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture Overview](#architecture-overview)
- [Setup & Run](#setup--run)
- [Queue System (p-queue)](#queue-system-p-queue)
- [Gemini API Integration](#gemini-api-integration)
- [Assumptions & Design Decisions](#assumptions--design-decisions)
- [Testing via Postman](#testing-via-postman)

---

## Project Overview
This is the backend for a chat application supporting user authentication, chatrooms, messaging, Gemini AI integration, Stripe-based subscriptions, and rate-limiting for Basic users.

---

## Architecture Overview
- **Node.js/Express**: Main server framework for RESTful APIs.
- **Sequelize**: ORM for PostgreSQL database models (User, Chat, Message, etc.).
- **JWT Authentication**: All protected routes require a Bearer token in the `Authorization` header.
- **Gemini API**: Used for AI-powered chat responses.
- **Stripe**: Handles Pro subscription payments and webhook events.
- **node-cache**: Used for caching chatroom lists and rate-limiting Basic users.
- **p-queue**: Used for in-memory queueing and concurrency control of Gemini API calls.
- **Modular Structure**: Organized into `models/`, `middleware/`, `router/`, `utils/`, and `src/`.

**Directory Structure:**
```
Backend/
  src/
    app.js           # Main entry point
  router/            # Route handlers (user, chat, payment)
  middleware/        # Custom middleware (auth, error handling, etc.)
  utils/
    database.js      # Sequelize instance/config
  ...
```

---

## Setup & Run

### 1. Clone the Repository
```sh
git clone <repo-url>
cd chatApp/Backend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in `Backend/` with:
```
GEMINI_API_KEY=your-gemini-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PRO_PRICE_ID=your-stripe-price-id
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
DATABASE_URL=your-database-url
```

### 4. Run the Server
```sh
npm start
```
The server will start on `http://localhost:3000` by default.

---

## Queue System (p-queue)

**Purpose:**
- Manages concurrency and rate-limiting for Gemini API calls using an in-memory queue.
- Ensures the server does not exceed Gemini API rate limits and remains responsive.

**How it works:**
- When a user sends a message requiring a Gemini AI response, the Gemini API call is added to a `p-queue` instance.
- The queue controls how many Gemini API calls are processed at once (e.g., only a set number concurrently).
- This prevents overloading the Gemini API and helps with rate-limiting.

**Benefits of p-queue:**
- Simple, promise-based queueing for Node.js.
- No external dependencies or services required (unlike Redis/BullMQ).
- Ideal for lightweight, single-process queueing and concurrency control.

**How to Run:**
- No extra setup is needed for `p-queue`—it runs in-process with your Node.js server.
- Just start your backend as usual:
  ```sh
  npm start
  ```

**Design Note:**
- For distributed queueing or persistence, a system like BullMQ/Redis may be considered in the future.
- For most use-cases with moderate concurrency, `p-queue` is simple and effective.

---

## Gemini API Integration
- Uses the official [@google/genai](https://ai.google.dev/gemini-api/docs/quickstart) SDK.
- Gemini is called asynchronously (via the p-queue system) to generate AI-powered chat responses.
- Gemini responses are saved as messages in the chatroom.
- API key is loaded from environment variable `GEMINI_API_KEY`.
- The integration is designed to be scalable and non-blocking for users.

---

## Assumptions & Design Decisions
- **User Identification:** Users are uniquely identified by their contact number.
- **Subscription Tiers:** `BASIC` (default, 5 messages/day) and `PRO` (unlimited, via Stripe subscription).
- **JWT Payload:** Contains the user's contact number for authentication.
- **Rate Limiting:** Enforced in-memory for Basic users (can be swapped for Redis in production).
- **Caching:** Chatroom lists are cached per user for 5 minutes to reduce DB load.
- **Stripe Webhooks:** Used to upgrade/downgrade user subscription status.
- **Environment Variables:** All secrets and config (Stripe, Gemini, DB, etc.) are loaded from `.env`.
- **Modularization:** Code is organized for scalability and maintainability.

---

## Testing via Postman

### 1. Authentication
- Obtain a JWT by logging in (see your login endpoint).
- For all protected routes, set the header:
  ```
  Authorization: Bearer <access_token>
  ```

### 2. Chatroom Endpoints
- **Create Chatroom:**
  - `POST /chatroom`
- **List Chatrooms:**
  - `GET /chatroom`
- **Send Message:**
  - `POST /chatroom/:id/message` (rate-limited for BASIC users)
- **Check Subscription:**
  - `GET /subscription/status`

### 3. Stripe Subscription
- **Start Pro Subscription:**
  - `POST /subscribe/pro`
- **Webhook:**
  - `/webhook/stripe` (use Stripe CLI to test)

### 4. Gemini Integration
- Send a message in a chatroom; Gemini's response will be generated and saved asynchronously.
- Fetch chatroom messages to see the AI response.

---

*This backend is under active development. See `package.json` for dependencies and scripts.*