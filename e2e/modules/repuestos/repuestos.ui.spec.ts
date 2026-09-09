import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  expectTestIdOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";
import { fechaHoyIso, inicioMesIso } from "../../helpers/dates";

test.describe.configure({ timeout: 120_000 });

test.describe("Repuestos UI", () => {
  test("carga el hub", async ({ page }) => {
    await gotoApp(page, "/dashboard/repuestos");
    await expectHeadingOrSkip(page, "Repuestos");
    await expectTestIdOrSkip(
      page,
      "submodulos-hub",
      "El usuario de prueba no tiene el hub de Repuestos",
    );
  });

  test("abre Entradas Varias sin crear solicitud", async ({ page }) => {
    await gotoApp(page, "/dashboard/repuestos/entradas-varias");
    await expectHeadingOrSkip(page, "Solicitud de Entrada Varia");
    await expect(page.getByTestId("repuestos-page")).toBeVisible();
    await expect(page.getByTestId("repuestos-ev-orden")).toBeVisible();
    await expect(page.getByRole("button", { name: "Buscar" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Enviar solicitud" }),
    ).toBeVisible();
  });

  test("lista solicitudes EV del día (solo lectura)", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/repuestos/solicitudes-ev/listar",
      true,
      "POST",
    );

    await gotoApp(page, "/dashboard/repuestos/solicitudes-ev");
    await expectHeadingOrSkip(page, "Gestión Entradas Varias");
    await expect(page.getByTestId("repuestos-page")).toBeVisible();

    await page.getByTestId("repuestos-ev-fecha").fill(fechaHoyIso());
    await page.getByTestId("repuestos-ev-buscar").click();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/repuestos/solicitudes-ev/listar",
      true,
      "POST",
    );
    expect(
      response.ok(),
      `POST /repuestos/solicitudes-ev/listar → HTTP ${response.status()}`,
    ).toBeTruthy();

    const table = page.getByTestId("repuestos-solicitudes-table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "N° Solicitud" }),
    ).toBeVisible();
  });

  test("consulta informe EV/SV del día", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/repuestos/informe-ev-sv/listar",
      true,
      "POST",
    );

    await gotoApp(page, "/dashboard/repuestos/informe-ev-sv");
    await expectHeadingOrSkip(page, "Informe EV y SV");
    await expect(page.getByTestId("repuestos-page")).toBeVisible();

    await page.getByTestId("repuestos-ev-fecha").fill(fechaHoyIso());
    await page.getByTestId("repuestos-ev-buscar").click();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/repuestos/informe-ev-sv/listar",
      true,
      "POST",
    );
    expect(
      response.ok(),
      `POST /repuestos/informe-ev-sv/listar → HTTP ${response.status()}`,
    ).toBeTruthy();

    const table = page.getByTestId("repuestos-informe-ev-table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "Solicitud" }),
    ).toBeVisible();
  });

  test("carga inventario obsoletos sin abrir detalle", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/informes/postventa/inventario-obsoletos/resumen",
      true,
    );

    await gotoApp(page, "/dashboard/repuestos/inventario-obsoletos");
    await expectHeadingOrSkip(page, "Inventario Obsoletos");
    await expect(page.getByTestId("repuestos-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/informes/postventa/inventario-obsoletos/resumen",
      true,
    );
    expect(
      response.ok(),
      `GET /informes/postventa/inventario-obsoletos/resumen → HTTP ${response.status()}`,
    ).toBeTruthy();

    const table = page.getByTestId("repuestos-inventario-table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "Tipo" }),
    ).toBeVisible();
  });

  test("consulta informe obsoletos (solo lectura)", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/repuestos/informe-obsoletos/consultar",
      true,
      "POST",
    );

    await gotoApp(page, "/dashboard/repuestos/informe-obsoletos");
    await expectHeadingOrSkip(page, "Informe Obsoletos");
    await expect(page.getByTestId("repuestos-page")).toBeVisible();

    await page.getByTestId("repuestos-obsoletos-categoria-1").selectOption("2");
    await page.getByTestId("repuestos-obsoletos-rango-1").fill("1");
    await page.getByTestId("repuestos-obsoletos-generar-1").click();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/repuestos/informe-obsoletos/consultar",
      true,
      "POST",
    );
    expect(
      response.ok(),
      `POST /repuestos/informe-obsoletos/consultar → HTTP ${response.status()}`,
    ).toBeTruthy();
    await expect(
      page.getByTestId("repuestos-obsoletos-generar-1"),
    ).toBeVisible();
  });

  test("lista órdenes de compra del mes sin autorizar", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/repuestos/orden-compra/listar",
      true,
      "POST",
    );

    await gotoApp(page, "/dashboard/repuestos/orden-compra");
    await expectHeadingOrSkip(page, "Órdenes de Compra Repuestos");
    await expect(page.getByTestId("repuestos-page")).toBeVisible();

    await page.getByTestId("repuestos-oc-desde").fill(inicioMesIso());
    await page.getByTestId("repuestos-oc-hasta").fill(fechaHoyIso());
    await page.getByTestId("repuestos-oc-buscar").click();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/repuestos/orden-compra/listar",
      true,
      "POST",
    );
    expect(
      response.ok(),
      `POST /repuestos/orden-compra/listar → HTTP ${response.status()}`,
    ).toBeTruthy();

    const table = page.getByTestId("repuestos-oc-table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "N° OC" }),
    ).toBeVisible();
  });
});
