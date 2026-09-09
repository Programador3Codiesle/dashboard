import { test, expect, type Page, type Response } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  expectTestIdOrSkip,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";
import { mesAnterior } from "../../helpers/dates";

test.describe.configure({ timeout: 120_000 });

const NOMINA_API_TIMEOUT_MS = 80_000;

async function waitExactGet(
  page: Page,
  hits: Response[],
  pathname: string,
): Promise<Response> {
  if (hits.length > 0) {
    return hits[0];
  }
  return page.waitForResponse(
    (response) => {
      if (response.request().method() !== "GET") return false;
      try {
        return new URL(response.url()).pathname === pathname;
      } catch {
        return false;
      }
    },
    { timeout: NOMINA_API_TIMEOUT_MS },
  );
}

async function expectTablaOVacio(
  page: Page,
  tableTestId: string,
  emptyText: string,
  headerName: string,
) {
  const table = page.getByTestId(tableTestId);
  const empty = page.getByText(emptyText).first();
  await expect(table.or(empty)).toBeVisible();
  if (await table.isVisible()) {
    await expect(
      table.getByRole("columnheader", { name: headerName }),
    ).toBeVisible();
  }
}

test.describe("Nómina UI", () => {
  test("carga el hub", async ({ page }) => {
    await gotoApp(page, "/dashboard/nomina");
    await expectHeadingOrSkip(page, "Nómina");
    await expectTestIdOrSkip(
      page,
      "submodulos-hub",
      "El usuario de prueba no tiene el hub de Nómina",
    );
  });

  test("genera comisiones técnicos (solo lectura)", async ({ page }) => {
    const { ym } = mesAnterior();
    const path = "/nomina/comisiones-tecnicos";
    const hits = collectApiResponses(page, path, true);

    await gotoApp(page, "/dashboard/nomina/comisiones-tecnicos");
    await expectHeadingOrSkip(page, "Comisiones técnicos");
    await expect(page.getByTestId("nomina-tecnicos-page")).toBeVisible();

    await page.getByTestId("nomina-tecnicos-mes").fill(ym);
    await page.getByTestId("nomina-tecnicos-generar").click();

    const response = await waitExactGet(page, hits, path);
    expect(
      response.ok(),
      `GET ${path} → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expectTablaOVacio(
      page,
      "nomina-tecnicos-table",
      "No hay datos para el período seleccionado.",
      "Cédula",
    );
  });

  test("genera comisiones jefes sin ingresar valores", async ({ page }) => {
    const { ym } = mesAnterior();
    const path = "/nomina/comisiones-jefes";
    const hits = collectApiResponses(page, path, true);

    await gotoApp(page, "/dashboard/nomina/comisiones-jefes");
    await expectHeadingOrSkip(page, "Comisiones jefes");
    await expect(page.getByTestId("nomina-jefes-page")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Ingresar valores" }),
    ).toBeVisible();

    await page.getByTestId("nomina-jefes-mes").fill(ym);
    await page.getByTestId("nomina-jefes-generar").click();

    const response = await waitExactGet(page, hits, path);
    expect(
      response.ok(),
      `GET ${path} → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expectTablaOVacio(
      page,
      "nomina-jefes-table",
      "No hay datos para el período seleccionado.",
      "Cedula",
    );
  });

  test("genera comisiones lámina y pintura (solo lectura)", async ({
    page,
  }) => {
    const { start, end } = mesAnterior();
    const path = "/nomina/comisiones-lamina-pintura";
    const hits = collectApiResponses(page, path, true);

    await gotoApp(page, "/dashboard/nomina/comisiones-lamina-pintura");
    await expectHeadingOrSkip(page, "Comisiones lámina y pintura");
    await expect(page.getByTestId("nomina-lyp-page")).toBeVisible();

    await page.getByTestId("nomina-lyp-desde").fill(start);
    await page.getByTestId("nomina-lyp-hasta").fill(end);
    await page.getByTestId("nomina-lyp-generar").click();

    const response = await waitExactGet(page, hits, path);
    expect(
      response.ok(),
      `GET ${path} → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expectTablaOVacio(
      page,
      "nomina-lyp-table",
      "No hay datos para el rango seleccionado.",
      "Cédula",
    );
  });

  test("busca comisiones asesores repuestos (solo lectura)", async ({
    page,
  }) => {
    const { ano, mes } = mesAnterior();
    const path = "/nomina/comisiones-asesores-repuestos";
    const hits = collectApiResponses(page, path, true);

    await gotoApp(page, "/dashboard/nomina/comisiones-asesores-repuestos");
    await expectHeadingOrSkip(page, "Comisiones asesores repuestos");
    await expect(page.getByTestId("nomina-asesores-page")).toBeVisible();

    await page.getByTestId("nomina-asesores-ano").selectOption(String(ano));
    await page.getByTestId("nomina-asesores-mes").selectOption(String(mes));
    await page.getByTestId("nomina-asesores-buscar").click();

    const response = await waitExactGet(page, hits, path);
    expect(
      response.ok(),
      `GET ${path} → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expectTablaOVacio(
      page,
      "nomina-asesores-table",
      "No hay información para los filtros seleccionados.",
      "Sede",
    );
  });

  test("genera nómina director flotas (solo lectura)", async ({ page }) => {
    const { ym } = mesAnterior();
    const path = "/nomina/nomina-director-flotas/principal";
    const hits = collectApiResponses(page, path, true);

    await gotoApp(page, "/dashboard/nomina/nomina-director-flotas");
    await expectHeadingOrSkip(page, "Nómina director flotas");
    await expect(page.getByTestId("nomina-director-flotas-page")).toBeVisible();

    await page.getByTestId("nomina-director-flotas-mes").fill(ym);
    await page.getByTestId("nomina-director-flotas-generar").click();

    const response = await waitExactGet(page, hits, path);
    expect(
      response.ok(),
      `GET ${path} → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expectTablaOVacio(
      page,
      "nomina-director-flotas-table",
      "No hay datos para mostrar.",
      "Placa",
    );
  });

  test("genera relación margen materiales (solo lectura)", async ({ page }) => {
    const { ym } = mesAnterior();
    const path = "/nomina/relacion-margen-materiales-colorista";
    const hits = collectApiResponses(page, path, true);

    await gotoApp(
      page,
      "/dashboard/nomina/relacion-margen-materiales-colorista",
    );
    await expectHeadingOrSkip(
      page,
      "Relación margen materiales - Colorista",
    );
    await expect(page.getByTestId("nomina-margen-page")).toBeVisible();

    await page.getByTestId("nomina-margen-mes").fill(ym);
    await page.getByTestId("nomina-margen-sede").selectOption("giron");
    await page.getByTestId("nomina-margen-generar").click();

    const response = await waitExactGet(page, hits, path);
    expect(
      response.ok(),
      `GET ${path} → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expectTablaOVacio(
      page,
      "nomina-margen-table",
      "No hay datos para mostrar.",
      "N° Orden",
    );
  });
});
