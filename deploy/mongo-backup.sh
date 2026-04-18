#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Talé Hotel — MongoDB nightly backup.
#
# Dumps the `tale_hotel` database into /var/backups/tale and keeps the last
# 14 snapshots. Intended to run from cron as the `tale` user:
#
#   crontab -u tale -e
#   15 3 * * *  /var/www/tale/deploy/mongo-backup.sh >> /var/log/tale/backup.log 2>&1
#
# Restore: `mongorestore --drop /var/backups/tale/<timestamp>/`
# ---------------------------------------------------------------------------
set -euo pipefail

: "${MONGO_URI:=mongodb://127.0.0.1:27017/tale_hotel}"
: "${BACKUP_DIR:=/var/backups/tale}"
: "${KEEP:=14}"

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TARGET="${BACKUP_DIR}/${TIMESTAMP}"

mkdir -p "$BACKUP_DIR"
echo "[$(date -Is)] dumping to $TARGET"
mongodump --quiet --uri="$MONGO_URI" --out="$TARGET"

# Optional: compress
tar -C "$BACKUP_DIR" -czf "${TARGET}.tgz" "$TIMESTAMP"
rm -rf "$TARGET"

# Prune old snapshots beyond $KEEP most recent .tgz files.
ls -1t "${BACKUP_DIR}"/*.tgz 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f

echo "[$(date -Is)] backup complete — kept newest $KEEP"
