import { test, expect, type Page } from "@playwright/test";
import {
  collectApiResponses,
  expectHeadingOrSkip,
  expectTestIdOrSkip,
  firstCollectedOrWait,
} from "../../helpers/api";
import { gotoApp } from "../../helpers/auth";
import { fechaHoyIso } from "../../helpers/dates";

test.describe.configure({ timeout: 120_000 });

async function abrirYEsperarApi(
  page: Page,
  opts: { ruta: string; heading: string; apiPath: string; exact?: boolean },
) {
  const exact = opts.exact ?? true;
  const hits = collectApiResponses(page, opts.apiPath, exact);
  await gotoApp(page, opts.ruta);
  await expectHeadingOrSkip(page, opts.heading);
  await expect(page.getByTestId("administracion-page")).toBeVisible();
  const response = await firstCollectedOrWait(page, hits, opts.apiPath, exact);
  expect(
    response.ok(),
    `GET ${opts.apiPath} → HTTP ${response.status()}`,
  ).toBeTruthy();
  return response;
}

test.describe("Administración UI", () => {
  test("carga el hub", async ({ page }) => {
    await gotoApp(page, "/dashboard/administracion");
    await expectHeadingOrSkip(page, "Administración");
    await expectTestIdOrSkip(
      page,
      "submodulos-hub",
      "El usuario de prueba no tiene el hub de Administración",
    );
  });

  test("lista ausentismos del día", async ({ page }) => {
    await abrirYEsperarApi(page, {
      ruta: "/dashboard/administracion/lista-ausentismo",
      heading: "Lista Ausentismo",
      apiPath: "/administracion/lista-ausentismo/dia-actual",
    });
    await expect(page.getByTestId("adm-lista")).toBeVisible();
  });

  test("lista horas extras del día", async ({ page }) => {
    await abrirYEsperarApi(page, {
      ruta: "/dashboard/administracion/lista-horas-extras",
      heading: "Lista Horas Extras",
      apiPath: "/administracion/lista-horas-extras/dia-actual",
    });
    await expect(page.getByTestId("adm-lista")).toBeVisible();
  });

  test("lista control de vehículos sin registrar", async ({ page }) => {
    await abrirYEsperarApi(page, {
      ruta: "/dashboard/administracion/control-vehiculos",
      heading: "Control Ingreso y Salida de Vehículos",
      apiPath: "/administracion/control-vehiculos",
    });
    const table = page.getByTestId("adm-table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "Placa" }),
    ).toBeVisible();

    const modelosHits = collectApiResponses(
      page,
      "/administracion/control-vehiculos/vehiculos/modelos",
      true,
    );
    await page.getByRole("button", { name: "Registrar Salida" }).click();
    await expect(
      page.getByRole("heading", { name: "Registrar Salida" }),
    ).toBeVisible();
    const modelos = await firstCollectedOrWait(
      page,
      modelosHits,
      "/administracion/control-vehiculos/vehiculos/modelos",
      true,
    );
    expect(
      modelos.status(),
      `GET modelos → HTTP ${modelos.status()}`,
    ).toBeLessThan(500);
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(
      page.getByRole("heading", { name: "Registrar Salida" }),
    ).toHaveCount(0);
  });

  test("lista gestión de compras sin crear ni Excel", async ({ page }) => {
    await abrirYEsperarApi(page, {
      ruta: "/dashboard/administracion/gestion-compras",
      heading: "Gestión de Compras",
      apiPath: "/administracion/gestion-compras",
    });
    const table = page.getByTestId("adm-table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "Descripción" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Nueva Solicitud" }).click();
    await expect(
      page.getByRole("heading", { name: "Nueva Solicitud de Compra" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(
      page.getByRole("heading", { name: "Nueva Solicitud de Compra" }),
    ).toHaveCount(0);
  });

  test("consulta inasistencias del día", async ({ page }) => {
    await abrirYEsperarApi(page, {
      ruta: "/dashboard/administracion/inasistencia",
      heading: "Inasistencia",
      apiPath: "/administracion/inasistencia",
    });
    const table = page.getByTestId("adm-table");
    await expect(table).toBeVisible();
    await expect(
      table.getByRole("columnheader", { name: "Documento" }),
    ).toBeVisible();
  });

  test("consulta informe de ausentismo (solo lectura)", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/administracion/informe-ausentismo",
      true,
    );
    const hoy = fechaHoyIso();
    await gotoApp(page, "/dashboard/administracion/informe-ausentismo");
    await expectHeadingOrSkip(page, "Informe Ausentismo");
    await expect(page.getByTestId("administracion-page")).toBeVisible();

    await page.getByTestId("adm-fecha-inicio").fill(hoy);
    await page.getByTestId("adm-fecha-final").fill(hoy);
    await page.getByTestId("adm-buscar").click();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/administracion/informe-ausentismo",
      true,
    );
    expect(
      response.ok(),
      `GET /administracion/informe-ausentismo → HTTP ${response.status()}`,
    ).toBeTruthy();
    await expect(
      page
        .getByTestId("adm-table")
        .getByRole("columnheader", { name: "Gestionado Por" }),
    ).toBeVisible();
  });

  test("consulta informe de tiempo suplementario (solo lectura)", async ({
    page,
  }) => {
    const hits = collectApiResponses(
      page,
      "/administracion/informe-tiempo-suplementario",
      true,
    );
    const ym = fechaHoyIso().slice(0, 7);
    await gotoApp(
      page,
      "/dashboard/administracion/informe-tiempo-suplementario",
    );
    await expectHeadingOrSkip(page, "Informe Tiempo Suplementario");
    await expect(page.getByTestId("administracion-page")).toBeVisible();

    await page.getByTestId("adm-mes").fill(ym);
    await page.getByTestId("adm-buscar").click();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/administracion/informe-tiempo-suplementario",
      true,
    );
    expect(
      response.ok(),
      `GET /administracion/informe-tiempo-suplementario → HTTP ${response.status()}`,
    ).toBeTruthy();
    await expect(
      page
        .getByTestId("adm-table")
        .getByRole("columnheader", { name: "Nombre del Empleado" }),
    ).toBeVisible();
  });

  test("muestra formatos de nómina sin descargar", async ({ page }) => {
    await gotoApp(page, "/dashboard/administracion/formatos-nomina");
    await expectHeadingOrSkip(page, "Formatos Nómina");
    await expect(page.getByTestId("administracion-page")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Descuento de nómina Codiesel" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Visualizar" }).first().click();
    await expect(page.getByText("Previsualización de formato")).toBeVisible();
    await page.getByTestId("adm-formato-cerrar").click();
    await expect(page.getByText("Previsualización de formato")).toHaveCount(0);
  });

  test("abre reglamento interno", async ({ page }) => {
    await gotoApp(page, "/dashboard/administracion/reglamento-interno");
    await expectHeadingOrSkip(page, "Reglamento Interno de Trabajo");
    await expect(page.getByTestId("administracion-page")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Reglamento Interno de Trabajo Codiesel 2025",
      }),
    ).toBeVisible();
    await expect(
      page.getByTitle("Reglamento Interno de Trabajo Codiesel 2025"),
    ).toBeVisible();
  });

  test("abre informe de sostenibilidad", async ({ page }) => {
    await gotoApp(page, "/dashboard/administracion/informe-sostenibilidad");
    await expectHeadingOrSkip(page, "Informe de Sostenibilidad 2024");
    await expect(page.getByTestId("administracion-page")).toBeVisible();
    await expect(page.getByTitle("Informe de Sostenibilidad 2024")).toBeVisible();
  });

  test("carga tallas de dotación sin guardar", async ({ page }) => {
    await abrirYEsperarApi(page, {
      ruta: "/dashboard/administracion/tallas-dotacion",
      heading: "Tallas Dotación",
      apiPath: "/administracion/tallas-dotacion/mi-talla",
    });
    await expect(page.getByRole("button", { name: "Guardar" })).toBeVisible();
  });

  test("carga evaluación de desempeño sin calificar", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/administracion/evaluacion-desempeno/obtener-id-jefe",
    );
    const pendientesHits = collectApiResponses(
      page,
      "/empleados-pendientes",
    );
    await gotoApp(page, "/dashboard/administracion/evaluacion-desempeno");
    await expectHeadingOrSkip(page, "Evaluación Desempeño Empleado");
    await expect(page.getByTestId("administracion-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/administracion/evaluacion-desempeno/obtener-id-jefe",
    );
    expect(
      response.status(),
      `GET /administracion/evaluacion-desempeno/obtener-id-jefe → HTTP ${response.status()}`,
    ).toBeLessThan(500);

    if (response.ok()) {
      const pendientes = await firstCollectedOrWait(
        page,
        pendientesHits,
        "/empleados-pendientes",
      );
      expect(
        pendientes.status(),
        `GET empleados-pendientes → HTTP ${pendientes.status()}`,
      ).toBeLessThan(500);
    }

    await expect(
      page.getByRole("heading", {
        name: "Empleados Pendientes por Calificar",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Guardar Evaluación" }),
    ).toHaveCount(0);
  });

  test("abre calendario de nuevo ausentismo sin registrar", async ({ page }) => {
    await abrirYEsperarApi(page, {
      ruta: "/dashboard/administracion/nuevo-ausentismo",
      heading: "Nuevo Ausentismo",
      apiPath: "/administracion/nuevo-ausentismo/calendario",
    });
    await expect(page.getByTestId("adm-calendario")).toBeVisible();
    await expect(page.getByText("Dom", { exact: true })).toBeVisible();
  });

  test("abre calendario de solicitud de tiempo sin registrar", async ({
    page,
  }) => {
    await abrirYEsperarApi(page, {
      ruta: "/dashboard/administracion/solicitud-tiempo-suplementario",
      heading: "Solicitud Tiempo Suplementario",
      apiPath: "/administracion/solicitud-tiempo-suplementario/calendario",
    });
    await expect(page.getByTestId("adm-calendario")).toBeVisible();
    await expect(page.getByText("Dom", { exact: true })).toBeVisible();
  });

  test("consulta ajustes de valores contables sin guardar", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/administracion/ajuste-valores",
      true,
    );
    await gotoApp(page, "/dashboard/administracion/ajustes-valores-contables");
    await expectHeadingOrSkip(page, "Ajustes Valores Contables");
    await expect(page.getByTestId("administracion-page")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Ajuste de Valores Contabilidad" }),
    ).toBeVisible();

    await page.getByTestId("adm-ajuste-tipo").fill("DSA");
    await page.getByTestId("adm-ajuste-numero").fill("99999999");
    await page.getByTestId("adm-ajuste-obtener").click();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/administracion/ajuste-valores",
      true,
    );
    expect(
      response.status(),
      `GET /administracion/ajuste-valores → HTTP ${response.status()}`,
    ).toBeLessThan(500);
    await expect(page.getByTestId("adm-ajuste-obtener")).toBeVisible();
  });

  test("abre formato de orden de salida sin guardar", async ({ page }) => {
    const jefesHits = collectApiResponses(page, "/usuarios/mis-jefes", true);
    const tiposHits = collectApiResponses(
      page,
      "/administracion/formato-orden-salida/tipos-salida",
      true,
    );
    await gotoApp(page, "/dashboard/administracion/formato-orden-salida");
    await expectHeadingOrSkip(page, "Formato Orden de Salida");
    await expect(page.getByTestId("administracion-page")).toBeVisible();
    await expect(page.getByText("SGC-FR02", { exact: true })).toBeVisible();
    await expect(page.getByTestId("adm-os-fecha")).toBeVisible();
    await expect(page.getByTestId("adm-os-area")).toBeVisible();
    await expect(page.getByTestId("adm-os-sede")).toBeVisible();

    const jefes = await firstCollectedOrWait(
      page,
      jefesHits,
      "/usuarios/mis-jefes",
      true,
    );
    expect(
      jefes.status(),
      `GET /usuarios/mis-jefes → HTTP ${jefes.status()}`,
    ).toBeLessThan(500);

    const jefeSelect = page.getByTestId("adm-os-jefe");
    await expect(jefeSelect).toBeEnabled();
    const optionCount = await jefeSelect.locator("option").count();
    if (optionCount > 1) {
      const value = await jefeSelect.locator("option").nth(1).getAttribute("value");
      if (value) {
        await jefeSelect.selectOption(value);
        const tipos = await firstCollectedOrWait(
          page,
          tiposHits,
          "/administracion/formato-orden-salida/tipos-salida",
          true,
        );
        expect(
          tipos.status(),
          `GET tipos-salida → HTTP ${tipos.status()}`,
        ).toBeLessThan(500);
        await expect(page.getByTestId("adm-os-tipo")).toBeEnabled();
      }
    }

    await expect(page.getByRole("button", { name: "Guardar" })).toBeVisible();
  });

  test("carga formato de desempeño empleado sin guardar", async ({ page }) => {
    const hits = collectApiResponses(
      page,
      "/administracion/formato-desempeno/",
    );
    await gotoApp(
      page,
      "/dashboard/administracion/formato-desempeno-empleado",
    );
    await expectHeadingOrSkip(page, "Formato Desempeño Empleado");
    await expect(page.getByTestId("administracion-page")).toBeVisible();

    const response = await firstCollectedOrWait(
      page,
      hits,
      "/administracion/formato-desempeno/",
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

    await expect(
      page.getByRole("heading", { name: "Desempeño Laboral" }),
    ).toBeVisible();
    await expect(page.getByTestId("adm-desempeno-table")).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: /Guardar Autoevaluación|Actualizar Autoevaluación/,
      }),
    ).toBeVisible();
  });
});
