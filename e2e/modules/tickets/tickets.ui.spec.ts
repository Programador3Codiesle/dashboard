import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  firstCollectedOrWait,
  skipUnlessDestructive,
  waitForApiPath,
} from "../../helpers/api";

test.describe("Tickets UI", () => {
  test("carga el módulo, espera el API y muestra listado o vacío", async ({
    page,
  }) => {
    const hits = collectApiResponses(page, "/tickets/");

    await page.goto("/dashboard/tickets");

    await expect(page.getByTestId("tickets-module")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Tickets de Soporte" }),
    ).toBeVisible();
    await expect(page.getByTestId("tickets-new")).toBeVisible();
    await expect(page.getByRole("link", { name: "Mis Tickets" })).toBeVisible();

    const listResponse = await firstCollectedOrWait(page, hits, "/tickets/");
    expect(
      listResponse.ok(),
      `Listado tickets → HTTP ${listResponse.status()}`,
    ).toBeTruthy();

    await expect(page).toHaveURL(
      /\/dashboard\/tickets\/(activos|mis-tickets|finalizados)/,
    );

    await expect(
      page
        .getByTestId("tickets-table")
        .or(page.getByTestId("tickets-cards"))
        .or(page.getByTestId("tickets-empty"))
        .or(page.getByRole("heading", { name: "Aún no has creado tickets" }))
        .or(page.getByRole("heading", { name: "No hay tickets activos" })),
    ).toBeVisible();
  });

  test("abre el formulario de nuevo ticket sin crear datos", async ({ page }) => {
    await page.goto("/dashboard/tickets");
    await expect(page.getByTestId("tickets-new")).toBeVisible();
    await page.getByTestId("tickets-new").click();
    await expect(page.getByRole("heading", { name: "Nuevo ticket" })).toBeVisible();
    await expect(page.getByText("Tipo de soporte")).toBeVisible();
  });

  test("navega a Mis Tickets y recarga el listado", async ({ page }) => {
    const hits = collectApiResponses(page, "/tickets/mis-tickets");
    await page.goto("/dashboard/tickets/mis-tickets");
    await expect(page).toHaveURL(/\/dashboard\/tickets\/mis-tickets/);
    const response = await firstCollectedOrWait(page, hits, "/tickets/mis-tickets");
    expect(response.ok()).toBeTruthy();
  });

  test("crea un ticket de laboratorio con prefijo [E2E]", async ({ page }) => {
    skipUnlessDestructive();
    const marker = `[E2E] ticket ${Date.now()}`;

    await page.goto("/dashboard/tickets");
    await page.getByTestId("tickets-new").click();
    await expect(page.getByRole("heading", { name: "Nuevo ticket" })).toBeVisible();

    await page.getByTestId("tickets-tipo").selectOption({ label: "Software" });
    await page.getByTestId("tickets-sede").selectOption({ label: "Giron" });
    await page.getByTestId("tickets-descripcion").fill(marker);
    await page.getByTestId("tickets-descripcion").blur();

    const createApi = page.waitForResponse(
      (response) => {
        if (response.request().method() !== "POST") return false;
        try {
          const pathname = new URL(response.url()).pathname.replace(/\/+$/, "");
          return pathname === "/tickets";
        } catch {
          return false;
        }
      },
      { timeout: 40_000 },
    );
    await page.getByTestId("tickets-submit").click();
    const createResponse = await createApi;
    expect(
      createResponse.ok(),
      `POST /tickets → HTTP ${createResponse.status()}`,
    ).toBeTruthy();

    await expect(page.getByRole("heading", { name: "Nuevo ticket" })).toBeHidden();
    await expect(page.getByText("Ticket creado correctamente")).toBeVisible();
  });
});
