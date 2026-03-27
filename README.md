# Talé

Hotel booking stack: **Express + MongoDB** API and **Next.js** (App Router) frontend.

## Prerequisites

- Node.js 18+ (global `fetch` for utility scripts)
- MongoDB

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | No | Default `mongodb://localhost:27017/tale` |
| `JWT_SECRET` | **Yes in production** | Random string, **32+ characters** |
| `CORS_ORIGIN` | **Yes in production** | Comma-separated allowed origins (e.g. `https://app.example.com`) |
| `FRONTEND_URL` | No | OAuth redirect base (default `http://localhost:3000`) |
| `BACKEND_PUBLIC_URL` | No | Public API URL for OAuth callbacks (default `http://localhost:5000`) |
| `GOOGLE_CALLBACK_URL` / `FACEBOOK_CALLBACK_URL` | No | Override OAuth callback URLs |
| `CLOUDINARY_*` | **Yes in production** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` | Optional | **Development only**: create first admin when DB has none |
| `PAYMOB_*` | For payments | As required by Paymob integration |

**Admin seeding (CLI):** set `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, and optionally `ADMIN_SEED_NAME`, then run:

```bash
cd backend
npm run create-admin
```

**Paymob smoke script:** set `PAYMOB_API_KEY` in `.env`, then `node test_paymob.js` (never commit API keys).

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (default `http://localhost:5000`) |

## Run locally

Terminal 1 — API:

```bash
cd backend
npm install
npm run dev
```

Terminal 2 — Web:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). API listens on port **5000** by default.

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `backend` | `npm test` | Smoke test (JWT config sanity) |
| `backend` | `npm run create-admin` | Create or promote admin user |
| `frontend` | `npm run lint` | ESLint |
| `frontend` | `npm test` | Runs lint (CI-friendly) |
| `frontend` | `npm run build` | Production build |

## Security notes

- Rotate any API key that was ever committed to git.
- Do not rely on default credentials; use env-driven bootstrap and strong `JWT_SECRET`.
