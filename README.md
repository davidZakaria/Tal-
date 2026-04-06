# Talé

Hotel booking stack: **Express + MongoDB** API and **Next.js** (App Router) frontend.

## Prerequisites

- Node.js 18+ (global `fetch` for utility scripts)
- **MongoDB running locally** (or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — paste `MONGO_URI` into `backend/.env`)

**MongoDB Compass** is only a database *client*. It does **not** start the database server. You need either:

1. **Docker (simplest):** install [Docker Desktop](https://docs.docker.com/desktop/install/windows-installer/), then from the project root run **`start-mongodb.cmd`** or `docker compose up -d`. That starts MongoDB on `127.0.0.1:27017`.
2. **MongoDB Community Server:** install from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community), then ensure the **MongoDB** Windows service is **Running** (Services app or `net start MongoDB`).

After MongoDB is up, start the backend; you should see `MongoDB connected successfully.` in the terminal.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | No | Default `mongodb://127.0.0.1:27017/tale` (Atlas: `mongodb+srv://…`) |
| `PORT` / `BIND_HOST` | No | Default port **5000**, bind **127.0.0.1** in development (**0.0.0.0** in production) |
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
| `NEXT_PUBLIC_LOGO_VERSION` | Defaults to `1`. **Increment** (e.g. `2`, `3`) every time you replace the logo file so the browser loads the new file. Restart `npm run dev` after changing `.env.local`. |
| `NEXT_PUBLIC_LOGO_FILE` | Optional. Filename inside `frontend/public/` (default **`logo.png`**). Use `logo.svg` only if you prefer the vector fallback. |

**Brand logo (important):** Save your full logo as **`frontend/public/logo.png`** (same folder as `package.json` under `frontend`). That path is **`…\Talé\frontend\public\logo.png`** — not the repo root, not `backend`. If `logo.png` is missing, the site falls back to **`logo.svg`** (simple TALÉ / HOTEL text), then a text placeholder. **`logo.svg` must use UTF-8 or XML entities** — never paste special characters from Word into SVG without checking encoding. Bump **`NEXT_PUBLIC_LOGO_VERSION`** after replacing assets; restart Next; hard-refresh.

**Home hero video (optional):** place `hero.mp4` in `frontend/public/`. The landing page uses `<video poster="…">` with `/hero.mp4` as the source; if the file is absent, the poster image still displays.

## Run locally

**Windows PowerShell:** if `npm` fails with *running scripts is disabled*, use `npm.cmd run dev` or run `dev.cmd` from the `backend` folder (starts nodemon without `npm.ps1`). If **port 5000 is already in use**, stop the other process or set `PORT=5001` in `backend/.env` and set `BACKEND_URL=http://127.0.0.1:5001` in `frontend/.env.local`.

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

**Dev server:** `npm run dev` uses **`next dev --webpack`** so the file watcher stays scoped to this app. If you have a `package-lock.json` in your user home (e.g. `C:\Users\YourName\`), Turbopack can otherwise pick the wrong root and overload CPU/RAM. To try Turbopack again: `npm run dev:turbo` from **`frontend/`** only.

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `backend` | `npm test` | Smoke test (JWT config sanity) |
| `backend` | `npm run create-admin` | Create or promote admin user |
| `frontend` | `npm run lint` | ESLint |
| `frontend` | `npm test` | Runs lint (CI-friendly) |
| `frontend` | `npm run dev` | Next dev (Webpack, safer on Windows) |
| `frontend` | `npm run dev:turbo` | Next dev with Turbopack |
| `frontend` | `npm run build` | Production build |

## Security notes

- Rotate any API key that was ever committed to git.
- Do not rely on default credentials; use env-driven bootstrap and strong `JWT_SECRET`.
