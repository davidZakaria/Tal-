# Talé Hotel — VPS Deployment Guide

This folder contains everything you need to run Talé on a single Ubuntu 22.04 / 24.04 VPS (e.g. Hostinger KVM2). The whole stack — MongoDB, the Express API, and the Next.js frontend — runs on the same box behind Nginx + TLS.

```
deploy/
├── README.md                ← this file
├── provision.sh             ← one-shot server bootstrap (Node, Mongo, PM2, Nginx, UFW)
├── deploy.sh                ← build + (re)start via PM2, run on every release
├── ecosystem.config.js      ← PM2 process definitions for tale-api and tale-web
├── nginx/tale.conf          ← Nginx site config (single-domain reverse proxy)
├── mongo-backup.sh          ← nightly mongodump with 14-day retention
└── cron/mongo-backup.crontab← crontab snippet for the backup
```

## 1. Prepare the VPS

SSH in as root (or a user with `sudo`) and run:

```bash
git clone https://github.com/<you>/<repo>.git /tmp/tale
sudo bash /tmp/tale/deploy/provision.sh
```

That script is idempotent — rerun it safely any time. It installs:

- Node.js 20 LTS
- MongoDB 7.x (bound to `127.0.0.1` only — never exposed to the internet)
- PM2 (global)
- Nginx + Certbot
- UFW, allowing only SSH + HTTP + HTTPS
- An unprivileged `tale` user and directories at `/var/www/tale` + `/var/log/tale`.

## 2. Pull the repo as the `tale` user

```bash
sudo -iu tale
git clone https://github.com/<you>/<repo>.git /var/www/tale
cd /var/www/tale
```

## 3. Fill in the environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.production.example frontend/.env.production
nano backend/.env
nano frontend/.env.production
```

**Required changes from the examples:**

| File | Variable | What to set |
|---|---|---|
| `backend/.env` | `NODE_ENV` | `production` |
| `backend/.env` | `MONGO_URI` | `mongodb://127.0.0.1:27017/tale_hotel` |
| `backend/.env` | `JWT_SECRET` | **Fresh** random value (see command below) |
| `backend/.env` | `CORS_ORIGIN` | `https://talehotel.com,https://www.talehotel.com` |
| `backend/.env` | `EMAIL_USER` / `EMAIL_PASS` | Your Gmail + App Password |
| `backend/.env` | `LEADS_INBOX` | Where sales should receive new-lead emails |
| `frontend/.env.production` | `NEXT_PUBLIC_SITE_URL` | `https://talehotel.com` |
| `frontend/.env.production` | `BACKEND_URL` | `http://127.0.0.1:5000` (same-origin proxy) |

Generate a real JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 4. First deploy

```bash
bash deploy/deploy.sh
```

This installs both `backend` and `frontend` dependencies, runs `next build`, and starts the two PM2 processes (`tale-api` on 5000, `tale-web` on 3000). Both listen only on `127.0.0.1` — Nginx is the only thing facing the public network.

## 5. Enable Nginx + HTTPS

```bash
sudo cp /var/www/tale/deploy/nginx/tale.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/tale.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Point `talehotel.com` and `www.talehotel.com` DNS A-records at the VPS. When the DNS has propagated:

```bash
sudo certbot --nginx -d talehotel.com -d www.talehotel.com
```

Certbot adds the `listen 443 ssl` blocks, redirects HTTP → HTTPS, and sets up auto-renew via its own systemd timer.

## 6. Keep PM2 alive across reboots

```bash
pm2 startup systemd -u tale --hp /home/tale
# copy-paste the command PM2 prints (runs as root)
pm2 save
```

## 7. Schedule Mongo backups

```bash
crontab -u tale /var/www/tale/deploy/cron/mongo-backup.crontab
```

Backups land in `/var/backups/tale/*.tgz` with a 14-day rolling window. Restore any night with:

```bash
tar -xzf /var/backups/tale/<timestamp>.tgz -C /tmp
mongorestore --drop /tmp/<timestamp>/
```

## 8. Updating / redeploying

Every subsequent release:

```bash
sudo -iu tale
cd /var/www/tale
bash deploy/deploy.sh --pull
```

That pulls, installs, rebuilds, and `pm2 reload`s with zero downtime.

### Global booking pause (optional)

To pause **guest reservation requests** until a fixed date (for example short-stay bookings closed until 1 January 2027), set in `backend/.env` on the VPS:

```bash
BOOKING_OPENS_AT=2027-01-01
```

Then reload the API so the variable is picked up:

```bash
pm2 reload tale-api --update-env
```

Omit `BOOKING_OPENS_AT` or leave it empty to allow online reservation requests again (subject to each suite’s `openForBooking` flag). The public site reads `GET /api/booking-status` for the banner and suite form; no extra frontend env is required.

## 9. Observability

- `pm2 status` / `pm2 logs tale-api` / `pm2 logs tale-web`
- `sudo tail -f /var/log/tale/*.log`
- `sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log`
- External: put an UptimeRobot / BetterStack monitor on `https://talehotel.com/healthz` — the Express `/healthz` endpoint returns 200 only when Mongo is connected.

## 10. Where do submitted presentation forms go?

Three places, in order of convenience:

1. **Admin console** — `https://talehotel.com/admin/leads`. Log in as an Admin. Sort, filter, mark as contacted, export CSV.
2. **Email** — as soon as `LEADS_INBOX` is set in `backend/.env`, every new submission emails both the sales inbox (with guest's email as `Reply-To`) and the guest (polite auto-reply).
3. **MongoDB** — `tale_hotel.leads` collection. Via `mongosh`:
   ```bash
   mongosh "mongodb://127.0.0.1:27017/tale_hotel"
   db.leads.find().sort({ createdAt: -1 }).limit(10).pretty()
   ```

## 11. Rollback

```bash
cd /var/www/tale
git log --oneline -n 20
git checkout <good-sha>
bash deploy/deploy.sh
```

Mongo data is untouched; PM2 reload swaps the process.

## 12. Troubleshooting

| Symptom | Fix |
|---|---|
| `503 Database not connected` on every `/api/*` | `sudo systemctl status mongod`, then `sudo systemctl restart mongod` |
| `pm2 status` shows `errored` | `pm2 logs tale-api --lines 200` — 90% of the time it's a missing env var in `backend/.env` |
| New lead didn't get the auto-reply | Check `backend/.env` has `EMAIL_USER` + **App Password** (not login), and that the Gmail account has 2FA enabled |
| Form posts return 429 | Rate limit hit. Tune `LEAD_RATE_WINDOW_MS` / `LEAD_RATE_MAX` in `backend/.env` |
| Admin login returns 401 even with the right password | Token in browser storage is stale. Open devtools → Application → Local Storage → remove `adminToken`, or just click **Logout Access** on the admin sidebar |
| Certbot renew fails | `sudo certbot renew --dry-run`; ensure port 80 reaches the server and `/.well-known/acme-challenge/` is not being blocked by the `location /` rule |
