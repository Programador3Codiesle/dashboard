import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  expectTestIdOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";

test.describe("Contact Center UI", () => {
  test("carga el hub", async ({ page }) => {
    await gotoApp(page, "/dashboard/contact-center");
    await expectHeadingOrSkip(page, "Contact Center");
    await expectTestIdOrSkip(
      page,
      "submodulos-hub",
      "El usuario de prueba no tiene el hub de Contact Center",
    );
  });

  test("carga Distribución y espera el API", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/contact-center/distribucion/matriz",
    );

    await gotoApp(page, "/dashboard/contact-center/distribucion");
    await expectHeadingOrSkip(page, "Distribución");
    await expect(page.getByTestId("contact-center-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/contact-center/distribucion/matriz",
    );
    expect(
      response.ok(),
      `GET /contact-center/distribucion/matriz → HTTP ${response.status()}`,
    ).toBeTruthy();
  });
});
