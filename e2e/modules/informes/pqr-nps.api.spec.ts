import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";

test.describe("PQR / NPS API", () => {
  test("GET /informes/postventa/pqr-nps con sesión", async ({ request }) => {
    const response = await apiRequest(
      request,
      "/informes/postventa/pqr-nps?estado=abiertos&pagina=1&limite=10",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /informes/postventa/pqr-nps",
    );
    const body = await response.json();
    expect(body).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET PQR/NPS exige autenticación", async ({ request }) => {
      const response = await apiRequest(
        request,
        "/informes/postventa/pqr-nps?estado=abiertos&pagina=1&limite=10",
      );
      expect(response.status()).toBe(401);
    });
  });
});
