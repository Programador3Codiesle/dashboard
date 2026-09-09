import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";
import { fechaHoyIso } from "../../helpers/dates";

test.describe("Contact Center — Agendamiento leads API", () => {
  test("GET /contact-center/agendamiento-leads/motivos con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/contact-center/agendamiento-leads/motivos",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /contact-center/agendamiento-leads/motivos",
    );
    const body = await response.json();
    expect(Array.isArray(body) || Array.isArray(body.motivos)).toBeTruthy();
  });

  test("POST /contact-center/agendamiento-leads/listar (solo lectura)", async ({
    request,
  }) => {
    const hoy = fechaHoyIso();
    const response = await apiRequest(
      request,
      "/contact-center/agendamiento-leads/listar",
      {
        method: "POST",
        data: { tipoLeads: "0", fecha_ini: hoy, fecha_fin: hoy },
      },
    );
    await expectApiOkOrSkip(
      response.status(),
      "POST /contact-center/agendamiento-leads/listar",
    );
    const body = await response.json();
    expect(Array.isArray(body) || Array.isArray(body.items)).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("POST /contact-center/agendamiento-leads/listar exige autenticación", async ({
      request,
    }) => {
      const response = await apiRequest(
        request,
        "/contact-center/agendamiento-leads/listar",
        { method: "POST", data: {} },
      );
      expect(response.status()).toBe(401);
    });
  });
});
