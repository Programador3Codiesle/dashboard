/**
 * Construye en la ranura que NO está sirviendo (.next-a o .next-b).
 * El front de PM2 sigue con la carpeta anterior.
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { idleSlot, distDirFor, distPath, PENDING_FILE, writeLetter } = require("./front-slots.cjs");

const slot = idleSlot();
const distDir = distDirFor(slot);

process.env.NEXT_DIST_DIR = distDir;

const nextBin = path.join(
  __dirname,
  "..",
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

console.log(`Construyendo en ${distDir} (el sitio sigue en marcha).`);

const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: process.env,
  cwd: path.join(__dirname, ".."),
});

if (result.status !== 0) {
  process.exit(result.status === null ? 1 : result.status);
}

if (!require("node:fs").existsSync(distPath(slot))) {
  console.error(`El build terminó pero no existe ${distDir}.`);
  process.exit(1);
}

writeLetter(PENDING_FILE, slot);
console.log(`Listo. Luego: npm run promote:front`);
