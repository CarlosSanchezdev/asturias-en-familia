import { test, expect } from '@playwright/test';

test.describe('S7-10 — Filtrado del mapa', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Esperar al contenedor que Leaflet inyecta dentro de #map
    await page.waitForSelector('#map.leaflet-container', { timeout: 10000 });
  });

  test('el mapa carga y muestra marcadores', async ({ page }) => {
    await expect(page.locator('.leaflet-marker-icon').first())
      .toBeVisible({ timeout: 10000 });
  });

  test('filtrar por zona centro reduce o mantiene marcadores', async ({ page }) => {
    // Esperar a que los marcadores iniciales estén presentes
    await page.waitForSelector('.leaflet-marker-icon', { timeout: 10000 });
    const markersBefore = await page.locator('.leaflet-marker-icon').count();

    // Los botones de zona están en .chips-bar__zones con clase .pill
    await page.click('.chips-bar__zones .pill:has-text("Centro")');
    await page.waitForTimeout(800);

    const markersAfter = await page.locator('.leaflet-marker-icon').count();
    expect(markersAfter).toBeLessThanOrEqual(markersBefore);
  });

  test('desactivar zona restaura todos los marcadores', async ({ page }) => {
    await page.waitForSelector('.leaflet-marker-icon', { timeout: 10000 });
    const markersTotal = await page.locator('.leaflet-marker-icon').count();

    // Activar filtro Centro (selectZone hace toggle: si ya activo, lo desactiva)
    await page.click('.chips-bar__zones .pill:has-text("Centro")');
    await page.waitForTimeout(800);

    // Volver a clickar para deseleccionar (comportamiento toggle de selectZone)
    await page.click('.chips-bar__zones .pill:has-text("Centro")');
    await page.waitForTimeout(800);

    const markersAfter = await page.locator('.leaflet-marker-icon').count();
    expect(markersAfter).toBe(markersTotal);
  });

  test('búsqueda por texto filtra los marcadores visibles', async ({ page }) => {
    await page.waitForSelector('.leaflet-marker-icon', { timeout: 10000 });
    const markersBefore = await page.locator('.leaflet-marker-icon').count();

    // El input de búsqueda está en el header con clase map-header__search-input
    const searchInput = page.locator('input.map-header__search-input');
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    await searchInput.fill('playa');
    await page.waitForTimeout(800);

    const markersAfter = await page.locator('.leaflet-marker-icon').count();
    expect(markersAfter).toBeLessThanOrEqual(markersBefore);
  });

});
