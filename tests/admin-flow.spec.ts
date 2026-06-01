import { test, expect, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
	await page.goto("/auth/login");
	await page.fill("#email", "admin@asturias-familia.es");
	await page.fill("#password", "Admin1234");
	await page.click('button[type="submit"]');
	await page.waitForURL(/\/admin/, { timeout: 8000 });
}

test.describe("S7-09 — Flujo admin: login y crear actividad", () => {
	test("login correcto redirige a /admin", async ({ page }) => {
		await page.goto("/auth/login");
		await page.fill("#email", "admin@asturias-familia.es");
		await page.fill("#password", "Admin1234");
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/admin/, { timeout: 8000 });
	});

	test("el dashboard muestra listado de actividades", async ({ page }) => {
		await loginAsAdmin(page);
		await expect(page.locator("table.activity-table")).toBeVisible({ timeout: 8000 });
		await expect(page.locator("table.activity-table tbody tr").first()).toBeVisible({ timeout: 8000 });
	});

	test("acceso a /admin sin login redirige a /auth/login", async ({ page }) => {
		await page.goto("/admin");
		await expect(page).toHaveURL(/\/auth\/login/, { timeout: 8000 });
	});

	test("botón Nueva Actividad abre el formulario", async ({ page }) => {
		await loginAsAdmin(page);
		// El botón está en la cabecera del dashboard como <a routerLink="/admin/actividades/nueva">
		await page.click('a:has-text("Nueva actividad")');
		await expect(page).toHaveURL(/\/admin\/actividades\/nueva/, { timeout: 8000 });
		// El formulario debe mostrar el título "Nueva actividad"
		await expect(page.locator("h1.form-header__title")).toHaveText("Nueva actividad", { timeout: 5000 });
	});
});

