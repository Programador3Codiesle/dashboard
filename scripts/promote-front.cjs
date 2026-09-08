/**
 * Pasa `.next-build` a `.next`. Hay que ejecutar con postventa-front PARADO
 * (en Windows Next bloquea archivos de `.next`).
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const built = path.join(root, ".next-build");
const live = path.join(root, ".next");

if (!fs.existsSync(built)) {
  console.error(
    "No existe .next-build. Primero: npm run build:inactive (con el front TODAVÍA en marcha).",
  );
  process.exit(1);
}

fs.rmSync(live, { recursive: true, force: true });
fs.renameSync(built, live);
console.log("Listo: .next-build -> .next. Ahora: pm2 start postventa-front");
