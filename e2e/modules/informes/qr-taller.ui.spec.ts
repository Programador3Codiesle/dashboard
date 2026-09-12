import { test, expect } from "@playwright/test";
import { expectHeadingOrSkip } from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";

test.describe("Informes QR taller UI", () => {
  test("abre Informes QR taller", async ({ page }) => {
    await gotoApp(page, "/dashboard/informes/qr-taller");
    await expectHeadingOrSkip(page, "Informes QR taller");
    await expect(page.getByTestId("informes-page")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Enviar Respuestas" }),
    ).toBeVisible();
    await expect(page.getByTestId("satisfaccion-qr-placa-estado")).toHaveCount(
      0,
    );
    await expect(page.getByText("Error, La Placa No Existe")).toHaveCount(0);
  });
});
