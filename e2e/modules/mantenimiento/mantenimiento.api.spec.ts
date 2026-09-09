import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";

test.describe("Mantenimiento API", () => {
  test("GET /mantenimiento/catalogos con sesión", async ({ request }) => {
    const response = await apiRequest(request, "/mantenimiento/catalogos");
    await expectApiOkOrSkip(response.status(), "GET /mantenimiento/catalogos");
    const body = (await response.json()) as {
      familias?: unknown;
      bodegas?: unknown;
    };
    expect(Array.isArray(body.familias)).toBeTruthy();
    expect(Array.isArray(body.bodegas)).toBeTruthy();
  });

  test("GET /mantenimiento/equipos con sesión", async ({ request }) => {
    const response = await apiRequest(
      request,
      "/mantenimiento/equipos?page=1&limit=10",
    );
    await expectApiOkOrSkip(response.status(), "GET /mantenimiento/equipos");
    const body = (await response.json()) as {
      data?: unknown;
      total?: number;
    };
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(typeof body.total).toBe("number");
  });

  test("GET /mantenimiento/equipos/:id/hoja-vida con sesión", async ({
    request,
  }) => {
    const listado = await apiRequest(
      request,
      "/mantenimiento/equipos?page=1&limit=10",
    );
    await expectApiOkOrSkip(listado.status(), "GET /mantenimiento/equipos");
    const body = (await listado.json()) as {
      data?: { id_equipo?: number }[];
    };
    const id = body.data?.[0]?.id_equipo;
    test.skip(!id, "No hay equipos para consultar hoja de vida");

    const hoja = await apiRequest(
      request,
      `/mantenimiento/equipos/${id}/hoja-vida`,
    );
    await expectApiOkOrSkip(
      hoja.status(),
      "GET /mantenimiento/equipos/:id/hoja-vida",
    );
    const hojaBody = (await hoja.json()) as { equipo?: unknown };
    expect(hojaBody.equipo).toBeTruthy();
  });

  test("GET /mantenimiento/correctivo/solicitudes con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/mantenimiento/correctivo/solicitudes",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /mantenimiento/correctivo/solicitudes",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /mantenimiento/correctivo/solicitudes/:id con sesión", async ({
    request,
  }) => {
    const listado = await apiRequest(
      request,
      "/mantenimiento/correctivo/solicitudes",
    );
    await expectApiOkOrSkip(
      listado.status(),
      "GET /mantenimiento/correctivo/solicitudes",
    );
    const body = (await listado.json()) as { id_solicitud?: number }[];
    const id = body[0]?.id_solicitud;
    test.skip(!id, "No hay solicitudes correctivas para consultar detalle");

    const detalle = await apiRequest(
      request,
      `/mantenimiento/correctivo/solicitudes/${id}`,
    );
    await expectApiOkOrSkip(
      detalle.status(),
      "GET /mantenimiento/correctivo/solicitudes/:id",
    );
    const detalleBody = await detalle.json();
    expect(detalleBody).toBeTruthy();
  });

  test("GET /mantenimiento/preventivo/eventos con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/mantenimiento/preventivo/eventos",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /mantenimiento/preventivo/eventos",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /mantenimiento/preventivo/listado con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/mantenimiento/preventivo/listado",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /mantenimiento/preventivo/listado",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /mantenimiento/preventivo/ordenes/:id con sesión", async ({
    request,
  }) => {
    const listado = await apiRequest(
      request,
      "/mantenimiento/preventivo/listado",
    );
    await expectApiOkOrSkip(
      listado.status(),
      "GET /mantenimiento/preventivo/listado",
    );
    const body = (await listado.json()) as { id_mantenimientos?: number }[];
    const id = body[0]?.id_mantenimientos;
    test.skip(!id, "No hay OT preventivas para consultar detalle");

    const orden = await apiRequest(
      request,
      `/mantenimiento/preventivo/ordenes/${id}`,
    );
    await expectApiOkOrSkip(
      orden.status(),
      "GET /mantenimiento/preventivo/ordenes/:id",
    );
    const ordenBody = await orden.json();
    expect(ordenBody).toBeTruthy();
  });

  test("GET /mantenimiento/informes/preventivo con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/mantenimiento/informes/preventivo",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /mantenimiento/informes/preventivo",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /mantenimiento/informes/correctivo con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/mantenimiento/informes/correctivo",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /mantenimiento/informes/correctivo",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /mantenimiento/catalogos exige autenticación", async ({
      request,
    }) => {
      const response = await apiRequest(request, "/mantenimiento/catalogos");
      expect(response.status()).toBe(401);
    });
  });
});
