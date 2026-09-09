import { test, expect } from "@playwright/test";
import {
  apiRequest,
  expectApiOkOrSkip,
  skipUnlessDestructive,
} from "../../helpers/api";
import { getE2eConfig } from "../../helpers/env";

test.describe("Tickets API", () => {
  test("GET /tickets/activos con sesión", async ({ request }) => {
    const response = await apiRequest(request, "/tickets/activos?page=1&limit=10");
    await expectApiOkOrSkip(response.status(), "GET /tickets/activos");
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /tickets/mis-tickets/:nit con sesión", async ({ request }) => {
    const { nit } = getE2eConfig();
    const response = await apiRequest(request, `/tickets/mis-tickets/${nit}`);
    await expectApiOkOrSkip(response.status(), "GET /tickets/mis-tickets");
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("POST /tickets crea un registro de laboratorio", async ({ request }) => {
    skipUnlessDestructive();
    const { nit } = getE2eConfig();
    const marker = `[E2E] api ${Date.now()}`;
    const response = await apiRequest(request, "/tickets", {
      method: "POST",
      data: {
        tipo_soporte: "Software",
        descripcion: marker,
        sede: "Giron",
        usuario_id: Number(nit),
        prioridad: "baja",
        empresa: [],
      },
    });
    await expectApiOkOrSkip(response.status(), "POST /tickets");
    const body = (await response.json()) as {
      status?: boolean;
      data?: { id?: number };
    };
    expect(body.status).toBeTruthy();
    expect(body.data?.id).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /tickets/activos exige autenticación", async ({ request }) => {
      const response = await apiRequest(request, "/tickets/activos?page=1&limit=10");
      expect(response.status()).toBe(401);
    });
  });
});
