/**
 * Carpeta de salida de Next.
 * - Local / primer deploy: `.next`
 * - Servidor blue/green: `.next-a` o `.next-b` según `.next-slot`
 * - Build inactivo: `NEXT_DIST_DIR=.next-a` | `.next-b`
 */
import fs from "node:fs";
import path from "node:path";

const ALLOWED_DIST_DIRS = new Set([
  ".next",
  ".next-a",
  ".next-b",
  ".next-build",
]);

function readLiveSlot(): "a" | "b" | null {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), ".next-slot"), "utf8");
    const slot = raw.trim().replace(/\r/g, "");
    if (slot === "a" || slot === "b") return slot;
  } catch {
    /* sin archivo: distDir por defecto */
  }
  return null;
}

export function getNextDistDir(): string {
  const raw = process.env.NEXT_DIST_DIR?.trim();
  if (raw) {
    if (!ALLOWED_DIST_DIRS.has(raw)) {
      throw new Error(
        'NEXT_DIST_DIR solo admite ".next", ".next-a", ".next-b" o ".next-build".',
      );
    }
    return raw;
  }

  const slot = readLiveSlot();
  if (slot) return `.next-${slot}`;
  return ".next";
}
