/**
 * PM2 — frontend Next.
 *
 * NO ejecutar `npm run build` mientras este proceso sirve `.next`.
 * Orden:
 *   git pull origin main
 *   npm install          (solo si cambió package.json)
 *   pm2 stop postventa-front
 *   npm run build
 *   pm2 start postventa-front
 *   (o pm2 reload postventa-front si el proceso ya arrancó con este file)
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
