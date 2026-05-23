# MK Group Properties

React, Express.js and MongoDB real estate listing app.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and update values if needed.

3. Start MongoDB locally, then run:

```bash
npm run dev
```

The React app runs on `http://localhost:8080` and the API runs on `http://localhost:5000`.

The first registered user becomes an admin automatically. You can also set `ADMIN_EMAIL` in `.env`.
