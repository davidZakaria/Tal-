#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Talé Hotel — one-shot VPS provisioning for Ubuntu 22.04 / 24.04.
#
# Run ONCE per fresh server, as root (or via sudo -i):
#   curl -fsSL https://raw.githubusercontent.com/<you>/<repo>/main/deploy/provision.sh | bash
# or after cloning the repo:
#   sudo bash deploy/provision.sh
#
# What it installs:
#   - Node.js 20 LTS + npm
#   - MongoDB 7.x (bound to 127.0.0.1)
#   - PM2 (global)
#   - Nginx + Certbot
#   - UFW firewall (SSH + HTTP + HTTPS only)
#   - An unprivileged `tale` user that will own /var/www/tale and run the apps
# ---------------------------------------------------------------------------
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "provision.sh must be run as root (try: sudo bash deploy/provision.sh)" >&2
  exit 1
fi

: "${TALE_USER:=tale}"
: "${TALE_HOME:=/var/www/tale}"
: "${LOG_DIR:=/var/log/tale}"
: "${NODE_MAJOR:=20}"
: "${MONGO_VERSION:=7.0}"

echo "[Talé] Updating apt cache..."
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release ufw

echo "[Talé] Installing Node.js ${NODE_MAJOR} LTS..."
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" != "${NODE_MAJOR}" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
node -v

echo "[Talé] Installing MongoDB ${MONGO_VERSION}..."
if ! command -v mongod >/dev/null 2>&1; then
  UBUNTU_CODENAME="$(lsb_release -cs)"
  # Mongo only publishes LTS Ubuntu releases; fall back to jammy if the current release isn't listed.
  case "$UBUNTU_CODENAME" in
    jammy|focal|bionic|noble) MONGO_DIST="$UBUNTU_CODENAME" ;;
    *) MONGO_DIST="jammy" ;;
  esac
  curl -fsSL "https://www.mongodb.org/static/pgp/server-${MONGO_VERSION}.asc" | \
    gpg -o /usr/share/keyrings/mongodb-server.gpg --dearmor
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server.gpg ] https://repo.mongodb.org/apt/ubuntu ${MONGO_DIST}/mongodb-org/${MONGO_VERSION} multiverse" \
    > /etc/apt/sources.list.d/mongodb-org-${MONGO_VERSION}.list
  apt-get update -y
  apt-get install -y mongodb-org
  systemctl enable --now mongod
fi
systemctl is-active --quiet mongod || systemctl start mongod

echo "[Talé] Hardening MongoDB bindIp to 127.0.0.1..."
if grep -q "^  bindIp:" /etc/mongod.conf; then
  sed -i 's/^  bindIp:.*/  bindIp: 127.0.0.1/' /etc/mongod.conf
  systemctl restart mongod
fi

echo "[Talé] Installing Nginx + Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx

echo "[Talé] Installing PM2 globally..."
npm install -g pm2@latest

echo "[Talé] Configuring UFW (SSH + Nginx Full)..."
ufw allow OpenSSH >/dev/null || true
ufw allow "Nginx Full" >/dev/null || true
ufw --force enable || true

echo "[Talé] Creating unprivileged user '${TALE_USER}' and app directory..."
if ! id "${TALE_USER}" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "${TALE_USER}"
fi
install -d -o "${TALE_USER}" -g "${TALE_USER}" "${TALE_HOME}"
install -d -o "${TALE_USER}" -g "${TALE_USER}" "${LOG_DIR}"

cat <<EOF

========================================================================
Talé VPS base provisioning complete.

Next steps (run these manually):

  1. Switch to the tale user:
       sudo -iu ${TALE_USER}

  2. Clone the repo into ${TALE_HOME}:
       git clone <your-repo-url> ${TALE_HOME}
       cd ${TALE_HOME}
       bash deploy/deploy.sh

  3. Put your real secrets into:
       ${TALE_HOME}/backend/.env
       ${TALE_HOME}/frontend/.env.production

  4. Point DNS (talehotel.com, www.talehotel.com) at this VPS's IP,
     then enable HTTPS:
       sudo cp ${TALE_HOME}/deploy/nginx/tale.conf /etc/nginx/sites-available/
       sudo ln -sf /etc/nginx/sites-available/tale.conf /etc/nginx/sites-enabled/
       sudo nginx -t && sudo systemctl reload nginx
       sudo certbot --nginx -d talehotel.com -d www.talehotel.com

  5. Enable PM2 on boot:
       pm2 startup systemd -u ${TALE_USER} --hp /home/${TALE_USER}
       # copy/paste the command PM2 prints, then:
       pm2 save

  6. Schedule the Mongo backup cron (runs as ${TALE_USER}):
       crontab -u ${TALE_USER} -e
       # then paste the line from deploy/cron/mongo-backup.crontab

========================================================================
EOF
