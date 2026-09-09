import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";

test.describe("Informe posibles retornos UI", () => {
  test("carga catálogos y el gráfico del año actual", async ({ page }) => {
    const catalogosHits = collectApiResponses(
      page,
      "/taller/informe-posibles-retornos/catalogos",
      true,
    );
    const graficoHits = collectApiResponses(
      page,
      "/taller/informe-posibles-retornos/grafico",
      true,
      "POST",
    );

    await gotoApp(page, "/dashboard/taller/informe-posibles-retornos");
    await expectHeadingOrSkip(page, "Informe posibles retornos");
    await expect(page.getByTestId("taller-page")).toBeVisible();

    const catalogos = await firstCollectedOrWait(
      page,
      catalogosHits,
      "/taller/informe-posibles-retornos/catalogos",
      true,
    );
    expect(
      catalogos.ok(),
      `GET /taller/informe-posibles-retornos/catalogos → HTTP ${catalogos.status()}`,
    ).toBeTruthy();

    const grafico = await firstCollectedOrWait(
      page,
      graficoHits,
      "/taller/informe-posibles-retornos/grafico",
      true,
      "POST",
    );
    expect(
      grafico.ok(),
      `POST /taller/informe-posibles-retornos/grafico → HTTP ${grafico.status()}`,
    ).toBeTruthy();

    await expect(
      page.getByTestId("informe-posibles-retornos-chart"),
    ).toBeVisible();
    await expect(
      page
        .getByRole("heading", { name: "Entradas Vs. Retornos" })
        .or(
          page.getByText(
            "Seleccione los filtros y presione GENERAR para ver el gráfico",
          ),
        ),
    ).toBeVisible();
  });
});
