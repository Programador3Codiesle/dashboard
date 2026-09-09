import { test, expect } from "@playwright/test";
import { getE2eConfig } from "../helpers/env";

test.describe("Smoke de aplicación", () => {
  test("el frontend carga la página de login", async ({ page }) => {
    const response = await page.goto("/login");

    expect(response?.ok()).toBeTruthy();
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Bienvenido" })).toBeVisible();
  });

  test("el backend responde en /health", async ({ request }) => {
    const { apiUrl } = getE2eConfig();
    const response = await request.get(`${apiUrl}/health`);

    expect(
      response.ok(),
      `GET ${apiUrl}/health → HTTP ${response.status()}`,
    ).toBeTruthy();
  });
});
