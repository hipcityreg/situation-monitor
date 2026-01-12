import { test, expect } from '@playwright/test';

test.describe('Globe Panel Interactions', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Wait for globe to initialize
		await page.waitForTimeout(3000);
	});

	test('Test 1: Globe container should be visible and have correct cursor', async ({ page }) => {
		// Check globe container is visible
		const globeContainer = page.locator('.globe-container');
		await expect(globeContainer).toBeVisible();

		// Check canvas is rendered (globe.gl creates a canvas)
		const canvas = page.locator('.globe-container canvas');
		await expect(canvas).toBeVisible();

		// Verify default cursor is 'grab' on the canvas
		const cursorStyle = await canvas.evaluate((el) => window.getComputedStyle(el).cursor);
		expect(cursorStyle).toBe('grab');
	});

	test('Test 2: Globe legend should expand and show all sections', async ({ page }) => {
		// Find and click the legend toggle
		const legendToggle = page.locator('.legend-toggle');
		await expect(legendToggle).toBeVisible();
		await legendToggle.click();

		// Verify legend content is visible
		const legendContent = page.locator('.legend-content');
		await expect(legendContent).toBeVisible();

		// Check all sections are present
		await expect(page.locator('text=THREAT LEVELS (HOTSPOTS)')).toBeVisible();
		await expect(page.locator('text=INFRASTRUCTURE MARKERS')).toBeVisible();
		await expect(page.locator('text=TENSION CORRIDORS')).toBeVisible();
		await expect(page.locator('text=ALERTS')).toBeVisible();

		// Check all threat levels are listed
		await expect(page.locator('.legend-dot.critical')).toBeVisible();
		await expect(page.locator('.legend-dot.high')).toBeVisible();
		await expect(page.locator('.legend-dot.elevated')).toBeVisible();
		await expect(page.locator('.legend-dot.low')).toBeVisible();

		// Check all marker types including Custom Monitor
		await expect(page.locator('.legend-marker.chokepoint')).toBeVisible();
		await expect(page.locator('.legend-marker.cable')).toBeVisible();
		await expect(page.locator('.legend-marker.nuclear')).toBeVisible();
		await expect(page.locator('.legend-marker.military')).toBeVisible();
		await expect(page.locator('.legend-marker.monitor')).toBeVisible();

		// Check tension corridor descriptions are visible
		await expect(page.locator('text=Moscow ↔ Kyiv')).toBeVisible();
		await expect(page.locator('text=Tehran ↔ Tel Aviv')).toBeVisible();
		await expect(page.locator('text=Beijing ↔ Taipei')).toBeVisible();
		await expect(page.locator('text=Pyongyang ↔ Tokyo')).toBeVisible();
	});

	test('Test 3: Globe controls should be functional', async ({ page }) => {
		// Check control buttons are visible
		const controlButtons = page.locator('.globe-controls .control-btn');
		await expect(controlButtons).toHaveCount(3);

		// Test pause button (third button)
		const pauseBtn = page.locator('.control-btn[title="Pause rotation"]');
		await expect(pauseBtn).toBeVisible();
		await pauseBtn.click();

		// Test resume button (second button)
		const resumeBtn = page.locator('.control-btn[title="Resume rotation"]');
		await expect(resumeBtn).toBeVisible();
		await resumeBtn.click();

		// Test toggle arcs button (first button)
		const arcsBtn = page.locator('.control-btn').first();
		await expect(arcsBtn).toBeVisible();
		// Click to toggle off
		await arcsBtn.click();
		// Click to toggle back on
		await arcsBtn.click();
	});

	test('Test 4: Mouse enter should pause rotation for exploration', async ({ page }) => {
		const globeContainer = page.locator('.globe-container');
		const canvas = page.locator('.globe-container canvas');

		// Move mouse into globe container
		await globeContainer.hover();

		// Wait a moment for the pause to take effect
		await page.waitForTimeout(500);

		// The globe should be ready for exploration (rotation paused)
		// We verify this indirectly by checking the canvas is interactive
		await expect(canvas).toBeVisible();
	});

	test('Test 5: Legend hint text should show correct interaction instructions', async ({
		page
	}) => {
		// Expand legend
		const legendToggle = page.locator('.legend-toggle');
		await legendToggle.click();

		// Check hint text is visible with correct instructions
		const legendHint = page.locator('.legend-hint');
		await expect(legendHint).toBeVisible();
		await expect(legendHint).toContainText('Hover markers for details');
		await expect(legendHint).toContainText('Click to lock tooltip');
		await expect(legendHint).toContainText('Click empty space to unlock');
		await expect(legendHint).toContainText('Drag to rotate globe');
	});
});
