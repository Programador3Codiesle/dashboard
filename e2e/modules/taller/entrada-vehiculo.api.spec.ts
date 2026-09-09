import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";
import { fechaHoyIso } from "../../helpers/dates";

test.describe("Entrada de vehículo API", () => {
  test("GET /taller/entrada-vehiculo con sesión", async ({ request }) => {
    const response = await apiRequest(request, "/taller/entrada-vehiculo");
    await expectApiOkOrSkip(response.status(), "GET /taller/entrada-vehiculo");
    const body = await response.json();
    expect(body).toBeTruthy();
  });

  test("GET /taller/entrada-vehiculo/citas-programadas con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      `/taller/entrada-vehiculo/citas-programadas?fecha=${fechaHoyIso()}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /taller/entrada-vehiculo/citas-programadas",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /taller/entrada-vehiculo exige autenticación", async ({
      request,
    }) => {
      const response = await apiRequest(request, "/taller/entrada-vehiculo");
      expect(response.status()).toBe(401);
    });
  });
});
