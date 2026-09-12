import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  expectTestIdOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";
import { getE2eConfig } from "../../helpers/env";

test.describe("Encuestas UI", () => {
  test("carga el hub", async ({ page }) => {
    await gotoApp(page, "/dashboard/encuestas");
    await expectHeadingOrSkip(page, "Encuestas");
    await expectTestIdOrSkip(
      page,
      "submodulos-hub",
      "El usuario de prueba no tiene el hub de Encuestas",
    );
  });

  test("carga Satisfacción y espera el API", async ({ page }) => {
    const hits = collectApiResponses(page, "/encuestas/satisfaccion", true);

    await gotoApp(page, "/dashboard/encuestas/satisfaccion");
    await expectHeadingOrSkip(page, "Satisfacción");
    await expect(page.getByTestId("encuestas-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/encuestas/satisfaccion",
      true,
    );
    expect(
      response.ok(),
      `GET /encuestas/satisfaccion → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expect(page.getByTestId("encuestas-satisfaccion-table")).toBeVisible();
    await expect(
      page
        .getByTestId("encuestas-satisfaccion-table")
        .getByRole("columnheader", { name: "NIT" }),
    ).toBeVisible();
  });

  test("busca en el listado de satisfacción", async ({ page }) => {
    const { nit } = getE2eConfig();
    await gotoApp(page, "/dashboard/encuestas/satisfaccion");
    await expectHeadingOrSkip(page, "Satisfacción");
    await expect(
      page.getByTestId("encuestas-satisfaccion-search"),
    ).toBeVisible();

    const searchApi = page.waitForResponse(
      (response) => {
        if (response.request().method() !== "GET") return false;
        try {
          const url = new URL(response.url());
          return (
            url.pathname === "/encuestas/satisfaccion" &&
            (url.searchParams.get("q") ?? "").length > 0
          );
        } catch {
          return false;
        }
      },
      { timeout: 40_000 },
    );
    await page.getByTestId("encuestas-satisfaccion-search").fill(nit);
    const searchResponse = await searchApi;
    expect(searchResponse.ok()).toBeTruthy();
    expect(searchResponse.url()).toContain("q=");
  });

  test("abre Satisfacción QR desde Encuestas", async ({ page }) => {
    await gotoApp(page, "/dashboard/encuestas/satisfaccion-qr");
    await expectHeadingOrSkip(page, "Satisfacción QR");
    await expect(page.getByTestId("encuestas-page")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Enviar Respuestas" }),
    ).toBeVisible();
    await expect(page.getByTestId("satisfaccion-qr-placa-estado")).toHaveCount(
      0,
    );
    await expect(page.getByText("Error, La Placa No Existe")).toHaveCount(0);
  });
});
