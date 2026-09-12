import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  expectTestIdOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";

test.describe.configure({ timeout: 120_000 });

test.describe("Órdenes TOT UI", () => {
  test("carga el hub", async ({ page }) => {
    await gotoApp(page, "/dashboard/ordenes-tot");
    await expectHeadingOrSkip(page, "Órdenes & TOT");
    await expectTestIdOrSkip(
      page,
      "submodulos-hub",
      "El usuario de prueba no tiene el hub de Órdenes & TOT",
    );
  });

  test("abre portería sin confirmar salidas", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/ordenes-tot/porteria/vehiculos",
      true,
    );
    await gotoApp(page, "/dashboard/ordenes-tot/buscar-ordenes");
    await expectHeadingOrSkip(page, "Buscar Órdenes");
    await expect(page.getByTestId("ordenes-tot-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/ordenes-tot/porteria/vehiculos",
      true,
    );
    expect(
      response.ok(),
      `GET /ordenes-tot/porteria/vehiculos → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expect(page.getByTestId("ot-porteria")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Vehículos" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "TOT", exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Órdenes Generales" }),
    ).toBeVisible();
  });

  test("lista vehículos pendientes sin registrar", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/ordenes-tot/vehiculos/pendientes",
      true,
    );
    await gotoApp(page, "/dashboard/ordenes-tot/dar-salida-vehiculos");
    await expectHeadingOrSkip(page, "Dar salida vehículos");
    await expect(page.getByTestId("ordenes-tot-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/ordenes-tot/vehiculos/pendientes",
      true,
    );
    expect(
      response.ok(),
      `GET /ordenes-tot/vehiculos/pendientes → HTTP ${response.status()}`,
    ).toBeTruthy();

    const table = page.getByTestId("ot-table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "Placa" }),
    ).toBeVisible();

    await page.getByTestId("ot-registrar").click();
    await expect(page.getByTestId("ot-placa")).toBeVisible();
    await expect(page.getByTestId("ot-orden")).toBeVisible();
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByTestId("ot-placa")).toBeHidden();
  });

  test("lista TOT pendientes sin crear ni reingresar", async ({ page }) => {
    const hits = collectApiResponses(page, "/ordenes-tot/tot/listado", true);
    await gotoApp(page, "/dashboard/ordenes-tot/dar-salida-tot");
    await expectHeadingOrSkip(page, "Dar salida TOT");
    await expect(page.getByTestId("ordenes-tot-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/ordenes-tot/tot/listado",
      true,
    );
    expect(
      response.ok(),
      `GET /ordenes-tot/tot/listado → HTTP ${response.status()}`,
    ).toBeTruthy();

    const table = page.getByTestId("ot-table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "N° de orden" }),
    ).toBeVisible();
  });

  test("lista candidatos de repuestos sin registrar", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/ordenes-tot/repuestos/candidatos",
      true,
    );
    await gotoApp(page, "/dashboard/ordenes-tot/ingreso-repuestos");
    await expectHeadingOrSkip(page, "Ingreso Repuestos");
    await expect(page.getByTestId("ordenes-tot-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/ordenes-tot/repuestos/candidatos",
      true,
    );
    expect(
      response.ok(),
      `GET /ordenes-tot/repuestos/candidatos → HTTP ${response.status()}`,
    ).toBeTruthy();

    const table = page.getByTestId("ot-table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "N° orden" }),
    ).toBeVisible();

    await page.getByTestId("ot-registrar").click();
    await expect(page.getByTestId("ot-placa")).toBeVisible();
    await expect(page.getByTestId("ot-orden")).toBeVisible();
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByTestId("ot-placa")).toBeHidden();
  });

  test("lista órdenes generales pendientes sin registrar", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/ordenes-tot/ordenes-generales/pendientes",
      true,
    );
    await gotoApp(page, "/dashboard/ordenes-tot/dar-salida-ordenes");
    await expectHeadingOrSkip(page, "Dar salida Órdenes");
    await expect(page.getByTestId("ordenes-tot-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/ordenes-tot/ordenes-generales/pendientes",
      true,
    );
    expect(
      response.ok(),
      `GET /ordenes-tot/ordenes-generales/pendientes → HTTP ${response.status()}`,
    ).toBeTruthy();

    const table = page.getByTestId("ot-table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "Serial" }),
    ).toBeVisible();

    await page.getByTestId("ot-registrar").click();
    await expect(page.getByTestId("ot-serial")).toBeVisible();
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByTestId("ot-serial")).toBeHidden();
  });
});
