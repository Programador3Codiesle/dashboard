import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";

test.describe("Encuestas API", () => {
  test("GET /encuestas/satisfaccion con sesión", async ({ request }) => {
    const response = await apiRequest(
      request,
      "/encuestas/satisfaccion?page=1&pageSize=15",
    );
    await expectApiOkOrSkip(response.status(), "GET /encuestas/satisfaccion");
    const body = (await response.json()) as {
      items?: unknown;
      total?: number;
    };
    expect(Array.isArray(body.items)).toBeTruthy();
    expect(typeof body.total).toBe("number");
  });

  test("GET /encuestas/satisfaccion/detalle con sesión", async ({ request }) => {
    const listado = await apiRequest(
      request,
      "/encuestas/satisfaccion?page=1&pageSize=15",
    );
    await expectApiOkOrSkip(listado.status(), "GET /encuestas/satisfaccion");
    const body = (await listado.json()) as {
      items?: { numero?: string }[];
    };
    const ot = body.items?.[0]?.numero;
    test.skip(!ot, "No hay encuestas de satisfacción para consultar detalle");

    const detalle = await apiRequest(
      request,
      `/encuestas/satisfaccion/detalle?ot=${encodeURIComponent(String(ot))}`,
    );
    await expectApiOkOrSkip(
      detalle.status(),
      "GET /encuestas/satisfaccion/detalle",
    );
    const detalleBody = await detalle.json();
    expect(detalleBody).toBeTruthy();
  });

  test("GET /encuestas/nps-colmotores/tecnicos con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/encuestas/nps-colmotores/tecnicos",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /encuestas/nps-colmotores/tecnicos",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /encuestas/satisfaccion exige autenticación", async ({
      request,
    }) => {
      const response = await apiRequest(
        request,
        "/encuestas/satisfaccion?page=1&pageSize=15",
      );
      expect(response.status()).toBe(401);
    });
  });
});
