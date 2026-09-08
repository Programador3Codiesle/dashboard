/**
 * Construye a `.next-build` para no pisar el `.next` que sirve PM2.
 */
process.env.NEXT_DIST_DIR = ".next-build";

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const nextBin = path.join(
  __dirname,
  "..",
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: process.env,
  cwd: path.join(__dirname, ".."),
});

process.exit(result.status === null ? 1 : result.status);
