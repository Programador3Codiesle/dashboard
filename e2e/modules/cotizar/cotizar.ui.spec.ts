import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  expectTestIdOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";

test.describe("Cotizar UI", () => {
  test("carga el hub", async ({ page }) => {
    await gotoApp(page, "/dashboard/cotizar");
    await expectHeadingOrSkip(page, "Cotizar");
    await expectTestIdOrSkip(
      page,
      "submodulos-hub",
      "El usuario de prueba no tiene el hub de Cotizar",
    );
  });

  test("carga el informe de cotizaciones y espera el API", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/cotizador/informe-cotizaciones/livianos",
      true,
    );

    await gotoApp(page, "/dashboard/cotizar/informe-cotizaciones");
    await expectHeadingOrSkip(page, "Informe de cotizaciones");
    await expect(page.getByTestId("cotizar-informe-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/cotizador/informe-cotizaciones/livianos",
      true,
    );
    expect(
      response.ok(),
      `GET /cotizador/informe-cotizaciones/livianos → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expect(page.getByTestId("cotizar-informe-table")).toBeVisible();
    await expect(
      page
        .getByTestId("cotizar-informe-table")
        .getByRole("columnheader", { name: "ID" }),
    ).toBeVisible();
  });

  test("abre Cotizador Livianos sin crear cotización", async ({ page }) => {
    const hits = collectApiResponses(page, "/cotizador/livianos", true);

    await gotoApp(page, "/dashboard/cotizar/livianos");
    await expectHeadingOrSkip(page, "Cotizador Livianos");
    await expect(page.getByTestId("cotizar-livianos-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/cotizador/livianos",
      true,
    );
    expect(
      response.ok(),
      `GET /cotizador/livianos → HTTP ${response.status()}`,
    ).toBeTruthy();
    await expect(page.getByTestId("cotizar-livianos-placa")).toBeVisible();
  });
});
