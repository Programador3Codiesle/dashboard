import { expect, type Page, type Response } from "@playwright/test";
import { getE2eConfig } from "./env";

function normalizeHostname(hostname: string): string {
  return hostname === "127.0.0.1" ? "localhost" : hostname;
}

export function isApiPath(
  responseUrl: string,
  apiUrl: string,
  pathname: string,
): boolean {
  try {
    const url = new URL(responseUrl);
    const api = new URL(apiUrl);
    const sameHost =
      normalizeHostname(url.hostname) === normalizeHostname(api.hostname);
    return sameHost && url.pathname === pathname;
  } catch {
    return false;
  }
}

export async function waitForApiResponse(
  page: Page,
  pathname: string,
  method: string,
): Promise<Response> {
  const { apiUrl } = getE2eConfig();
  return page.waitForResponse(
    (response) => {
      if (response.request().method() !== method) return false;
      try {
        if (new URL(response.url()).pathname === pathname) return true;
      } catch {
        return false;
      }
      return isApiPath(response.url(), apiUrl, pathname);
    },
    { timeout: 40_000 },
  );
}

export async function completeEmpresaIfNeeded(page: Page): Promise<void> {
  const modal = page.getByTestId("empresa-selector-modal");
  const shell = page.getByTestId("dashboard-shell");

  await expect(modal.or(shell)).toBeVisible();

  if (await modal.isVisible()) {
    const codiesel = modal.getByTestId("empresa-option-1");
    if ((await codiesel.count()) > 0) {
      await codiesel.click();
    } else {
      await modal.locator('[data-testid^="empresa-option-"]').first().click();
    }
  }

  await expect(shell).toBeVisible();
}

/** Next.js en `dev` a veces no dispara `load` a tiempo (compile/HMR). */
export async function gotoApp(page: Page, path: string) {
  return page.goto(path, { waitUntil: "domcontentloaded" });
}

export async function loginViaUi(
  page: Page,
  credentials?: { nit?: string; password?: string },
): Promise<Response> {
  const config = getE2eConfig();
  const nit = credentials?.nit ?? config.nit;
  const password = credentials?.password ?? config.password;

  await page.goto("/login");
  await expect(page.getByTestId("login-form")).toBeVisible();
  await expect(page.getByTestId("login-submit")).toBeEnabled();
  await page.getByTestId("login-user").fill(nit);
  await page.getByTestId("login-password").fill(password);

  const loginResponsePromise = waitForApiResponse(page, "/auth/login", "POST");
  await page.getByTestId("login-submit").click();
  const loginResponse = await loginResponsePromise;

  if (!loginResponse.ok()) {
    throw new Error(`Login API HTTP ${loginResponse.status()}`);
  }

  await completeEmpresaIfNeeded(page);
  await expect(page).toHaveURL(/\/dashboard/);
  return loginResponse;
}
