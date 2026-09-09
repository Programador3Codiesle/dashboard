import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";

test.describe("Informe OT abiertas API", () => {
  test("GET /taller/informe-ot-abiertas/general con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/taller/informe-ot-abiertas/general",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /taller/informe-ot-abiertas/general",
    );
    const body = (await response.json()) as {
      totalesSedes?: unknown;
      ordenes?: unknown;
    };
    expect(Array.isArray(body.totalesSedes)).toBeTruthy();
    expect(Array.isArray(body.ordenes)).toBeTruthy();
  });

  test("GET /taller/informe-ot-abiertas/sede/giron con sesión", async ({
    request,
  }) => {
    const response = await apiRequest(
      request,
      "/taller/informe-ot-abiertas/sede/giron",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /taller/informe-ot-abiertas/sede/giron",
    );
    const body = (await response.json()) as { sede?: string };
    expect(body.sede).toBe("giron");
  });

  test("GET /taller/informe-ot-abiertas/taller/:id con sesión", async ({
    request,
  }) => {
    const sede = await apiRequest(
      request,
      "/taller/informe-ot-abiertas/sede/giron",
    );
    await expectApiOkOrSkip(
      sede.status(),
      "GET /taller/informe-ot-abiertas/sede/giron",
    );
    const body = (await sede.json()) as {
      totalesBodegas?: { bodegaId?: number }[];
    };
    const bodegaId = body.totalesBodegas?.[0]?.bodegaId;
    test.skip(
      !bodegaId,
      "La sede Girón no trajo bodegas para consultar el taller",
    );

    const taller = await apiRequest(
      request,
      `/taller/informe-ot-abiertas/taller/${bodegaId}`,
    );
    await expectApiOkOrSkip(
      taller.status(),
      "GET /taller/informe-ot-abiertas/taller/:id",
    );
    const tallerBody = (await taller.json()) as { asesores?: unknown };
    expect(Array.isArray(tallerBody.asesores)).toBeTruthy();
  });

  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("GET /taller/informe-ot-abiertas/general exige autenticación", async ({
      request,
    }) => {
      const response = await apiRequest(
        request,
        "/taller/informe-ot-abiertas/general",
      );
      expect(response.status()).toBe(401);
    });
  });
});
