import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";

test.describe("Estado taller UI", () => {
  test("carga el panel y espera el API", async ({ page }) => {
    const hits = collectApiResponses(page, "/taller/estado-taller");

    await page.goto("/dashboard/taller/estado-taller");
    await expectHeadingOrSkip(page, "Estado taller");
    await expect(page.getByTestId("taller-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/taller/estado-taller",
    );
    expect(
      response.ok(),
      `GET /taller/estado-taller → HTTP ${response.status()}`,
    ).toBeTruthy();
  });
});
