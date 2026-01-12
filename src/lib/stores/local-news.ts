/**
 * Local news store - manages location-filtered news
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { NewsItem } from '$lib/types';

const STORAGE_KEY = 'localNewsLocation';

export interface LocalNewsLocation {
	city: string;
	state: string;
}

export interface LocalNewsState {
	items: NewsItem[];
	loading: boolean;
	error: string | null;
	location: LocalNewsLocation | null;
	lastUpdated: number | null;
}

function loadLocation(): LocalNewsLocation | null {
	if (!browser) return null;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return null;
		const parsed = JSON.parse(stored) as Partial<LocalNewsLocation>;
		if (!parsed.city && !parsed.state) return null;
		return {
			city: parsed.city ?? '',
			state: parsed.state ?? ''
		};
	} catch (error) {
		console.warn('Failed to load local news location:', error);
		return null;
	}
}

function saveLocation(location: LocalNewsLocation | null): void {
	if (!browser) return;
	if (!location) {
		localStorage.removeItem(STORAGE_KEY);
		return;
	}

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
	} catch (error) {
		console.warn('Failed to save local news location:', error);
	}
}

function sortByTimestamp(items: NewsItem[]): NewsItem[] {
	return [...items].sort((a, b) => b.timestamp - a.timestamp);
}

function createLocalNewsStore() {
	const initialState: LocalNewsState = {
		items: [],
		loading: false,
		error: null,
		location: loadLocation(),
		lastUpdated: null
	};

	const { subscribe, update } = writable<LocalNewsState>(initialState);

	return {
		subscribe,

		setLocation(location: LocalNewsLocation | null) {
			saveLocation(location);
			update((state) => ({ ...state, location }));
		},

		setLoading(loading: boolean) {
			update((state) => ({
				...state,
				loading,
				error: loading ? null : state.error
			}));
		},

		setError(error: string | null) {
			update((state) => ({
				...state,
				loading: false,
				error
			}));
		},

		setItems(items: NewsItem[]) {
			update((state) => ({
				...state,
				items: sortByTimestamp(items),
				loading: false,
				error: null,
				lastUpdated: Date.now()
			}));
		},

		clear() {
			update((state) => ({
				...state,
				items: [],
				loading: false,
				error: null,
				lastUpdated: null
			}));
		}
	};
}

export const localNews = createLocalNewsStore();
