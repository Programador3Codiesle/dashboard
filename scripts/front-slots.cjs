/**
 * Blue/green del front: `.next-a` y `.next-b`.
 * El proceso vivo lee `.next-slot` (`a` o `b`) al arrancar.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const SLOT_FILE = path.join(root, ".next-slot");
const PENDING_FILE = path.join(root, ".next-pending");

function readLetter(file) {
  if (!fs.existsSync(file)) return null;
  const slot = fs.readFileSync(file, "utf8").trim().replace(/\r/g, "");
  return slot === "a" || slot === "b" ? slot : null;
}

function liveSlot() {
  return readLetter(SLOT_FILE);
}

function idleSlot() {
  const live = liveSlot();
  if (live === "a") return "b";
  if (live === "b") return "a";
  return "a";
}

function distDirFor(slot) {
  return `.next-${slot}`;
}

function distPath(slot) {
  return path.join(root, distDirFor(slot));
}

function writeLetter(file, slot) {
  fs.writeFileSync(file, `${slot}\n`, "utf8");
}

function rmDirIfExists(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function cleanupInactive() {
  const live = liveSlot();
  const removed = [];

  if (live === "a" || live === "b") {
    const other = live === "a" ? "b" : "a";
    const otherDir = distPath(other);
    if (fs.existsSync(otherDir)) {
      rmDirIfExists(otherDir);
      removed.push(distDirFor(other));
    }
    const legacyNext = path.join(root, ".next");
    if (fs.existsSync(legacyNext)) {
      rmDirIfExists(legacyNext);
      removed.push(".next");
    }
    const legacyBuild = path.join(root, ".next-build");
    if (fs.existsSync(legacyBuild)) {
      rmDirIfExists(legacyBuild);
      removed.push(".next-build");
    }
  }

  return removed;
}

module.exports = {
  root,
  SLOT_FILE,
  PENDING_FILE,
  liveSlot,
  idleSlot,
  distDirFor,
  distPath,
  writeLetter,
  readLetter,
  cleanupInactive,
};
