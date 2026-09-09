import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";

test.describe.configure({ timeout: 120_000 });

const SEDE = "CODIESEL PRINCIPAL";
const BODEGA = "TALLER DIESEL GIRON";

test.describe("Indicadores API", () => {
  test("GET /indicadores/presupuesto-posventa con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/indicadores/presupuesto-posventa",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /indicadores/presupuesto-posventa",
    );
    const body = (await response.json()) as { modo?: string };
    expect(body).toBeTruthy();
    expect(body.modo === "consolidado" || body.modo === "sedes").toBeTruthy();
  });

  test("GET /indicadores/presupuesto-posventa/sedes con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/indicadores/presupuesto-posventa/sedes",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /indicadores/presupuesto-posventa/sedes",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /indicadores/presupuesto-posventa/talleres con sesión", async ({
    request,
  }) => {
    const qs = new URLSearchParams({ sede: SEDE });
    const response = await apiRequest(
      request,
      `/indicadores/presupuesto-posventa/talleres?${qs}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /indicadores/presupuesto-posventa/talleres",
    );
    const body = (await response.json()) as { talleres?: unknown };
    expect(Array.isArray(body.talleres)).toBeTruthy();
  });

  test("GET /indicadores/presupuesto-posventa/tipo-operaciones con sesión", async ({
    request,
  }) => {
    const qs = new URLSearchParams({ bodega: BODEGA });
    const response = await apiRequest(
      request,
      `/indicadores/presupuesto-posventa/tipo-operaciones?${qs}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /indicadores/presupuesto-posventa/tipo-operaciones",
    );
    const body = (await response.json()) as { operaciones?: unknown };
    expect(Array.isArray(body.operaciones)).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /indicadores/presupuesto-posventa exige autenticación", async ({
      request,
    }) => {
      const response = await apiRequest(
        request,
        "/indicadores/presupuesto-posventa",
      );
      expect(response.status()).toBe(401);
    });
  });
});
