/**
 * PM2 process definition for the Talé Hotel stack on a single Ubuntu VPS.
 *
 * Usage on the server (after `git clone` + installs):
 *   cd /var/www/tale
 *   pm2 start deploy/ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup    # then run the command PM2 prints (for systemd auto-start)
 *
 * Reload after deploying new code:
 *   pm2 reload deploy/ecosystem.config.js --env production --update-env
 *
 * Expects:
 *   - Node.js >= 20
 *   - MongoDB listening on 127.0.0.1:27017
 *   - `backend/.env` and `frontend/.env.production` populated on the VPS
 *   - `npm ci` run in both `backend/` and `frontend/`, and `npm run build`
 *     run in `frontend/` before the first `pm2 start`.
 */
module.exports = {
  apps: [
    {
      name: 'tale-api',
      cwd: './backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      out_file: '/var/log/tale/api.out.log',
      error_file: '/var/log/tale/api.err.log',
      merge_logs: true,
      time: true,
    },
    {
      name: 'tale-web',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3000',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      out_file: '/var/log/tale/web.out.log',
      error_file: '/var/log/tale/web.err.log',
      merge_logs: true,
      time: true,
    },
  ],
};
