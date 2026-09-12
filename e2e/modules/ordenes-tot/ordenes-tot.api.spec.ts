import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";

function expectListPayload(body: unknown) {
  if (Array.isArray(body)) {
    expect(Array.isArray(body)).toBeTruthy();
    return;
  }
  const record = body as { items?: unknown; data?: unknown };
  expect(body).toBeTruthy();
  expect(
    Array.isArray(record.items) || Array.isArray(record.data),
  ).toBeTruthy();
}

test.describe("Órdenes TOT API", () => {
  test("GET /ordenes-tot/porteria/vehiculos con sesión", async ({ request }) => {
    const response = await apiRequest(
      request,
      "/ordenes-tot/porteria/vehiculos",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /ordenes-tot/porteria/vehiculos",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /ordenes-tot/porteria/tot con sesión", async ({ request }) => {
    const response = await apiRequest(request, "/ordenes-tot/porteria/tot");
    await expectApiOkOrSkip(response.status(), "GET /ordenes-tot/porteria/tot");
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /ordenes-tot/porteria/ordenes-generales con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/ordenes-tot/porteria/ordenes-generales",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /ordenes-tot/porteria/ordenes-generales",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /ordenes-tot/vehiculos/pendientes con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/ordenes-tot/vehiculos/pendientes",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /ordenes-tot/vehiculos/pendientes",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /ordenes-tot/tot/listado con sesión", async ({ request }) => {
    const response = await apiRequest(
      request,
      "/ordenes-tot/tot/listado?estado=1&page=1&limit=10",
    );
    await expectApiOkOrSkip(response.status(), "GET /ordenes-tot/tot/listado");
    const body = await response.json();
    expectListPayload(body);
  });

  test("GET /ordenes-tot/repuestos/candidatos con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/ordenes-tot/repuestos/candidatos",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /ordenes-tot/repuestos/candidatos",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /ordenes-tot/ordenes-generales/pendientes con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/ordenes-tot/ordenes-generales/pendientes",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /ordenes-tot/ordenes-generales/pendientes",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /ordenes-tot/validar-orden con sesión", async ({ request }) => {
    const response = await apiRequest(
      request,
      "/ordenes-tot/validar-orden?orden=0",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /ordenes-tot/validar-orden",
    );
    const body = (await response.json()) as { abierta?: boolean };
    expect(typeof body.abierta).toBe("boolean");
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /ordenes-tot/porteria/vehiculos exige autenticación", async ({
      request,
    }) => {
      const response = await apiRequest(
        request,
        "/ordenes-tot/porteria/vehiculos",
      );
      expect(response.status()).toBe(401);
    });
  });
});
