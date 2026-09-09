import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  expectTestIdOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";

async function abrirListado(
  page: import("@playwright/test").Page,
  opts: {
    ruta: string;
    heading: string;
    apiPath: string;
    tableTestId: string;
    headerName: string;
  },
) {
  const hits = collectApiResponses(page, opts.apiPath, true);
  await gotoApp(page, opts.ruta);
  await expectHeadingOrSkip(page, opts.heading);
  await expect(page.getByTestId("mantenimiento-page")).toBeVisible();

  const response = await firstCollectedOrWait(page, hits, opts.apiPath, true);
  expect(
    response.ok(),
    `GET ${opts.apiPath} → HTTP ${response.status()}`,
  ).toBeTruthy();

  const table = page.getByTestId(opts.tableTestId);
  await expect(table).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: opts.headerName }),
  ).toBeVisible();
}

test.describe("Mantenimiento UI", () => {
  test("carga el hub", async ({ page }) => {
    await gotoApp(page, "/dashboard/mantenimiento");
    await expectHeadingOrSkip(page, "Mantenimiento");
    await expectTestIdOrSkip(
      page,
      "submodulos-hub",
      "El usuario de prueba no tiene el hub de Mantenimiento",
    );
  });

  test("lista equipos y espera el API", async ({ page }) => {
    await abrirListado(page, {
      ruta: "/dashboard/mantenimiento/equipos",
      heading: "Gestión de Equipos y Mantenimiento",
      apiPath: "/mantenimiento/equipos",
      tableTestId: "mtto-equipos-table",
      headerName: "Codigo",
    });
  });

  test("busca equipos sin crear ni retirar", async ({ page }) => {
    await gotoApp(page, "/dashboard/mantenimiento/equipos");
    await expectHeadingOrSkip(page, "Gestión de Equipos y Mantenimiento");
    await expect(page.getByTestId("mtto-equipos-search")).toBeVisible();

    const searchApi = page.waitForResponse(
      (response) => {
        if (response.request().method() !== "GET") return false;
        try {
          const url = new URL(response.url());
          return (
            url.pathname === "/mantenimiento/equipos" &&
            (url.searchParams.get("filter") ?? "").length > 0
          );
        } catch {
          return false;
        }
      },
      { timeout: 40_000 },
    );
    await page.getByTestId("mtto-equipos-search").fill("E2E");
    const searchResponse = await searchApi;
    expect(searchResponse.ok()).toBeTruthy();
    expect(searchResponse.url()).toContain("filter=");
  });

  test("lista solicitudes correctivas sin crear", async ({ page }) => {
    await abrirListado(page, {
      ruta: "/dashboard/mantenimiento/mtto-correctivo",
      heading: "Solicitudes de Mantenimiento",
      apiPath: "/mantenimiento/correctivo/solicitudes",
      tableTestId: "mtto-correctivo-table",
      headerName: "Solicitud",
    });
  });

  test("carga el cronograma preventivo sin subir Excel", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/mantenimiento/preventivo/eventos",
      true,
    );

    await gotoApp(page, "/dashboard/mantenimiento/mtto-preventivo");
    await expectHeadingOrSkip(
      page,
      "Plan o Cronograma de Mantenimiento Preventivo",
    );
    await expect(page.getByTestId("mantenimiento-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/mantenimiento/preventivo/eventos",
      true,
    );
    expect(
      response.ok(),
      `GET /mantenimiento/preventivo/eventos → HTTP ${response.status()}`,
    ).toBeTruthy();
    await expect(page.getByTestId("mtto-preventivo-calendar")).toBeVisible();
  });

  test("abre el listado preventivo sin eliminar", async ({ page }) => {
    await abrirListado(page, {
      ruta: "/dashboard/mantenimiento/mtto-preventivo/listado",
      heading: "Listado OT preventivas pendientes",
      apiPath: "/mantenimiento/preventivo/listado",
      tableTestId: "mtto-preventivo-listado-table",
      headerName: "Código",
    });
  });

  test("carga el informe preventivo", async ({ page }) => {
    await abrirListado(page, {
      ruta: "/dashboard/mantenimiento/informe-preventivo",
      heading: "Informe de mantenimiento preventivo",
      apiPath: "/mantenimiento/informes/preventivo",
      tableTestId: "mtto-informe-preventivo-table",
      headerName: "CODIGO",
    });
  });

  test("carga el informe correctivo", async ({ page }) => {
    await abrirListado(page, {
      ruta: "/dashboard/mantenimiento/informe-correctivo",
      heading: "Informe de mantenimiento correctivo",
      apiPath: "/mantenimiento/informes/correctivo",
      tableTestId: "mtto-informe-correctivo-table",
      headerName: "CODIGO",
    });
  });
});
