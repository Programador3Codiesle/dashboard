import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";
import { rangoMesesAtras } from "../../helpers/dates";

test.describe("Cotizar API", () => {
  test("GET /cotizador/livianos con sesión", async ({ request }) => {
    const response = await apiRequest(request, "/cotizador/livianos");
    await expectApiOkOrSkip(response.status(), "GET /cotizador/livianos");
    const body = await response.json();
    expect(body).toBeTruthy();
  });

  test("GET /cotizador/informe-cotizaciones/livianos con sesión", async ({
    request,
  }) => {
    const { start, end } = rangoMesesAtras(1);
    const response = await apiRequest(
      request,
      `/cotizador/informe-cotizaciones/livianos?dateStart=${start}&dateEnd=${end}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /cotizador/informe-cotizaciones/livianos",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /cotizador/livianos exige autenticación", async ({ request }) => {
      const response = await apiRequest(request, "/cotizador/livianos");
      expect(response.status()).toBe(401);
    });
  });
});
