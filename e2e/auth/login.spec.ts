import { test, expect } from "@playwright/test";
import { loginViaUi, waitForApiResponse } from "../helpers/auth";
import { getE2eConfig } from "../helpers/env";

test.describe("Login", () => {
  test("muestra el formulario de acceso", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Bienvenido" })).toBeVisible();
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByLabel("Usuario")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Iniciar Sesión" }),
    ).toBeVisible();
  });

  test("rechaza credenciales inválidas y permanece en login", async ({
    page,
  }) => {
    const config = getE2eConfig();

    await page.goto("/login");
    await expect(page.getByTestId("login-submit")).toBeEnabled();
    await page.getByTestId("login-user").fill(config.nit);
    await page.getByTestId("login-password").fill("clave-invalida-e2e");

    const loginResponsePromise = waitForApiResponse(page, "/auth/login", "POST");
    await page.getByTestId("login-submit").click();
    const loginResponse = await loginResponsePromise;

    expect(loginResponse.ok()).toBeFalsy();
    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("inicia sesión con el usuario de prueba y llega al dashboard", async ({
    page,
  }) => {
    const loginResponse = await loginViaUi(page);

    expect(loginResponse.ok()).toBeTruthy();
    await expect(page.getByTestId("dashboard-shell")).toBeVisible();
    await expect(page.getByTestId("sidebar")).toBeVisible();
    await expect(page.getByTestId("sidebar-nav")).toBeVisible();
  });
});
