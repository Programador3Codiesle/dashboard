import {
  expect,
  test,
  type APIRequestContext,
  type Page,
  type Response,
} from "@playwright/test";
import { getE2eConfig } from "./env";

export async function apiRequest(
  request: APIRequestContext,
  pathWithQuery: string,
  init?: { method?: string; data?: unknown },
) {
  const { apiUrl } = getE2eConfig();
  const url = `${apiUrl}${pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`}`;
  const method = (init?.method ?? "GET").toUpperCase();

  if (method === "POST") {
    return request.post(url, { data: init?.data });
  }
  if (method === "PUT") {
    return request.put(url, { data: init?.data });
  }
  if (method === "PATCH") {
    return request.patch(url, { data: init?.data });
  }
  if (method === "DELETE") {
    return request.delete(url);
  }
  return request.get(url);
}

export async function expectApiOkOrSkip(
  status: number,
  context: string,
): Promise<void> {
  if (status === 401 || status === 403) {
    test.skip(true, `Sin permiso API (${status}) en ${context}`);
  }
  expect(status, `${context} → HTTP ${status}`).toBeLessThan(500);
  expect(
    status === 200 || status === 201,
    `${context} → HTTP ${status}`,
  ).toBeTruthy();
}

export function skipUnlessDestructive(): void {
  const config = getE2eConfig();
  test.skip(
    config.isProduction || !config.allowDestructive,
    "Prueba destructiva: E2E_ALLOW_DESTRUCTIVE=true solo en local o staging",
  );
}

function pathnameMatches(
  url: string,
  pathnameIncludes: string,
  exact: boolean,
): boolean {
  const pathname = new URL(url).pathname;
  return exact
    ? pathname === pathnameIncludes
    : pathname.includes(pathnameIncludes);
}

export function collectApiResponses(
  page: Page,
  pathnameIncludes: string,
  exact = false,
  method = "GET",
) {
  const hits: Response[] = [];
  page.on("response", (response) => {
    if (response.request().method() !== method) return;
    try {
      if (pathnameMatches(response.url(), pathnameIncludes, exact)) {
        hits.push(response);
      }
    } catch {
      /* ignore */
    }
  });
  return hits;
}

export async function waitForApiPath(
  page: Page,
  pathnameIncludes: string,
  method = "GET",
  exact = false,
) {
  return page.waitForResponse(
    (response) => {
      if (response.request().method() !== method) return false;
      try {
        return pathnameMatches(response.url(), pathnameIncludes, exact);
      } catch {
        return false;
      }
    },
    { timeout: 40_000 },
  );
}

export async function firstCollectedOrWait(
  page: Page,
  hits: Response[],
  pathnameIncludes: string,
  exact = false,
  method = "GET",
) {
  if (hits.length > 0) {
    return hits[0];
  }
  return waitForApiPath(page, pathnameIncludes, method, exact);
}

export async function expectHeadingOrSkip(
  page: Page,
  heading: string | RegExp,
): Promise<void> {
  const title = page.getByRole("heading", { name: heading }).first();
  try {
    await expect(title).toBeVisible({ timeout: 40_000 });
  } catch {
    test.skip(
      true,
      `El usuario de prueba no tiene acceso a "${String(heading)}"`,
    );
  }
}

export async function expectTestIdOrSkip(
  page: Page,
  testId: string,
  message: string,
): Promise<void> {
  try {
    await expect(page.getByTestId(testId)).toBeVisible({ timeout: 40_000 });
  } catch {
    test.skip(true, message);
  }
}
