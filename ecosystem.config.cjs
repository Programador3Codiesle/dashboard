/**
 * PM2 — frontend Next.
 *
 * Deploy sin dejar 5 min el sitio caído:
 *   1. git pull + npm install + npm run build:inactive  (front SIGUE en marcha)
 *   2. pm2 stop postventa-front
 *   3. npm run promote:front
 *   4. pm2 start postventa-front
 *
 * No pongas NEXT_DIST_DIR en el .env permanente ni en este file:
 * `next start` debe leer la carpeta `.next` (ya promocionada).
 *
 * NEXT_PUBLIC_API_URL se hornea en el build. No cambiarla entre deploys.
 */
module.exports = {
  apps: [
    {
      name: "postventa-front",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      kill_timeout: 8000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
