import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  firstCollectedOrWait,
} from "../../helpers/api";
import { getE2eConfig } from "../../helpers/env";

async function expectUsuariosModule(page: import("@playwright/test").Page) {
  const module = page.getByTestId("usuarios-module");
  try {
    await expect(module).toBeVisible({ timeout: 25_000 });
  } catch {
    test.skip(true, "El usuario de prueba no tiene acceso a Usuarios");
  }
}

test.describe("Usuarios UI", () => {
  test("lista usuarios y espera el API", async ({ page }) => {
    const hits = collectApiResponses(page, "/usuarios");

    await page.goto("/dashboard/usuarios");
    await expectUsuariosModule(page);

    const listResponse = await firstCollectedOrWait(page, hits, "/usuarios");
    expect(
      listResponse.ok(),
      `GET /usuarios → HTTP ${listResponse.status()}`,
    ).toBeTruthy();

    await expect(
      page
        .getByTestId("usuarios-table")
        .or(page.getByText("No hay usuarios disponibles.")),
    ).toBeVisible();
  });

  test("busca el usuario de prueba", async ({ page }) => {
    const { nit } = getE2eConfig();
    await page.goto("/dashboard/usuarios");
    await expectUsuariosModule(page);

    const searchApi = page.waitForResponse(
      (response) => {
        if (response.request().method() !== "GET") return false;
        try {
          const url = new URL(response.url());
          return (
            url.pathname === "/usuarios" &&
            (url.searchParams.get("search") ?? "").length > 0
          );
        } catch {
          return false;
        }
      },
      { timeout: 40_000 },
    );
    await page.getByTestId("usuarios-search").fill(nit);
    const searchResponse = await searchApi;
    expect(searchResponse.ok()).toBeTruthy();
    expect(searchResponse.url()).toContain("search=");
  });
});
