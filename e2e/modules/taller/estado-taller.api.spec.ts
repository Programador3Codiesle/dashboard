import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";

test.describe("Estado taller API", () => {
  test("GET /taller/estado-taller con sesión", async ({ request }) => {
    const response = await apiRequest(
      request,
      "/taller/estado-taller?bodega=todas",
    );
    await expectApiOkOrSkip(response.status(), "GET /taller/estado-taller");
    const body = await response.json();
    expect(body).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /taller/estado-taller exige autenticación", async ({ request }) => {
      const response = await apiRequest(
        request,
        "/taller/estado-taller?bodega=todas",
      );
      expect(response.status()).toBe(401);
    });
  });
});
