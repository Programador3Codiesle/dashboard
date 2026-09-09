import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";
import { fechaHoyIso } from "../../helpers/dates";

test.describe("Contact Center — Agendamiento leads UI", () => {
  test("carga Admin LEADS y lista (solo lectura)", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/contact-center/agendamiento-leads/listar",
      true,
      "POST",
    );

    await gotoApp(page, "/dashboard/contact-center/agendamiento-leads");
    await expectHeadingOrSkip(page, "Admin LEADS");
    await expect(page.getByTestId("contact-center-page")).toBeVisible();

    const filtrar = page.getByTestId("cc-leads-filtrar");
    if (await filtrar.isVisible()) {
      const hoy = fechaHoyIso();
      await page.locator("#cc-leads-tipo").selectOption("0");
      await page.locator("#cc-leads-fecha-ini").fill(hoy);
      await page.locator("#cc-leads-fecha-fin").fill(hoy);
      await filtrar.click();
    }

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/contact-center/agendamiento-leads/listar",
      true,
      "POST",
    );
    expect(
      response.ok(),
      `POST /contact-center/agendamiento-leads/listar → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expect(page.getByText("Id LEAD")).toBeVisible();
  });
});
