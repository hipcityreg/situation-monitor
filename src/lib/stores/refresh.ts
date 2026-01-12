/**
 * Refresh store - loading states, timestamps, and refresh orchestration
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

// Refresh stages (matches existing 3-stage approach)
export type RefreshStage = 'critical' | 'secondary' | 'tertiary';

export interface StageConfig {
	name: RefreshStage;
	categories: string[];
	delayMs: number;
}

// Staged refresh configuration
export const REFRESH_STAGES: StageConfig[] = [
	{
		name: 'critical',
		categories: ['news', 'markets', 'alerts'],
		delayMs: 0
	},
	{
		name: 'secondary',
		categories: ['crypto', 'commodities', 'intel'],
		delayMs: 2000
	},
	{
		name: 'tertiary',
		categories: ['contracts', 'whales', 'layoffs', 'polymarket'],
		delayMs: 4000
	}
];

export interface RefreshState {
	// Global refresh state
	isRefreshing: boolean;
	currentStage: RefreshStage | null;
	lastRefresh: number | null;

	// Per-category states
	categoryStates: Record<
		string,
		{
			loading: boolean;
			lastUpdated: number | null;
			error: string | null;
		}
	>;

	// Auto-refresh settings
	autoRefreshEnabled: boolean;
	autoRefreshInterval: number; // in milliseconds

	// Refresh history (for debugging/analytics)
	refreshHistory: Array<{
		timestamp: number;
		duration: number;
		success: boolean;
		errors: string[];
	}>;

	initialized: boolean;
}

const DEFAULT_AUTO_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour
const STORAGE_KEY = 'refreshSettings';

// Load settings from localStorage
function loadSettings(): {
	autoRefreshEnabled: boolean;
	autoRefreshInterval: number;
	lastRefresh: number | null;
} {
	if (!browser) {
		return {
			autoRefreshEnabled: true,
			autoRefreshInterval: DEFAULT_AUTO_REFRESH_INTERVAL,
			lastRefresh: null
		};
	}

	try {
		const data = localStorage.getItem(STORAGE_KEY);
		if (data) {
			const parsed = JSON.parse(data);
			return {
				autoRefreshEnabled: parsed.autoRefreshEnabled ?? true,
				autoRefreshInterval: parsed.autoRefreshInterval ?? DEFAULT_AUTO_REFRESH_INTERVAL,
				lastRefresh: parsed.lastRefresh ?? null
			};
		}
	} catch (e) {
		console.warn('Failed to load refresh settings:', e);
	}

	return {
		autoRefreshEnabled: true,
		autoRefreshInterval: DEFAULT_AUTO_REFRESH_INTERVAL,
		lastRefresh: null
	};
}

// Save settings to localStorage
function saveSettings(enabled: boolean, interval: number, lastRefresh?: number | null): void {
	if (!browser) return;

	try {
		const existing = localStorage.getItem(STORAGE_KEY);
		const existingData = existing ? JSON.parse(existing) : {};
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				autoRefreshEnabled: enabled,
				autoRefreshInterval: interval,
				lastRefresh: lastRefresh ?? existingData.lastRefresh ?? null
			})
		);
	} catch (e) {
		console.warn('Failed to save refresh settings:', e);
	}
}

// Create initial state
function createInitialState(): RefreshState {
	const settings = loadSettings();

	return {
		isRefreshing: false,
		currentStage: null,
		lastRefresh: settings.lastRefresh,
		categoryStates: {},
		autoRefreshEnabled: settings.autoRefreshEnabled,
		autoRefreshInterval: settings.autoRefreshInterval,
		refreshHistory: [],
		initialized: false
	};
}

// Create the store
function createRefreshStore() {
	const { subscribe, set, update } = writable<RefreshState>(createInitialState());

	let autoRefreshTimer: ReturnType<typeof setInterval> | null = null;
	let refreshStartTime: number | null = null;

	// Setup auto-refresh timer
	function setupAutoRefresh(callback: () => void) {
		const state = get({ subscribe });

		if (autoRefreshTimer) {
			clearInterval(autoRefreshTimer);
			autoRefreshTimer = null;
		}

		if (state.autoRefreshEnabled && browser) {
			autoRefreshTimer = setInterval(callback, state.autoRefreshInterval);
		}
	}

	return {
		subscribe,

		/**
		 * Initialize store
		 */
		init() {
			update((state) => ({ ...state, initialized: true }));
		},

		/**
		 * Start a refresh cycle
		 */
		startRefresh() {
			refreshStartTime = Date.now();
			update((state) => ({
				...state,
				isRefreshing: true,
				currentStage: 'critical'
			}));
		},

		/**
		 * Move to the next stage
		 */
		nextStage() {
			update((state) => {
				const currentIndex = REFRESH_STAGES.findIndex((s) => s.name === state.currentStage);
				const nextStage = REFRESH_STAGES[currentIndex + 1];

				return {
					...state,
					currentStage: nextStage?.name ?? null
				};
			});
		},

		/**
		 * End refresh cycle
		 */
		endRefresh(errors: string[] = []) {
			const duration = refreshStartTime ? Date.now() - refreshStartTime : 0;
			refreshStartTime = null;
			const now = Date.now();

			update((state) => {
				const historyEntry = {
					timestamp: now,
					duration,
					success: errors.length === 0,
					errors
				};

				// Keep last 10 refresh entries
				const newHistory = [historyEntry, ...state.refreshHistory].slice(0, 10);

				// Persist lastRefresh to localStorage
				saveSettings(state.autoRefreshEnabled, state.autoRefreshInterval, now);

				return {
					...state,
					isRefreshing: false,
					currentStage: null,
					lastRefresh: now,
					refreshHistory: newHistory
				};
			});
		},

		/**
		 * Set loading state for a category
		 */
		setCategoryLoading(category: string, loading: boolean) {
			update((state) => ({
				...state,
				categoryStates: {
					...state.categoryStates,
					[category]: {
						...state.categoryStates[category],
						loading,
						error: loading ? null : (state.categoryStates[category]?.error ?? null),
						lastUpdated: state.categoryStates[category]?.lastUpdated ?? null
					}
				}
			}));
		},

		/**
		 * Set category updated
		 */
		setCategoryUpdated(category: string) {
			update((state) => ({
				...state,
				categoryStates: {
					...state.categoryStates,
					[category]: {
						loading: false,
						error: null,
						lastUpdated: Date.now()
					}
				}
			}));
		},

		/**
		 * Set category error
		 */
		setCategoryError(category: string, error: string) {
			update((state) => ({
				...state,
				categoryStates: {
					...state.categoryStates,
					[category]: {
						...state.categoryStates[category],
						loading: false,
						error,
						lastUpdated: state.categoryStates[category]?.lastUpdated ?? null
					}
				}
			}));
		},

		/**
		 * Toggle auto-refresh
		 */
		toggleAutoRefresh(callback?: () => void) {
			update((state) => {
				const newEnabled = !state.autoRefreshEnabled;
				saveSettings(newEnabled, state.autoRefreshInterval);

				if (callback) {
					setupAutoRefresh(callback);
				}

				return {
					...state,
					autoRefreshEnabled: newEnabled
				};
			});
		},

		/**
		 * Set auto-refresh interval
		 */
		setAutoRefreshInterval(intervalMs: number, callback?: () => void) {
			update((state) => {
				saveSettings(state.autoRefreshEnabled, intervalMs);

				if (callback) {
					setupAutoRefresh(callback);
				}

				return {
					...state,
					autoRefreshInterval: intervalMs
				};
			});
		},

		/**
		 * Setup auto-refresh with callback
		 */
		setupAutoRefresh(callback: () => void) {
			setupAutoRefresh(callback);
		},

		/**
		 * Stop auto-refresh
		 */
		stopAutoRefresh() {
			if (autoRefreshTimer) {
				clearInterval(autoRefreshTimer);
				autoRefreshTimer = null;
			}
		},

		/**
		 * Get time since last refresh
		 */
		getTimeSinceRefresh(): number | null {
			const state = get({ subscribe });
			if (!state.lastRefresh) return null;
			return Date.now() - state.lastRefresh;
		},

		/**
		 * Check if a category needs refresh
		 */
		categoryNeedsRefresh(category: string, maxAge: number): boolean {
			const state = get({ subscribe });
			const categoryState = state.categoryStates[category];
			if (!categoryState?.lastUpdated) return true;
			return Date.now() - categoryState.lastUpdated > maxAge;
		},

		/**
		 * Reset store
		 */
		reset() {
			if (autoRefreshTimer) {
				clearInterval(autoRefreshTimer);
				autoRefreshTimer = null;
			}
			set(createInitialState());
		}
	};
}

// Export singleton store
export const refresh = createRefreshStore();

// Derived stores
export const isRefreshing = derived(refresh, ($refresh) => $refresh.isRefreshing);

export const currentStage = derived(refresh, ($refresh) => $refresh.currentStage);

export const lastRefresh = derived(refresh, ($refresh) => $refresh.lastRefresh);

export const autoRefreshEnabled = derived(refresh, ($refresh) => $refresh.autoRefreshEnabled);

// Time since last refresh (updates every second when subscribed)
export const timeSinceRefresh = derived(refresh, ($refresh) => {
	if (!$refresh.lastRefresh) return null;
	return Date.now() - $refresh.lastRefresh;
});

// Categories with errors
export const categoriesWithErrors = derived(refresh, ($refresh) => {
	return Object.entries($refresh.categoryStates)
		.filter(([, state]) => state.error !== null)
		.map(([category, state]) => ({ category, error: state.error }));
});
