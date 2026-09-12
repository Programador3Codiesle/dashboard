import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";

test.describe("Ranking trimestral UI", () => {
  test("carga el ranking y espera el API", async ({ page }) => {
    const hits = collectApiResponses(page, "/taller/ranking-trimestral", true);

    await gotoApp(page, "/dashboard/taller/ranking-trimestral");
    await expectHeadingOrSkip(page, "Ranking Técnico Trimestral");
    await expect(page.getByTestId("taller-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/taller/ranking-trimestral",
      true,
    );
    expect(
      response.ok(),
      `GET /taller/ranking-trimestral → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expect(page.getByTestId("ranking-trimestral-table")).toBeVisible();
  });
});
