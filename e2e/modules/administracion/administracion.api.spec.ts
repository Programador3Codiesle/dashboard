import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";
import { fechaHoyIso, inicioMesIso } from "../../helpers/dates";
import { getE2eConfig } from "../../helpers/env";

test.describe.configure({ timeout: 120_000 });

function rangoMesActual() {
  const start = inicioMesIso();
  const end = fechaHoyIso();
  return { start, end };
}

test.describe("Administración API", () => {
  test("GET /administracion/lista-ausentismo/dia-actual con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/administracion/lista-ausentismo/dia-actual",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/lista-ausentismo/dia-actual",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /administracion/lista-horas-extras/dia-actual con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/administracion/lista-horas-extras/dia-actual",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/lista-horas-extras/dia-actual",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /administracion/control-vehiculos con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/administracion/control-vehiculos",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/control-vehiculos",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /administracion/gestion-compras con sesión", async ({ request }) => {
    const response = await apiRequest(
      request,
      "/administracion/gestion-compras?pagina=1&limite=10",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/gestion-compras",
    );
    const body = (await response.json()) as { items?: unknown };
    expect(Array.isArray(body.items) || Array.isArray(body)).toBeTruthy();
  });

  test("GET /administracion/inasistencia con sesión", async ({ request }) => {
    const hoy = fechaHoyIso();
    const response = await apiRequest(
      request,
      `/administracion/inasistencia?fecha_inicio=${hoy}&fecha_final=${hoy}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/inasistencia",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /administracion/informe-ausentismo con sesión", async ({
    request,
  }) => {
    const { start, end } = rangoMesActual();
    const response = await apiRequest(
      request,
      `/administracion/informe-ausentismo?fecha_desde=${start}&fecha_hasta=${end}&pagina=1&limite=10`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/informe-ausentismo",
    );
    const body = await response.json();
    expect(body).toBeTruthy();
  });

  test("GET /administracion/informe-tiempo-suplementario con sesión", async ({
    request,
  }) => {
    const { start, end } = rangoMesActual();
    const response = await apiRequest(
      request,
      `/administracion/informe-tiempo-suplementario?fecha_desde=${start}&fecha_hasta=${end}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/informe-tiempo-suplementario",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /administracion/tallas-dotacion/mi-talla con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/administracion/tallas-dotacion/mi-talla?id_empresa=1",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/tallas-dotacion/mi-talla",
    );
    expect(await response.json()).toBeTruthy();
  });

  test("GET /administracion/nuevo-ausentismo/calendario con sesión", async ({
    request,
  }) => {
    const now = new Date();
    const response = await apiRequest(
      request,
      `/administracion/nuevo-ausentismo/calendario?mes=${now.getMonth() + 1}&anio=${now.getFullYear()}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/nuevo-ausentismo/calendario",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /administracion/formatos-nomina con sesión", async ({ request }) => {
    const response = await apiRequest(request, "/administracion/formatos-nomina");
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/formatos-nomina",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /administracion/evaluacion-desempeno/obtener-id-jefe con sesión", async ({
    request,
  }) => {
    const { nit } = getE2eConfig();
    const response = await apiRequest(
      request,
      `/administracion/evaluacion-desempeno/obtener-id-jefe/${encodeURIComponent(nit)}`,
    );
    expect(
      response.status(),
      `GET obtener-id-jefe → HTTP ${response.status()}`,
    ).toBeLessThan(500);
  });

  test("GET /administracion/ajuste-valores con sesión (consulta)", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/administracion/ajuste-valores?tipo=DSA&numero=99999999",
    );
    if (response.status() === 401 || response.status() === 403) {
      test.skip(
        true,
        `Sin permiso API (${response.status()}) en GET /administracion/ajuste-valores`,
      );
    }
    expect(
      response.status(),
      `GET /administracion/ajuste-valores → HTTP ${response.status()}`,
    ).toBeLessThan(500);
  });

  test("GET /administracion/formato-desempeno/:nit con sesión", async ({
    request,
  }) => {
    const { nit } = getE2eConfig();
    const response = await apiRequest(
      request,
      `/administracion/formato-desempeno/${encodeURIComponent(nit)}`,
    );
    if (response.status() === 401 || response.status() === 403) {
      test.skip(
        true,
        `Sin permiso API (${response.status()}) en GET formato-desempeno`,
      );
    }
    expect(
      [200, 404],
      `GET formato-desempeno → HTTP ${response.status()}`,
    ).toContain(response.status());
  });

  test("GET /administracion/formato-orden-salida/tipos-salida con sesión", async ({
    request,
  }) => {
    const { nit } = getE2eConfig();
    const response = await apiRequest(
      request,
      `/administracion/formato-orden-salida/tipos-salida?nitJefe=${encodeURIComponent(nit)}`,
    );
    if (response.status() === 401 || response.status() === 403) {
      test.skip(
        true,
        `Sin permiso API (${response.status()}) en GET tipos-salida`,
      );
    }
    expect(
      response.status(),
      `GET tipos-salida → HTTP ${response.status()}`,
    ).toBeLessThan(500);
  });

  test("GET /administracion/solicitud-tiempo-suplementario/calendario con sesión", async ({
    request,
  }) => {
    const now = new Date();
    const response = await apiRequest(
      request,
      `/administracion/solicitud-tiempo-suplementario/calendario?mes=${now.getMonth() + 1}&anio=${now.getFullYear()}`,
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/solicitud-tiempo-suplementario/calendario",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("GET /administracion/reglamento-interno con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/administracion/reglamento-interno",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/reglamento-interno",
    );
    const body = (await response.json()) as { ruta?: string };
    expect(body.ruta).toBeTruthy();
  });

  test("GET /administracion/informe-sostenibilidad con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/administracion/informe-sostenibilidad",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/informe-sostenibilidad",
    );
    const body = (await response.json()) as { ruta?: string };
    expect(body.ruta).toBeTruthy();
  });

  test("GET /administracion/control-vehiculos/vehiculos/modelos con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/administracion/control-vehiculos/vehiculos/modelos",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /administracion/control-vehiculos/vehiculos/modelos",
    );
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /administracion/lista-ausentismo/dia-actual exige autenticación", async ({
      request,
    }) => {
      const response = await apiRequest(
        request,
        "/administracion/lista-ausentismo/dia-actual",
      );
      expect(response.status()).toBe(401);
    });
  });
});
