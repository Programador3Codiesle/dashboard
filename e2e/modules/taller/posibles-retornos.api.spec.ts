import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";

test.describe("Posibles retornos API", () => {
  test("GET /taller/posibles-retornos/catalogos con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/taller/posibles-retornos/catalogos",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /taller/posibles-retornos/catalogos",
    );
    const body = (await response.json()) as { bodegas?: unknown };
    expect(Array.isArray(body.bodegas)).toBeTruthy();
  });

  test("POST /taller/posibles-retornos/listar (solo lectura)", async ({
    request,
  }) => {
    const response = await apiRequest(request, "/taller/posibles-retornos/listar", {
      method: "POST",
      data: { bodega: -1, page: 1, pageSize: 5 },
    });
    await expectApiOkOrSkip(
      response.status(),
      "POST /taller/posibles-retornos/listar",
    );
    const body = (await response.json()) as {
      total?: number;
      filas?: unknown;
    };
    expect(typeof body.total).toBe("number");
    expect(Array.isArray(body.filas)).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /taller/posibles-retornos/catalogos exige autenticación", async ({
      request,
    }) => {
      const response = await apiRequest(
        request,
        "/taller/posibles-retornos/catalogos",
      );
      expect(response.status()).toBe(401);
    });
  });
});
