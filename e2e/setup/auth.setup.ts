import { test as setup, expect } from "@playwright/test";
import { loginViaUi } from "../helpers/auth";
import { ensureAuthDir, getE2eConfig } from "../helpers/env";

setup("reutilizar sesión autenticada", async ({ page }) => {
  const config = getE2eConfig();
  ensureAuthDir(config.storageStatePath);

  await loginViaUi(page);
  await expect(page.getByTestId("dashboard-shell")).toBeVisible();
  await expect(page.getByTestId("sidebar-nav")).toBeVisible();

  await page.context().storageState({ path: config.storageStatePath });
});
