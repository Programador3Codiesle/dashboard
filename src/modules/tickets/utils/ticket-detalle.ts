export function splitRespuestasTicket(
  raw: string | null | undefined,
): string[] {
  return (raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ticketAdjuntoKind(path: string): "image" | "pdf" | "file" {
  const ext = path.split(".").pop()?.split("?")[0]?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "file";
}
