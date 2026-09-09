import { test, expect } from "@playwright/test";

test.describe("Rutas protegidas", () => {
  test("redirige a login si se entra a /dashboard sin sesión", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page.getByTestId("dashboard-shell")).toHaveCount(0);
    await expect(page).toHaveURL(/\/login/, { timeout: 30_000 });
    await expect(page.getByTestId("login-form")).toBeVisible();
  });
});
