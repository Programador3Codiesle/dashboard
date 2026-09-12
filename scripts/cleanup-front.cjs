/**
 * Borra la ranura que ya no está en uso. El front debe estar sirviendo
 * la carpeta de `.next-slot`. Seguro de correr con el sitio arriba.
 */
const { liveSlot, cleanupInactive } = require("./front-slots.cjs");

if (!liveSlot()) {
  console.error(
    "No hay .next-slot. Primero npm run promote:front (o el front aún usa .next clásico).",
  );
  process.exit(1);
}

const removed = cleanupInactive();
if (removed.length > 0) {
  console.log(`Eliminado: ${removed.join(", ")}`);
} else {
  console.log("Nada que limpiar.");
}
