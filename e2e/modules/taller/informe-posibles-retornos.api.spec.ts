import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";

const year = new Date().getFullYear();

test.describe("Informe posibles retornos API", () => {
  test("GET /taller/informe-posibles-retornos/catalogos con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/taller/informe-posibles-retornos/catalogos",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /taller/informe-posibles-retornos/catalogos",
    );
    const body = (await response.json()) as {
      tecnicos?: unknown;
      bodegas?: unknown;
    };
    expect(Array.isArray(body.tecnicos)).toBeTruthy();
    expect(Array.isArray(body.bodegas)).toBeTruthy();
  });

  test("POST /taller/informe-posibles-retornos/grafico (solo lectura)", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/taller/informe-posibles-retornos/grafico",
      { method: "POST", data: { year } },
    );
    await expectApiOkOrSkip(
      response.status(),
      "POST /taller/informe-posibles-retornos/grafico",
    );
    const body = (await response.json()) as { response?: string };
    expect(body.response === "success" || body.response === "error").toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /taller/informe-posibles-retornos/catalogos exige autenticación", async ({
      request,
    }) => {
      const response = await apiRequest(
        request,
        "/taller/informe-posibles-retornos/catalogos",
      );
      expect(response.status()).toBe(401);
    });
  });
});
