import { test, expect } from "@playwright/test";
import { waitForApiResponse } from "../helpers/auth";

test.describe("Dashboard", () => {
  test("carga el shell autenticado y el API del dashboard responde", async ({
    page,
  }) => {
    const dashboardApi = waitForApiResponse(page, "/dashboard", "GET");

    await page.goto("/dashboard");

    const dashboardResponse = await dashboardApi;
    expect(
      dashboardResponse.ok(),
      `GET /dashboard → HTTP ${dashboardResponse.status()}`,
    ).toBeTruthy();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId("dashboard-shell")).toBeVisible();
    await expect(page.getByTestId("sidebar")).toBeVisible();
    await expect(page.getByTestId("sidebar-nav")).toBeVisible();
    await expect(page.getByTestId("header-profile-menu")).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
  });
});
