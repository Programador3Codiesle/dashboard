import { defineConfig, devices } from "@playwright/test";
import { getE2eConfig, loadE2eEnvFile } from "./e2e/helpers/env";

loadE2eEnvFile();
const e2e = getE2eConfig();

const skipOnProduction = e2e.isProduction ? /modules\// : undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 3,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  outputDir: "test-results",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: {
    baseURL: e2e.baseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "es-CO",
    timezoneId: "America/Bogota",
    navigationTimeout: 60_000,
  },
  grepInvert: skipOnProduction,
  projects: [
    {
      name: "setup",
      testMatch: /setup\/auth\.setup\.ts/,
    },
    {
      name: "unauthenticated",
      testMatch:
        /auth\/login\.spec\.ts|auth\/protected-routes\.spec\.ts|smoke\/application\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "authenticated",
      testMatch: /smoke\/dashboard\.spec\.ts|auth\/logout\.spec\.ts|modules\/.+\.ui\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: e2e.storageStatePath,
      },
    },
    {
      name: "api",
      testMatch: /modules\/.+\.api\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        storageState: e2e.storageStatePath,
      },
    },
  ],
  webServer:
    process.env.E2E_START_FRONT === "1"
      ? {
          command: "npm run dev",
          url: e2e.baseUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        }
      : undefined,
});
