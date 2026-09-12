/**
 * PM2 — frontend Next (blue/green `.next-a` / `.next-b`).
 *
 * Deploy (corte = restart de Next, segundos; el build de 5 min NO tumba el sitio):
 *   git pull origin main
 *   npm install
 *   npm run build:inactive
 *   npm run promote:front
 *
 * promote escribe `.next-slot` y hace `pm2 restart postventa-front`.
 * Cuando el sitio responda: npm run cleanup:front
 * Si PM2 no está en el PATH: pm2 restart postventa-front
 *
 * No pongas NEXT_DIST_DIR en .env ni aquí: next start lee `.next-slot`.
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
