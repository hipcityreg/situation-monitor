/**
 * Tests for settings store
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

// Mock $app/environment before importing the store
vi.mock('$app/environment', () => ({
	browser: true
}));

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		})
	};
})();

Object.defineProperty(globalThis, 'localStorage', {
	value: localStorageMock
});

describe('Settings Store', () => {
	beforeEach(async () => {
		localStorageMock.clear();
		vi.clearAllMocks();

		// Re-import the store to reset state
		vi.resetModules();
	});

	it('should have default state with all panels enabled', async () => {
		const { settings } = await import('./settings');

		const state = get(settings);
		expect(state.initialized).toBe(false);

		// Check that common panels are enabled by default
		expect(state.enabled['map']).toBe(true);
		expect(state.enabled['politics']).toBe(true);
		expect(state.enabled['tech']).toBe(true);
	});

	it('should toggle panel visibility', async () => {
		const { settings } = await import('./settings');

		// Initially enabled
		expect(get(settings).enabled['tech']).toBe(true);

		// Toggle off
		settings.togglePanel('tech');
		expect(get(settings).enabled['tech']).toBe(false);

		// Toggle on
		settings.togglePanel('tech');
		expect(get(settings).enabled['tech']).toBe(true);
	});

	it('should persist panel settings to localStorage', async () => {
		const { settings } = await import('./settings');

		settings.togglePanel('finance');

		expect(localStorageMock.setItem).toHaveBeenCalledWith(
			'situationMonitorPanels',
			expect.any(String)
		);

		const savedData = JSON.parse(
			localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1][1]
		);
		expect(savedData['finance']).toBe(false);
	});

	it('should update panel order', async () => {
		const { settings } = await import('./settings');

		const newOrder = ['tech', 'finance', 'politics', 'map'] as const;
		settings.updateOrder([...newOrder]);

		const state = get(settings);
		expect(state.order.slice(0, 4)).toEqual([...newOrder]);
	});

	it('should update panel size', async () => {
		const { settings } = await import('./settings');

		settings.updateSize('map', { width: 800, height: 600 });

		const state = get(settings);
		expect(state.sizes['map']).toEqual({ width: 800, height: 600 });
	});

	it('should initialize store', async () => {
		const { settings } = await import('./settings');

		expect(get(settings).initialized).toBe(false);
		settings.init();
		expect(get(settings).initialized).toBe(true);
	});

	it('should reset to defaults', async () => {
		const { settings } = await import('./settings');

		// Make some changes
		settings.togglePanel('tech');
		settings.updateSize('map', { width: 1000 });

		// Reset
		settings.reset();

		const state = get(settings);
		expect(state.enabled['tech']).toBe(true);
		expect(state.sizes['map']).toBeUndefined();
	});

	it('should derive enabled panels correctly', async () => {
		const { settings, enabledPanels } = await import('./settings');

		const enabledBefore = get(enabledPanels);
		expect(enabledBefore).toContain('map');
		expect(enabledBefore).toContain('politics');
		expect(enabledBefore).not.toContain('whales');
		expect(enabledBefore).not.toContain('polymarket');

		settings.togglePanel('map');
		settings.togglePanel('politics');

		const enabledAfter = get(enabledPanels);
		expect(enabledAfter).not.toContain('map');
		expect(enabledAfter).not.toContain('politics');
		expect(enabledAfter).not.toContain('whales');
		expect(enabledAfter).not.toContain('polymarket');
	});
});
