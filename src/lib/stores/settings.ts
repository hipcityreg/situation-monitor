/**
 * Settings store - panel visibility, order, sizes, and theme
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import {
	PANELS,
	NON_DRAGGABLE_PANELS,
	PRESETS,
	ONBOARDING_STORAGE_KEY,
	PRESET_STORAGE_KEY,
	type PanelId
} from '$lib/config';

// Storage keys
const STORAGE_KEYS = {
	panels: 'situationMonitorPanels',
	order: 'panelOrder',
	sizes: 'panelSizes',
	theme: 'theme',
	tempUnit: 'temperatureUnit'
} as const;

// Types
export interface PanelSettings {
	enabled: Record<PanelId, boolean>;
	order: PanelId[];
	sizes: Record<PanelId, { width?: number; height?: number }>;
}

export interface SettingsState extends PanelSettings {
	initialized: boolean;
	theme: 'dark' | 'light';
	tempUnit: 'c' | 'f';
}

// Default settings
function getDefaultSettings(): SettingsState {
	const allPanelIds = Object.keys(PANELS) as PanelId[];

	return {
		enabled: {
			...(Object.fromEntries(allPanelIds.map((id) => [id, true])) as Record<PanelId, boolean>),
			printer: false,
			correlation: false,
			whales: false,
			polymarket: false,
			contracts: false,
			layoffs: false
		},
		order: allPanelIds,
		sizes: {} as Record<PanelId, { width?: number; height?: number }>,
		theme: 'dark',
		tempUnit: 'f',
		initialized: false
	};
}

// Load from localStorage
function loadFromStorage(): Partial<SettingsState> {
	if (!browser) return {};

	try {
		const panels = localStorage.getItem(STORAGE_KEYS.panels);
		const order = localStorage.getItem(STORAGE_KEYS.order);
		const sizes = localStorage.getItem(STORAGE_KEYS.sizes);
		const theme = localStorage.getItem(STORAGE_KEYS.theme);
		const tempUnit = localStorage.getItem(STORAGE_KEYS.tempUnit);

		const result: Partial<SettingsState> = {
			theme: theme === 'light' ? 'light' : 'dark',
			tempUnit: tempUnit === 'c' ? 'c' : 'f'
		};

		if (panels) {
			result.enabled = JSON.parse(panels);
		}
		if (order) {
			result.order = JSON.parse(order);
		}
		if (sizes) {
			result.sizes = JSON.parse(sizes);
		}

		return result;
	} catch (e) {
		console.warn('Failed to load settings from localStorage:', e);
		return {};
	}
}

// Save to localStorage
function saveToStorage(key: keyof typeof STORAGE_KEYS, value: unknown): void {
	if (!browser) return;

	try {
		localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
	} catch (e) {
		console.warn(`Failed to save ${key} to localStorage:`, e);
	}
}

// Create the store
function createSettingsStore() {
	const defaults = getDefaultSettings();
	const saved = loadFromStorage();

	const initialState: SettingsState = {
		...defaults,
		...saved,
		// Ensure nested objects merge correctly if saved is partial
		enabled: { ...defaults.enabled, ...saved.enabled },
		sizes: { ...defaults.sizes, ...saved.sizes },
		initialized: false
	};

	const { subscribe, set, update } = writable<SettingsState>(initialState);

	return {
		subscribe,

		/**
		 * Initialize store (call after hydration)
		 * Applies the theme to the document root
		 */
		init() {
			update((state) => {
				if (browser) {
					document.documentElement.setAttribute('data-theme', state.theme);
				}
				return { ...state, initialized: true };
			});
		},

		/**
		 * Toggle Light/Dark Theme
		 */
		toggleTheme() {
			update((state) => {
				const newTheme = state.theme === 'dark' ? 'light' : 'dark';
				if (browser) {
					document.documentElement.setAttribute('data-theme', newTheme);
					localStorage.setItem(STORAGE_KEYS.theme, newTheme);
				}
				return { ...state, theme: newTheme };
			});
		},

		setTempUnit(unit: 'c' | 'f') {
			update((state) => {
				const next = unit === 'c' ? 'c' : 'f';
				saveToStorage('tempUnit', next);
				return { ...state, tempUnit: next };
			});
		},

		/**
		 * Check if a panel is enabled
		 */
		isPanelEnabled(panelId: PanelId): boolean {
			const state = get({ subscribe });
			return state.enabled[panelId] ?? true;
		},

		/**
		 * Toggle panel visibility
		 */
		togglePanel(panelId: PanelId) {
			update((state) => {
				const newEnabled = {
					...state.enabled,
					[panelId]: !state.enabled[panelId]
				};
				saveToStorage('panels', newEnabled);
				return { ...state, enabled: newEnabled };
			});
		},

		/**
		 * Enable a specific panel
		 */
		enablePanel(panelId: PanelId) {
			update((state) => {
				const newEnabled = { ...state.enabled, [panelId]: true };
				saveToStorage('panels', newEnabled);
				return { ...state, enabled: newEnabled };
			});
		},

		/**
		 * Disable a specific panel
		 */
		disablePanel(panelId: PanelId) {
			update((state) => {
				const newEnabled = { ...state.enabled, [panelId]: false };
				saveToStorage('panels', newEnabled);
				return { ...state, enabled: newEnabled };
			});
		},

		/**
		 * Update panel order (for drag-drop)
		 */
		updateOrder(newOrder: PanelId[]) {
			update((state) => {
				saveToStorage('order', newOrder);
				return { ...state, order: newOrder };
			});
		},

		/**
		 * Move a panel to a new position
		 */
		movePanel(panelId: PanelId, toIndex: number) {
			// Don't allow moving non-draggable panels
			if (NON_DRAGGABLE_PANELS.includes(panelId)) return;

			update((state) => {
				const currentIndex = state.order.indexOf(panelId);
				if (currentIndex === -1) return state;

				const newOrder = [...state.order];
				newOrder.splice(currentIndex, 1);
				newOrder.splice(toIndex, 0, panelId);

				saveToStorage('order', newOrder);
				return { ...state, order: newOrder };
			});
		},

		/**
		 * Update panel size
		 */
		updateSize(panelId: PanelId, size: { width?: number; height?: number }) {
			update((state) => {
				const newSizes = {
					...state.sizes,
					[panelId]: { ...state.sizes[panelId], ...size }
				};
				saveToStorage('sizes', newSizes);
				return { ...state, sizes: newSizes };
			});
		},

		/**
		 * Reset all settings to defaults
		 */
		reset() {
			const defaults = getDefaultSettings();
			if (browser) {
				localStorage.removeItem(STORAGE_KEYS.panels);
				localStorage.removeItem(STORAGE_KEYS.order);
				localStorage.removeItem(STORAGE_KEYS.sizes);
				localStorage.removeItem(STORAGE_KEYS.theme);
				document.documentElement.setAttribute('data-theme', 'dark');
			}
			set({ ...defaults, initialized: true });
		},

		/**
		 * Get panel size
		 */
		getPanelSize(panelId: PanelId): { width?: number; height?: number } | undefined {
			const state = get({ subscribe });
			return state.sizes[panelId];
		},

		/**
		 * Check if onboarding is complete
		 */
		isOnboardingComplete(): boolean {
			if (!browser) return true;
			return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
		},

		/**
		 * Get selected preset
		 */
		getSelectedPreset(): string | null {
			if (!browser) return null;
			return localStorage.getItem(PRESET_STORAGE_KEY);
		},

		/**
		 * Apply a preset configuration
		 */
		applyPreset(presetId: string) {
			const preset = PRESETS[presetId];
			if (!preset) {
				console.error('Unknown preset:', presetId);
				return;
			}

			// Build panel settings - disable all panels first, then enable preset panels
			const allPanelIds = Object.keys(PANELS) as PanelId[];
			const newEnabled = Object.fromEntries(
				allPanelIds.map((id) => [id, preset.panels.includes(id)])
			) as Record<PanelId, boolean>;

			update((state) => {
				saveToStorage('panels', newEnabled);
				return { ...state, enabled: newEnabled };
			});

			// Mark onboarding complete and save preset
			if (browser) {
				localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
				localStorage.setItem(PRESET_STORAGE_KEY, presetId);
			}
		},

		/**
		 * Reset onboarding to show modal again
		 */
		resetOnboarding() {
			if (browser) {
				localStorage.removeItem(ONBOARDING_STORAGE_KEY);
				localStorage.removeItem(PRESET_STORAGE_KEY);
			}
		}
	};
}

// Export singleton store
export const settings = createSettingsStore();

// Derived stores for convenience
export const enabledPanels = derived(settings, ($settings) => {
	const order = Array.isArray($settings.order) ? $settings.order : [];
	return order.filter((id) => $settings.enabled[id] ?? false);
});

export const disabledPanels = derived(settings, ($settings) => {
	const order = Array.isArray($settings.order) ? $settings.order : [];
	return order.filter((id) => !($settings.enabled[id] ?? false));
});

export const draggablePanels = derived(enabledPanels, ($enabled) =>
	$enabled.filter((id) => !NON_DRAGGABLE_PANELS.includes(id))
);
