import { test, expect } from "@playwright/test";
import { expectHeadingOrSkip, expectTestIdOrSkip } from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";

test.describe("Checklist UI", () => {
  test("carga el hub", async ({ page }) => {
    await gotoApp(page, "/dashboard/checklist");
    await expectHeadingOrSkip(page, "Checklist");
    await expectTestIdOrSkip(
      page,
      "submodulos-hub",
      "El usuario de prueba no tiene el hub de Checklist",
    );
  });

  test("abre el formulario de alineadores sin guardar", async ({ page }) => {
    await gotoApp(page, "/dashboard/checklist/alineadores");
    await expectHeadingOrSkip(
      page,
      "Inspección preoperacional de elevadores de alineador",
    );
    await expect(page.getByTestId("checklist-form")).toBeVisible();
    await expect(page.getByRole("button", { name: "Guardar" })).toBeVisible();
  });
});
