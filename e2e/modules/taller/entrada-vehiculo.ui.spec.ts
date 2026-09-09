import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  expectTestIdOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";

test.describe("Entrada de vehículo UI", () => {
  test("carga el panel y espera el API", async ({ page }) => {
    const hits = collectApiResponses(page, "/taller/entrada-vehiculo", true);

    await gotoApp(page, "/dashboard/taller/entrada-vehiculo");
    await expectHeadingOrSkip(page, "Ingreso de vehículos");
    await expect(page.getByTestId("taller-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/taller/entrada-vehiculo",
      true,
    );
    expect(
      response.ok(),
      `GET /taller/entrada-vehiculo → HTTP ${response.status()}`,
    ).toBeTruthy();
  });

  test("busca por placa de laboratorio (solo lectura)", async ({ page }) => {
    await gotoApp(page, "/dashboard/taller/entrada-vehiculo");
    await expectHeadingOrSkip(page, "Ingreso de vehículos");
    await expectTestIdOrSkip(
      page,
      "entrada-placa",
      "El usuario de prueba no tiene el panel de entrada de vehículo",
    );

    const placaApi = page.waitForResponse(
      (response) => {
        if (response.request().method() !== "GET") return false;
        try {
          const url = new URL(response.url());
          return (
            url.pathname === "/taller/entrada-vehiculo" &&
            (url.searchParams.get("placa") ?? "").length >= 6
          );
        } catch {
          return false;
        }
      },
      { timeout: 40_000 },
    );

    await page.getByTestId("entrada-placa").fill("E2ETST");
    await page.getByRole("button", { name: "Buscar por placa" }).click();

    const response = await placaApi;
    expect(response.ok()).toBeTruthy();
    expect(new URL(response.url()).searchParams.get("placa")).toBe("E2ETST");
  });
});
