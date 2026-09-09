import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";

test.describe("Informe OT abiertas UI", () => {
  test("carga el informe general y espera el API", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/taller/informe-ot-abiertas/general",
    );

    await gotoApp(page, "/dashboard/taller/informe-ordenes-abiertas");
    await expectHeadingOrSkip(page, "Informe órdenes taller abiertas");
    await expect(page.getByTestId("taller-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/taller/informe-ot-abiertas/general",
    );
    expect(
      response.ok(),
      `GET /taller/informe-ot-abiertas/general → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expect(page.getByTestId("informe-ot-table")).toBeVisible();
    await expect(
      page
        .getByTestId("informe-ot-table")
        .getByText("Número Orden")
        .or(page.getByText("No hay órdenes para mostrar")),
    ).toBeVisible();
  });

  test("carga el informe de sede Girón", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/taller/informe-ot-abiertas/sede/giron",
    );

    await gotoApp(
      page,
      "/dashboard/taller/informe-ordenes-abiertas/sede/giron",
    );
    await expectHeadingOrSkip(page, "Informe órdenes taller abiertas");
    await expect(page.getByTestId("taller-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/taller/informe-ot-abiertas/sede/giron",
    );
    expect(
      response.ok(),
      `GET /taller/informe-ot-abiertas/sede/giron → HTTP ${response.status()}`,
    ).toBeTruthy();
    await expect(page.getByTestId("informe-ot-table")).toBeVisible();
  });
});
