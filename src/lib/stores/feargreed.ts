/**
 * Fear & Greed Index store - BTC market sentiment
 */

import { writable, derived } from 'svelte/store';
import type { FearGreedData } from '$lib/api';

export interface FearGreedState {
	data: FearGreedData | null;
	history: FearGreedData[]; // For percentile calculation
	percentile: number | null; // Historical percentile
	loading: boolean;
	error: string | null;
	lastUpdated: number | null;
}

function createFearGreedStore() {
	const { subscribe, set, update } = writable<FearGreedState>({
		data: null,
		history: [],
		percentile: null,
		loading: false,
		error: null,
		lastUpdated: null
	});

	return {
		subscribe,

		/**
		 * Set loading state
		 */
		setLoading(loading: boolean) {
			update((state) => ({
				...state,
				loading,
				error: loading ? null : state.error
			}));
		},

		/**
		 * Set error state
		 */
		setError(error: string | null) {
			update((state) => ({
				...state,
				loading: false,
				error
			}));
		},

		/**
		 * Set Fear & Greed data
		 */
		setData(data: FearGreedData, history: FearGreedData[] = [], percentile: number | null = null) {
			update((state) => ({
				...state,
				data,
				history,
				percentile,
				loading: false,
				error: null,
				lastUpdated: Date.now()
			}));
		},

		/**
		 * Clear data
		 */
		clear() {
			set({
				data: null,
				history: [],
				percentile: null,
				loading: false,
				error: null,
				lastUpdated: null
			});
		}
	};
}

// Export singleton store
export const fearGreed = createFearGreedStore();

// Derived stores
export const fearGreedValue = derived(fearGreed, ($fearGreed) => {
	return $fearGreed.data?.value;
});

export const fearGreedClassification = derived(fearGreed, ($fearGreed) => {
	return $fearGreed.data?.value_classification;
});

export const isFearGreedLoading = derived(fearGreed, ($fearGreed) => $fearGreed.loading);

export const fearGreedLastUpdated = derived(fearGreed, ($fearGreed) => $fearGreed.lastUpdated);
