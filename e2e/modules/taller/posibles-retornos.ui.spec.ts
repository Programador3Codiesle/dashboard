import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";

test.describe("Posibles retornos UI", () => {
  test("carga catálogos, lista y espera el API", async ({ page }) => {
    const catalogosHits = collectApiResponses(
      page,
      "/taller/posibles-retornos/catalogos",
      true,
    );
    const listarHits = collectApiResponses(
      page,
      "/taller/posibles-retornos/listar",
      true,
      "POST",
    );

    await gotoApp(page, "/dashboard/taller/posibles-retornos");
    await expectHeadingOrSkip(page, "Posibles retornos");
    await expect(page.getByTestId("taller-page")).toBeVisible();

    const catalogos = await firstCollectedOrWait(
      page,
      catalogosHits,
      "/taller/posibles-retornos/catalogos",
      true,
    );
    expect(
      catalogos.ok(),
      `GET /taller/posibles-retornos/catalogos → HTTP ${catalogos.status()}`,
    ).toBeTruthy();

    const listar = await firstCollectedOrWait(
      page,
      listarHits,
      "/taller/posibles-retornos/listar",
      true,
      "POST",
    );
    expect(
      listar.ok(),
      `POST /taller/posibles-retornos/listar → HTTP ${listar.status()}`,
    ).toBeTruthy();

    await expect(page.getByTestId("posibles-retornos-listado")).toBeVisible();
    await expect(
      page
        .getByTestId("posibles-retornos-listado")
        .getByRole("columnheader", { name: "ORDEN" })
        .or(page.getByText("No hay registros para mostrar")),
    ).toBeVisible();
  });

  test("busca por placa de laboratorio (solo lectura)", async ({ page }) => {
    await gotoApp(page, "/dashboard/taller/posibles-retornos");
    await expectHeadingOrSkip(page, "Posibles retornos");
    await expect(page.getByTestId("posibles-retornos-buscar")).toBeVisible();

    const listar = page.waitForResponse(
      (response) => {
        if (response.request().method() !== "POST") return false;
        try {
          return (
            new URL(response.url()).pathname ===
            "/taller/posibles-retornos/listar"
          );
        } catch {
          return false;
        }
      },
      { timeout: 40_000 },
    );

    await page.getByTestId("posibles-retornos-placa").fill("E2ETST");
    await page.getByTestId("posibles-retornos-buscar").click();

    const response = await listar;
    expect(response.ok()).toBeTruthy();
    await expect(page.getByTestId("posibles-retornos-listado")).toBeVisible();
  });
});
