import { test, expect } from "@playwright/test";
import { expectHeadingOrSkip, waitForApiPath } from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";
import { fechaHoyIso } from "../../helpers/dates";

test.describe("Contact Center — Informe base de datos UI", () => {
  test("consulta clientes por tiempo (solo lectura)", async ({ page }) => {
    await gotoApp(page, "/dashboard/contact-center/informe-base-datos");
    await expectHeadingOrSkip(page, "Bases de datos");
    await expect(page.getByTestId("contact-center-page")).toBeVisible();

    const hoy = fechaHoyIso();
    await page.getByTestId("cc-bdc-tipo").selectOption("1");
    await page.getByLabel("Fecha desde").fill(hoy);
    await page.getByLabel("Fecha hasta").fill(hoy);

    const consultar = waitForApiPath(
      page,
      "/contact-center/informe-base-datos/consultar",
      "POST",
    );
    await page.getByTestId("cc-bdc-cargar").click();
    const response = await consultar;
    expect(
      response.ok(),
      `POST /contact-center/informe-base-datos/consultar → HTTP ${response.status()}`,
    ).toBeTruthy();
  });
});
