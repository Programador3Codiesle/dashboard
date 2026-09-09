import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";
import { mesAnterior } from "../../helpers/dates";

test.describe.configure({ timeout: 120_000 });

test.describe("Nómina API", () => {
  test("GET /nomina/comisiones-tecnicos con sesión", async ({ request }) => {
    const { ym } = mesAnterior();
    const response = await apiRequest(
      request,
      `/nomina/comisiones-tecnicos?mes=${encodeURIComponent(ym)}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /nomina/comisiones-tecnicos",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /nomina/comisiones-jefes con sesión", async ({ request }) => {
    const { ym } = mesAnterior();
    const response = await apiRequest(
      request,
      `/nomina/comisiones-jefes?mes=${encodeURIComponent(ym)}`,
    );
    await expectApiOkOrSkip(response.status(), "GET /nomina/comisiones-jefes");
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /nomina/comisiones-jefes/jefes-por-sede con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      `/nomina/comisiones-jefes/jefes-por-sede?sede=${encodeURIComponent("Barranca")}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /nomina/comisiones-jefes/jefes-por-sede",
    );
    const body = (await response.json()) as { data?: unknown };
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test("GET /nomina/comisiones-lamina-pintura con sesión", async ({
    request,
  }) => {
    const { start, end } = mesAnterior();
    const response = await apiRequest(
      request,
      `/nomina/comisiones-lamina-pintura?desde=${start}&hasta=${end}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /nomina/comisiones-lamina-pintura",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /nomina/comisiones-asesores-repuestos con sesión", async ({
    request,
  }) => {
    const { ano, mes } = mesAnterior();
    const response = await apiRequest(
      request,
      `/nomina/comisiones-asesores-repuestos?mes=${mes}&ano=${ano}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /nomina/comisiones-asesores-repuestos",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /nomina/nomina-director-flotas/principal con sesión", async ({
    request,
  }) => {
    const { ym } = mesAnterior();
    const response = await apiRequest(
      request,
      `/nomina/nomina-director-flotas/principal?mes=${encodeURIComponent(ym)}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /nomina/nomina-director-flotas/principal",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /nomina/nomina-director-flotas/detalle con sesión", async ({
    request,
  }) => {
    const { ym } = mesAnterior();
    const response = await apiRequest(
      request,
      `/nomina/nomina-director-flotas/detalle?mes=${encodeURIComponent(ym)}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /nomina/nomina-director-flotas/detalle",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /nomina/relacion-margen-materiales-colorista con sesión", async ({
    request,
  }) => {
    const { ym } = mesAnterior();
    const response = await apiRequest(
      request,
      `/nomina/relacion-margen-materiales-colorista?mes=${encodeURIComponent(ym)}&sede=giron`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /nomina/relacion-margen-materiales-colorista",
    );
    const body = (await response.json()) as { rows?: unknown };
    expect(Array.isArray(body.rows)).toBeTruthy();
  });

  test("GET /nomina/comisiones-tecnicos/detalle con sesión", async ({
    request,
  }) => {
    const { ym, mes, ano } = mesAnterior();
    const listado = await apiRequest(
      request,
      `/nomina/comisiones-tecnicos?mes=${encodeURIComponent(ym)}`,
    );
    await expectApiOkOrSkip(
      listado.status(),
      "GET /nomina/comisiones-tecnicos",
    );
    const body = (await listado.json()) as { nit?: string }[];
    const nit = body[0]?.nit;
    test.skip(!nit, "No hay técnicos para consultar detalle");

    const detalle = await apiRequest(
      request,
      `/nomina/comisiones-tecnicos/detalle?mes=${mes}&anio=${ano}&nit=${encodeURIComponent(String(nit))}`,
    );
    await expectApiOkOrSkip(
      detalle.status(),
      "GET /nomina/comisiones-tecnicos/detalle",
    );
    const detalleBody = await detalle.json();
    expect(Array.isArray(detalleBody)).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /nomina/comisiones-tecnicos exige autenticación", async ({
      request,
    }) => {
      const { ym } = mesAnterior();
      const response = await apiRequest(
        request,
        `/nomina/comisiones-tecnicos?mes=${encodeURIComponent(ym)}`,
      );
      expect(response.status()).toBe(401);
    });
  });
});
