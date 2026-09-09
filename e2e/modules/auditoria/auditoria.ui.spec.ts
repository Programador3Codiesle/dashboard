import { test, expect, type Page } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  expectTestIdOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";
import { fechaHoyIso } from "../../helpers/dates";

test.describe.configure({ timeout: 120_000 });

const BODEGA_PRINCIPAL = "1";

async function consultarBodega(
  page: Page,
  opts: {
    ruta: string;
    heading: string;
    bodegaTestId: string;
    buscarTestId: string;
    apiPath: string;
    headerName: string;
  },
) {
  const hits = collectApiResponses(page, opts.apiPath, true);
  await gotoApp(page, opts.ruta);
  await expectHeadingOrSkip(page, opts.heading);
  await expect(page.getByTestId("auditoria-page")).toBeVisible();

  await page.getByTestId(opts.bodegaTestId).selectOption(BODEGA_PRINCIPAL);
  await page.getByTestId(opts.buscarTestId).click();

  const response = await firstCollectedOrWait(page, hits, opts.apiPath, true);
  expect(
    response.ok(),
    `GET ${opts.apiPath} → HTTP ${response.status()}`,
  ).toBeTruthy();

  const table = page.getByTestId("auditoria-table");
  await expect(table).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: opts.headerName }),
  ).toBeVisible();
}

test.describe("Auditoría UI", () => {
  test("carga el hub", async ({ page }) => {
    await gotoApp(page, "/dashboard/auditoria");
    await expectHeadingOrSkip(page, "Auditoría");
    await expectTestIdOrSkip(
      page,
      "submodulos-hub",
      "El usuario de prueba no tiene el hub de Auditoría",
    );
  });

  test("consulta órdenes diarias (solo lectura)", async ({ page }) => {
    const hits = collectApiResponses(page, "/auditoria/ordenes-diarias", true);
    await gotoApp(page, "/dashboard/auditoria/ordenes-diarias");
    await expectHeadingOrSkip(page, "Control de Órdenes Diarias");
    await expect(page.getByTestId("auditoria-page")).toBeVisible();

    await page.getByTestId("aud-od-fecha").fill(fechaHoyIso());
    await page.getByTestId("aud-od-bodega").selectOption(BODEGA_PRINCIPAL);
    await page.getByTestId("aud-od-buscar").click();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/auditoria/ordenes-diarias",
      true,
    );
    expect(
      response.ok(),
      `GET /auditoria/ordenes-diarias → HTTP ${response.status()}`,
    ).toBeTruthy();
    await expect(page.getByTestId("auditoria-table")).toBeVisible();
    await expect(
      page
        .getByTestId("auditoria-table")
        .getByRole("columnheader", { name: "NOMBRES" }),
    ).toBeVisible();
  });

  test("consulta entregas livianos (solo lectura)", async ({ page }) => {
    const hits = collectApiResponses(page, "/auditoria/entregas", true);
    await gotoApp(page, "/dashboard/auditoria/entregas");
    await expectHeadingOrSkip(page, "Entregas por tipo de vehículos");
    await expect(page.getByTestId("auditoria-page")).toBeVisible();

    await page.getByTestId("aud-ent-livianos").click();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/auditoria/entregas",
      true,
    );
    expect(
      response.ok(),
      `GET /auditoria/entregas → HTTP ${response.status()}`,
    ).toBeTruthy();
    await expect(
      page
        .getByTestId("auditoria-table")
        .getByRole("columnheader", { name: "Mes" }),
    ).toBeVisible();
  });

  test("consulta facturación taller", async ({ page }) => {
    await consultarBodega(page, {
      ruta: "/dashboard/auditoria/facturacion-taller",
      heading: "Facturación total taller vs presupuesto",
      bodegaTestId: "aud-ft-bodega",
      buscarTestId: "aud-ft-buscar",
      apiPath: "/auditoria/facturacion-taller",
      headerName: "SEDE",
    });
  });

  test("consulta facturación técnico por bodega", async ({ page }) => {
    await consultarBodega(page, {
      ruta: "/dashboard/auditoria/facturacion-tecnico",
      heading: "Facturación total técnico vs presupuesto",
      bodegaTestId: "aud-ftec-bodega",
      buscarTestId: "aud-ftec-buscar",
      apiPath: "/auditoria/facturacion-tecnico",
      headerName: "TÉCNICO",
    });
  });

  test("consulta OT preventivo vs presupuesto", async ({ page }) => {
    await consultarBodega(page, {
      ruta: "/dashboard/auditoria/ordenes-mtto-preventivo",
      heading: "Órdenes de mantenimiento preventivo vs presupuestos",
      bodegaTestId: "aud-mtto-bodega",
      buscarTestId: "aud-mtto-buscar",
      apiPath: "/auditoria/ordenes-mtto-preventivo",
      headerName: "SEDE",
    });
  });

  test("consulta órdenes técnicos por bodega", async ({ page }) => {
    await consultarBodega(page, {
      ruta: "/dashboard/auditoria/ordenes-tecnicos",
      heading: "Órdenes técnicos vs presupuesto últimos 6 meses",
      bodegaTestId: "aud-ot-bodega",
      buscarTestId: "aud-ot-buscar",
      apiPath: "/auditoria/ordenes-tecnicos",
      headerName: "TÉCNICO",
    });
  });

  test("consulta NPS fábrica por sede", async ({ page }) => {
    const hits = collectApiResponses(page, "/auditoria/nps-fabrica/sedes", true);
    const ym = fechaHoyIso().slice(0, 7);

    await gotoApp(page, "/dashboard/auditoria/nps-fabrica");
    await expectHeadingOrSkip(page, "NPS Fábrica");
    await expect(page.getByTestId("auditoria-page")).toBeVisible();

    await page.getByTestId("aud-nps-mes").fill(ym);
    await page.getByTestId("aud-nps-buscar").click();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/auditoria/nps-fabrica/sedes",
      true,
    );
    expect(
      response.ok(),
      `GET /auditoria/nps-fabrica/sedes → HTTP ${response.status()}`,
    ).toBeTruthy();
    await expect(
      page.getByRole("heading", { name: "Calificación NPS por sede" }),
    ).toBeVisible();
  });

  test("abre retornos por sede (solo lectura)", async ({ page }) => {
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

    await gotoApp(page, "/dashboard/auditoria/retornos-por-sede");
    await expectHeadingOrSkip(page, "Retornos por Sede");
    await expect(page.getByTestId("auditoria-page")).toBeVisible();

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
      page
        .getByRole("heading", { name: "Entradas Vs. Retornos" })
        .or(
          page.getByText(
            "Seleccione los filtros y presione GENERAR para ver el gráfico",
          ),
        ),
    ).toBeVisible();
  });

  test("abre PQR reutilizando el informe", async ({ page }) => {
    const hits = collectApiResponses(page, "/informes/postventa/pqr-nps");
    await gotoApp(page, "/dashboard/auditoria/pqr");
    await expectHeadingOrSkip(page, "PQR / NPS");

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/informes/postventa/pqr-nps",
    );
    expect(
      response.ok(),
      `GET /informes/postventa/pqr-nps → HTTP ${response.status()}`,
    ).toBeTruthy();
  });
});
