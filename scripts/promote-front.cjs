/**
 * Activa el build pendiente (.next-a / .next-b) y reinicia PM2.
 * No borra carpetas con el sitio caído: el corte es solo el restart de Next.
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const {
  PENDING_FILE,
  SLOT_FILE,
  distPath,
  distDirFor,
  readLetter,
  writeLetter,
} = require("./front-slots.cjs");

const slot = readLetter(PENDING_FILE);
if (!slot) {
  console.error(
    "No hay build pendiente. Primero: npm run build:inactive (con el front en marcha).",
  );
  process.exit(1);
}

const distDir = distDirFor(slot);
if (!fs.existsSync(distPath(slot))) {
  console.error(`No existe ${distDir}. Vuelve a ejecutar npm run build:inactive.`);
  process.exit(1);
}

writeLetter(SLOT_FILE, slot);
fs.rmSync(PENDING_FILE, { force: true });
console.log(`Activado ${distDir}. Reiniciando postventa-front...`);

const restarted = spawnSync("pm2", ["restart", "postventa-front"], {
  stdio: "inherit",
  shell: true,
});

if (restarted.status !== 0) {
  console.error(
    "No se pudo reiniciar PM2. Ejecuta a mano:\n  pm2 restart postventa-front",
  );
  process.exit(1);
}

console.log(
  "Listo. El corte es el arranque de Next (segundos), no el borrado de carpetas.\nCuando veas el sitio bien: npm run cleanup:front",
);
