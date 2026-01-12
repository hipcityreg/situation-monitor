/**
 * Nifty stores - Nifty 50 and Nifty Next 50
 */

import { writable, derived } from 'svelte/store';
import type { NiftyStock } from '$lib/types';

export interface NiftyState {
	items: NiftyStock[];
	loading: boolean;
	error: string | null;
	lastUpdated: number | null;
}

// Create initial state
function createInitialState(): NiftyState {
	return {
		items: [],
		loading: false,
		error: null,
		lastUpdated: null
	};
}

// Create a Nifty store factory
function createNiftyStore() {
	const { subscribe, set, update } = writable<NiftyState>(createInitialState());

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
		 * Set items
		 */
		setItems(items: NiftyStock[]) {
			update((state) => ({
				...state,
				items,
				loading: false,
				error: null,
				lastUpdated: Date.now()
			}));
		},

		/**
		 * Clear all data
		 */
		clear() {
			set(createInitialState());
		}
	};
}

// Export Nifty 50 store
export const nifty50 = createNiftyStore();

// Export Nifty Next 50 store
export const niftyNext50 = createNiftyStore();

// Derived stores for convenience
export const isNifty50Loading = derived(nifty50, ($nifty50) => $nifty50.loading);
export const isNiftyNext50Loading = derived(niftyNext50, ($niftyNext50) => $niftyNext50.loading);
