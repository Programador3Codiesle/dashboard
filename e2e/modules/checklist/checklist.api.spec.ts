import { test, expect } from "@playwright/test";
import { apiRequest } from "../../helpers/api";

test.describe("Checklist API", () => {
  test.describe("sin sesión", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("POST /checklist/guardar exige autenticación", async ({ request }) => {
      const response = await apiRequest(request, "/checklist/guardar", {
        method: "POST",
        data: { check: 1, data: {} },
      });
      expect(response.status()).toBe(401);
    });
  });
});
