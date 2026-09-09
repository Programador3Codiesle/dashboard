import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";
import { fechaHoyIso } from "../../helpers/dates";

test.describe.configure({ timeout: 120_000 });

const BODEGA = "1";

test.describe("Auditoría API", () => {
  test("GET /auditoria/tecnicos con sesión", async ({ request }) => {
    const response = await apiRequest(request, "/auditoria/tecnicos");
    await expectApiOkOrSkip(response.status(), "GET /auditoria/tecnicos");
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /auditoria/ordenes-diarias con sesión", async ({ request }) => {
    const response = await apiRequest(
      request,
      `/auditoria/ordenes-diarias?fecha=${fechaHoyIso()}&bodega=${BODEGA}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /auditoria/ordenes-diarias",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /auditoria/entregas con sesión", async ({ request }) => {
    const ano = new Date().getFullYear();
    const response = await apiRequest(
      request,
      `/auditoria/entregas?ano=${ano}&tipo=1`,
    );
    await expectApiOkOrSkip(response.status(), "GET /auditoria/entregas");
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /auditoria/facturacion-taller con sesión", async ({ request }) => {
    const response = await apiRequest(
      request,
      `/auditoria/facturacion-taller?bodega=${BODEGA}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /auditoria/facturacion-taller",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /auditoria/facturacion-tecnico con sesión", async ({ request }) => {
    const response = await apiRequest(
      request,
      `/auditoria/facturacion-tecnico?bodega=${BODEGA}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /auditoria/facturacion-tecnico",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /auditoria/ordenes-mtto-preventivo con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      `/auditoria/ordenes-mtto-preventivo?bodega=${BODEGA}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /auditoria/ordenes-mtto-preventivo",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /auditoria/ordenes-tecnicos con sesión", async ({ request }) => {
    const response = await apiRequest(
      request,
      `/auditoria/ordenes-tecnicos?bodega=${BODEGA}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /auditoria/ordenes-tecnicos",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /auditoria/nps-fabrica/sedes con sesión", async ({ request }) => {
    const ym = fechaHoyIso().slice(0, 7);
    const response = await apiRequest(
      request,
      `/auditoria/nps-fabrica/sedes?fecha=${encodeURIComponent(ym)}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /auditoria/nps-fabrica/sedes",
    );
    const body = await response.json();
    expect(body).toBeTruthy();
  });

  test("GET /auditoria/nps-fabrica/tecnicos con sesión", async ({ request }) => {
    const ym = fechaHoyIso().slice(0, 7);
    const response = await apiRequest(
      request,
      `/auditoria/nps-fabrica/tecnicos?fecha=${encodeURIComponent(ym)}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /auditoria/nps-fabrica/tecnicos",
    );
    const body = await response.json();
    expect(body).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /auditoria/tecnicos exige autenticación", async ({ request }) => {
      const response = await apiRequest(request, "/auditoria/tecnicos");
      expect(response.status()).toBe(401);
    });
  });
});
