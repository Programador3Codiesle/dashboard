import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export type E2eEnvName = "local" | "staging" | "production";

export type E2eConfig = {
  env: E2eEnvName;
  baseUrl: string;
  apiUrl: string;
  nit: string;
  password: string;
  storageStatePath: string;
  isProduction: boolean;
  allowDestructive: boolean;
};

const PRODUCTION_HOST_RE = /intranet\.codiesel\.co/i;

function parseEnvFile(contents: string): Record<string, string> {
  const parsed: Record<string, string> = {};

  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    parsed[key] = value;
  }

  return parsed;
}

export function loadE2eEnvFile(rootDir: string = process.cwd()): void {
  const candidates = [
    resolve(rootDir, "e2e/.env.e2e.local"),
    resolve(rootDir, "e2e/.env.e2e"),
  ];

  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const parsed = parseEnvFile(readFileSync(file, "utf8"));
    for (const [key, value] of Object.entries(parsed)) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function resolveEnvName(raw: string): E2eEnvName {
  const value = raw.toLowerCase();
  if (value === "production" || value === "prod") return "production";
  if (value === "staging" || value === "stage") return "staging";
  return "local";
}

export function getE2eConfig(): E2eConfig {
  const env = resolveEnvName(process.env.E2E_ENV ?? "local");
  const baseUrl = normalizeUrl(
    process.env.E2E_BASE_URL ?? "http://localhost:3000",
  );
  const apiUrl = normalizeUrl(
    process.env.E2E_API_URL ?? "http://localhost:4000",
  );
  const isProduction =
    env === "production" ||
    PRODUCTION_HOST_RE.test(baseUrl) ||
    PRODUCTION_HOST_RE.test(apiUrl);

  if (isProduction && process.env.E2E_ALLOW_DESTRUCTIVE === "true") {
    throw new Error(
      "E2E_ALLOW_DESTRUCTIVE no puede ser true contra producción. Solo smoke de lectura.",
    );
  }

  return {
    env: isProduction ? "production" : env,
    baseUrl,
    apiUrl,
    nit: process.env.E2E_NIT ?? "1095944273",
    password: process.env.E2E_PASSWORD ?? "123456",
    storageStatePath: resolve(process.cwd(), "e2e/.auth/user.json"),
    isProduction,
    allowDestructive:
      !isProduction && process.env.E2E_ALLOW_DESTRUCTIVE === "true",
  };
}

export function ensureAuthDir(storageStatePath: string): void {
  mkdirSync(dirname(storageStatePath), { recursive: true });
}

export function assertDestructiveAllowed(): void {
  const config = getE2eConfig();
  if (config.isProduction) {
    throw new Error(
      "Esta prueba muta datos y no puede ejecutarse en producción.",
    );
  }
  if (!config.allowDestructive) {
    throw new Error(
      "Prueba destructiva bloqueada. Use E2E_ALLOW_DESTRUCTIVE=true solo en local o staging.",
    );
  }
}
