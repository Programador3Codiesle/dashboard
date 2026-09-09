import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";
import { fechaHoyIso, inicioMesIso } from "../../helpers/dates";

test.describe.configure({ timeout: 120_000 });

test.describe("Repuestos API", () => {
  test("GET /repuestos/solicitudes-ev/bodegas con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/repuestos/solicitudes-ev/bodegas",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /repuestos/solicitudes-ev/bodegas",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("POST /repuestos/solicitudes-ev/listar (solo lectura)", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/repuestos/solicitudes-ev/listar",
      { method: "POST", data: { fechaRegistro: fechaHoyIso() } },
    );
    await expectApiOkOrSkip(
      response.status(),
      "POST /repuestos/solicitudes-ev/listar",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("POST /repuestos/solicitudes-ev/detalle con sesión", async ({
    request,
  }) => {
    const listado = await apiRequest(
      request,
      "/repuestos/solicitudes-ev/listar",
      { method: "POST", data: { fechaRegistro: fechaHoyIso() } },
    );
    await expectApiOkOrSkip(
      listado.status(),
      "POST /repuestos/solicitudes-ev/listar",
    );
    const body = (await listado.json()) as { id?: number }[];
    const id = body[0]?.id;
    test.skip(!id, "No hay solicitudes EV del día para consultar detalle");

    const detalle = await apiRequest(
      request,
      "/repuestos/solicitudes-ev/detalle",
      { method: "POST", data: { idSolicitud: id, modo: 1 } },
    );
    await expectApiOkOrSkip(
      detalle.status(),
      "POST /repuestos/solicitudes-ev/detalle",
    );
    const detalleBody = (await detalle.json()) as { lineas?: unknown };
    expect(Array.isArray(detalleBody.lineas)).toBeTruthy();
  });

  test("POST /repuestos/informe-ev-sv/listar (solo lectura)", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/repuestos/informe-ev-sv/listar",
      { method: "POST", data: { fechaRegistro: fechaHoyIso() } },
    );
    await expectApiOkOrSkip(
      response.status(),
      "POST /repuestos/informe-ev-sv/listar",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /informes/postventa/inventario-obsoletos/resumen con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/informes/postventa/inventario-obsoletos/resumen",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /informes/postventa/inventario-obsoletos/resumen",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("POST /repuestos/informe-obsoletos/consultar (solo lectura)", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/repuestos/informe-obsoletos/consultar",
      { method: "POST", data: { opcion: 1, categoria: 2, rango: 1 } },
    );
    await expectApiOkOrSkip(
      response.status(),
      "POST /repuestos/informe-obsoletos/consultar",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("POST /repuestos/orden-compra/listar (solo lectura)", async ({
    request,
  }) => {
    const response = await apiRequest(request, "/repuestos/orden-compra/listar", {
      method: "POST",
      data: { fechaIni: inicioMesIso(), fechaFin: fechaHoyIso() },
    });
    await expectApiOkOrSkip(
      response.status(),
      "POST /repuestos/orden-compra/listar",
    );
    const body = (await response.json()) as { items?: unknown };
    expect(Array.isArray(body.items)).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /repuestos/solicitudes-ev/bodegas exige autenticación", async ({
      request,
    }) => {
      const response = await apiRequest(
        request,
        "/repuestos/solicitudes-ev/bodegas",
      );
      expect(response.status()).toBe(401);
    });
  });
});
