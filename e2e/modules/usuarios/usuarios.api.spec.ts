import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";
import { getE2eConfig } from "../../helpers/env";

test.describe("Usuarios API", () => {
  test("GET /usuarios lista con sesión", async ({ request }) => {
    const response = await apiRequest(request, "/usuarios?page=1&limit=10");
    await expectApiOkOrSkip(response.status(), "GET /usuarios");
    const body = (await response.json()) as { items?: unknown[]; total?: number };
    expect(Array.isArray(body.items) || Array.isArray(body)).toBeTruthy();
  });

  test("GET /usuarios/mi-perfil con sesión", async ({ request }) => {
    const response = await apiRequest(request, "/usuarios/mi-perfil");
    await expectApiOkOrSkip(response.status(), "GET /usuarios/mi-perfil");
    const body = (await response.json()) as {
      nit?: string | null;
      jefes?: unknown[];
      tallas?: { talla_camisa?: string | null };
    };
    expect(body).toHaveProperty("nit");
    expect(Array.isArray(body.jefes)).toBeTruthy();
    expect(body.tallas).toHaveProperty("talla_camisa");
  });

  test("GET /usuarios?search filtra por NIT de prueba", async ({ request }) => {
    const { nit } = getE2eConfig();
    const response = await apiRequest(
      request,
      `/usuarios?page=1&limit=10&search=${encodeURIComponent(nit)}`,
    );
    await expectApiOkOrSkip(response.status(), "GET /usuarios?search");
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /usuarios exige autenticación", async ({ request }) => {
      const response = await apiRequest(request, "/usuarios?page=1&limit=10");
      expect(response.status()).toBe(401);
    });

    test("GET /usuarios/mi-perfil exige autenticación", async ({ request }) => {
      const response = await apiRequest(request, "/usuarios/mi-perfil");
      expect(response.status()).toBe(401);
    });
  });
});
