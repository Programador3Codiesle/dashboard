import { test, expect } from "@playwright/test";
import { apiRequest, expectApiOkOrSkip } from "../../helpers/api";

test.describe("Ranking trimestral API", () => {
  test("GET /taller/ranking-trimestral con sesión", async ({ request }) => {
    const response = await apiRequest(
      request,
      "/taller/ranking-trimestral?ano=2021&trimestre=4",
    );
    await expectApiOkOrSkip(
      response.status(),
      "GET /taller/ranking-trimestral",
    );
    const body = (await response.json()) as {
      ano?: number;
      trimestre?: number;
      filas?: unknown;
    };
    expect(body.ano).toBe(2021);
    expect(body.trimestre).toBe(4);
    expect(Array.isArray(body.filas)).toBeTruthy();
  });
});
