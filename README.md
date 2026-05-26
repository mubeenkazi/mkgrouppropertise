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

## Vercel deployment

Set these environment variables in Vercel before deploying:

```bash
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<a long random secret>
ADMIN_EMAIL=<admin email address>
CLIENT_ORIGIN=https://your-vercel-domain.vercel.app
BLOB_READ_WRITE_TOKEN=<your Vercel Blob token>
```

Vercel runs the Express API from `api/[...path].js`, so `/api/lands` and the other API routes work in production.

Uploaded listing photos are stored in Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set.
