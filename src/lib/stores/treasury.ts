/**
 * Treasury Yield Store - US Treasury yield curve data
 */

import { writable, derived } from 'svelte/store';
import type { YieldCurveData } from '$lib/api/treasury';

export interface TreasuryState {
	data: YieldCurveData | null;
	history: {
		dates: string[];
		'2Y': number[];
		'10Y': number[];
		spread: number[];
	};
	loading: boolean;
	error: string | null;
	lastUpdated: number | null;
}

function createTreasuryStore() {
	const { subscribe, set, update } = writable<TreasuryState>({
		data: null,
		history: { dates: [], '2Y': [], '10Y': [], spread: [] },
		loading: false,
		error: null,
		lastUpdated: null
	});

	return {
		subscribe,

		setLoading(loading: boolean) {
			update((state) => ({ ...state, loading, error: loading ? null : state.error }));
		},

		setError(error: string | null) {
			update((state) => ({ ...state, loading: false, error }));
		},

		setData(data: YieldCurveData) {
			update((state) => ({
				...state,
				data,
				loading: false,
				error: null,
				lastUpdated: Date.now()
			}));
		},

		setHistory(history: TreasuryState['history']) {
			update((state) => ({ ...state, history }));
		},

		clear() {
			set({
				data: null,
				history: { dates: [], '2Y': [], '10Y': [], spread: [] },
				loading: false,
				error: null,
				lastUpdated: null
			});
		}
	};
}

export const treasury = createTreasuryStore();

// Derived stores for convenience
export const yield2Y = derived(treasury, ($t) => $t.data?.['2Y'] ?? null);
export const yield10Y = derived(treasury, ($t) => $t.data?.['10Y'] ?? null);
export const yieldSpread = derived(treasury, ($t) => $t.data?.spread ?? null);
export const isYieldCurveInverted = derived(treasury, ($t) => $t.data?.isInverted ?? false);
