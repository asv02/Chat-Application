# ChatApp Backend

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture Overview](#architecture-overview)
- [Gemini API Integration](#gemini-api-integration)
- [Assumptions & Design Decisions](#assumptions--design-decisions)
- [Setup & Run](#setup--run)
- [Testing via Postman](#testing-via-postman)
- [Access & Deployment](#access--deployment)

---

## Project Overview
This is the backend for a chat application supporting user authentication, chatrooms, messaging, Gemini AI integration, Stripe-based subscriptions, and rate-limiting for Basic users.

---

## Architecture Overview
- **Node.js/Express**: Main server framework.
- **Sequelize**: ORM for database models (User, Chat, Message, etc.).
- **JWT Authentication**: All protected routes require a Bearer token in the `Authorization` header.
- **Gemini API**: Used for AI-powered chat responses.
- **Stripe**: Handles Pro subscription payments and webhook events.
- **node-cache**: Used for caching chatroom lists and rate-limiting Basic users.
- **Modular Structure**: Organized into `models/`, `middleware/`, `router/`, `utils/`, and `src/`.

---

## Gemini API Integration
- Uses the official [@google/genai](https://ai.google.dev/gemini-api/docs/quickstart) SDK.
- Gemini is called asynchronously (can be offloaded to a queue for scale).
- Gemini responses are saved as messages in the chatroom.
- API key is loaded from environment variable `GEMINI_API_KEY`.

---

## Assumptions & Design Decisions
- **User Identification**: Users are uniquely identified by their contact number.
- **Subscription Tiers**: `BASIC` (default, 5 messages/day) and `PRO` (unlimited, via Stripe subscription).
- **JWT Payload**: Contains the user's contact number for authentication.
- **Rate Limiting**: Enforced in-memory for Basic users (can be swapped for Redis in production).
- **Caching**: Chatroom lists are cached per user for 5 minutes to reduce DB load.
- **Stripe Webhooks**: Used to upgrade/downgrade user subscription status.
- **Environment Variables**: All secrets and config (Stripe, Gemini, DB, etc.) are loaded from `.env`.

---

## Setup & Run

### 1. Clone the Repository
```
git clone <repo-url>
cd chatApp/Backend
```

### 2. Install Dependencies
```
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
```

### 4. Run the Server
```
npm start
```

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

---

## Access & Deployment

### Local Access
- The backend runs on `http://localhost:3000` by default.
- Use Postman or your frontend to interact with the API.

### Deployment
- Set all environment variables in your production environment.
- Use a process manager (e.g., PM2) for production.
- For distributed setups, use Redis for caching and queues.
- Register your Stripe webhook endpoint in the Stripe dashboard.
- Secure your `.env` and never commit secrets to version control.

---