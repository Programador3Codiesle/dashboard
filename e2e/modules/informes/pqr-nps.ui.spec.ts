import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";

test.describe("PQR / NPS UI", () => {
  test("carga el informe y espera el API", async ({ page }) => {
    const hits = collectApiResponses(page, "/informes/postventa/pqr-nps");

    await page.goto("/dashboard/informes/postventa/pqr-nps");
    await expectHeadingOrSkip(page, "PQR / NPS");
    await expect(page.getByTestId("informes-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/informes/postventa/pqr-nps",
    );
    expect(
      response.ok(),
      `GET /informes/postventa/pqr-nps → HTTP ${response.status()}`,
    ).toBeTruthy();
  });
});
