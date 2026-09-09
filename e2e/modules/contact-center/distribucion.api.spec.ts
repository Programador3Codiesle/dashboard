import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";

test.describe("Contact Center — Distribución API", () => {
  test("GET /contact-center/distribucion/agentes con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/contact-center/distribucion/agentes",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /contact-center/distribucion/agentes",
    );
    const body = await response.json();
    expect(body).toBeTruthy();
  });

  test("GET /contact-center/distribucion/matriz con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/contact-center/distribucion/matriz",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /contact-center/distribucion/matriz",
    );
    const body = await response.json();
    expect(body).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /contact-center/distribucion/agentes exige autenticación", async ({
      request,
    }) => {
      const response = await apiRequest(
        request,
        "/contact-center/distribucion/agentes",
      );
      expect(response.status()).toBe(401);
    });
  });
});
