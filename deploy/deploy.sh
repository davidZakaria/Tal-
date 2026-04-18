#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Talé Hotel — deploy / redeploy on the VPS.
#
# Run as the `tale` user inside /var/www/tale:
#   bash deploy/deploy.sh             # install deps, build, (re)start
#   bash deploy/deploy.sh --pull      # git pull first, then build + reload
#
# On first run it assumes the repo has just been cloned and both .env files
# are either already in place or about to be edited. It never overwrites
# existing .env files.
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT_DIR="$(pwd)"

if [[ "${1:-}" == "--pull" ]]; then
  echo "[Talé] git pull..."
  git pull --ff-only
fi

if [[ ! -f backend/.env ]]; then
  echo "[Talé] backend/.env is missing."
  echo "       cp backend/.env.example backend/.env && nano backend/.env"
  exit 1
fi

if [[ ! -f frontend/.env.production ]]; then
  echo "[Talé] frontend/.env.production is missing."
  echo "       cp frontend/.env.production.example frontend/.env.production && nano frontend/.env.production"
  exit 1
fi

echo "[Talé] Installing backend dependencies (npm ci --omit=dev)..."
(cd backend && npm ci --omit=dev)

echo "[Talé] Installing frontend dependencies (npm ci)..."
(cd frontend && npm ci)

echo "[Talé] Building Next.js..."
(cd frontend && NODE_ENV=production npm run build)

# PM2 available? Use it. Otherwise bail with a clear message.
if ! command -v pm2 >/dev/null 2>&1; then
  echo "[Talé] PM2 is not installed. Run provision.sh first or: sudo npm i -g pm2"
  exit 1
fi

# Pick the right PM2 action: start the first time, reload on subsequent runs.
if pm2 jlist 2>/dev/null | grep -q '"name":"tale-api"'; then
  echo "[Talé] Reloading PM2 processes with updated env..."
  pm2 reload "$ROOT_DIR/deploy/ecosystem.config.js" --update-env
else
  echo "[Talé] Starting PM2 processes for the first time..."
  pm2 start "$ROOT_DIR/deploy/ecosystem.config.js"
  pm2 save
fi

pm2 status
echo "[Talé] Deploy complete. Visit your domain once DNS + Nginx + TLS are in place."
