import { test, expect } from "@playwright/test";
import { waitForApiResponse } from "../helpers/auth";

test.describe("Logout", () => {
  test("cierra sesión desde el sidebar y bloquea el dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page.getByTestId("dashboard-shell")).toBeVisible();

    const logoutResponsePromise = waitForApiResponse(
      page,
      "/auth/logout",
      "POST",
    );
    await page.getByTestId("sidebar-logout").click();
    await logoutResponsePromise;

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("login-form")).toBeVisible();

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("dashboard-shell")).toHaveCount(0);
  });
});
