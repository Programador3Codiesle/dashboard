import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";
import { fechaHoyIso } from "../../helpers/dates";

test.describe("Contact Center — Informe base de datos API", () => {
  test("POST /contact-center/informe-base-datos/consultar (solo lectura)", async ({
    request,
  }) => {
    const hoy = fechaHoyIso();
    const response = await apiRequest(
      request,
      "/contact-center/informe-base-datos/consultar",
      {
        method: "POST",
        data: { tipoInfDB: "1", dateStart: hoy, dateEnd: hoy },
      },
    );
    await expectApiOkOrSkip(
      response.status(),
      "POST /contact-center/informe-base-datos/consultar",
    );
    const body = (await response.json()) as {
      status?: boolean;
      data?: unknown;
      message?: string;
    };
    expect(typeof body.status).toBe("boolean");
    expect(Array.isArray(body.data)).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("POST consultar exige autenticación", async ({ request }) => {
      const hoy = fechaHoyIso();
      const response = await apiRequest(
        request,
        "/contact-center/informe-base-datos/consultar",
        {
          method: "POST",
          data: { tipoInfDB: "1", dateStart: hoy, dateEnd: hoy },
        },
      );
      expect(response.status()).toBe(401);
    });
  });
});
