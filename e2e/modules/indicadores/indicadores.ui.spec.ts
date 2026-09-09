import { test, expect } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  expectTestIdOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";

test.describe.configure({ timeout: 120_000 });

const SEDE_PRINCIPAL = "CODIESEL PRINCIPAL";
const TALLER_DIESEL = "TALLER DIESEL GIRON";

test.describe("Indicadores UI", () => {
  test("carga el hub", async ({ page }) => {
    await gotoApp(page, "/dashboard/indicadores");
    await expectHeadingOrSkip(page, "Indicadores");
    await expectTestIdOrSkip(
      page,
      "submodulos-hub",
      "El usuario de prueba no tiene el hub de Indicadores",
    );
  });

  test("carga presupuesto posventa (solo lectura)", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/indicadores/presupuesto-posventa",
      true,
    );
    await gotoApp(page, "/dashboard/indicadores/presupuesto-posventa");
    await expectHeadingOrSkip(page, "Presupuesto POSVENTA");
    await expect(page.getByTestId("indicadores-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/indicadores/presupuesto-posventa",
      true,
    );
    expect(
      response.ok(),
      `GET /indicadores/presupuesto-posventa → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expect(
      page
        .getByTestId("indicadores-progress-card")
        .first()
        .or(
          page.getByText(
            "No hay sedes asignadas a tu perfil para este indicador.",
          ),
        ),
    ).toBeVisible();
  });

  test("carga presupuesto por sedes", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/indicadores/presupuesto-posventa/sedes",
      true,
    );
    await gotoApp(page, "/dashboard/indicadores/presupuesto-posventa/sedes");
    await expectHeadingOrSkip(page, "Presupuesto por sedes");
    await expect(page.getByTestId("indicadores-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/indicadores/presupuesto-posventa/sedes",
      true,
    );
    expect(
      response.ok(),
      `GET /indicadores/presupuesto-posventa/sedes → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expect(
      page.getByTestId("indicadores-progress-card").first(),
    ).toBeVisible();
    await expect(page.getByText(`Total ${SEDE_PRINCIPAL}`)).toBeVisible();
  });

  test("carga presupuesto por talleres de sede principal", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/indicadores/presupuesto-posventa/talleres",
      true,
    );
    const qs = new URLSearchParams({ sede: SEDE_PRINCIPAL });
    await gotoApp(
      page,
      `/dashboard/indicadores/presupuesto-posventa/talleres?${qs}`,
    );
    await expectHeadingOrSkip(page, "Presupuesto por talleres");
    await expect(page.getByTestId("indicadores-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/indicadores/presupuesto-posventa/talleres",
      true,
    );
    expect(
      response.ok(),
      `GET /indicadores/presupuesto-posventa/talleres → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expect(page.getByText(SEDE_PRINCIPAL).first()).toBeVisible();
    await expect(
      page.getByTestId("indicadores-progress-card").first(),
    ).toBeVisible();
    await expect(page.getByText(`Total ${TALLER_DIESEL}`)).toBeVisible();
  });

  test("carga tipos de operación de un taller", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/indicadores/presupuesto-posventa/tipo-operaciones",
      true,
    );
    const qs = new URLSearchParams({
      bodega: TALLER_DIESEL,
      sede: SEDE_PRINCIPAL,
    });
    await gotoApp(
      page,
      `/dashboard/indicadores/presupuesto-posventa/tipo-operaciones?${qs}`,
    );
    await expectHeadingOrSkip(page, "Tipos de operación");
    await expect(page.getByTestId("indicadores-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/indicadores/presupuesto-posventa/tipo-operaciones",
      true,
    );
    expect(
      response.ok(),
      `GET /indicadores/presupuesto-posventa/tipo-operaciones → HTTP ${response.status()}`,
    ).toBeTruthy();

    await expect(page.getByText(TALLER_DIESEL).first()).toBeVisible();
    await expect(
      page.getByTestId("indicadores-progress-card").first(),
    ).toBeVisible();
  });
});
