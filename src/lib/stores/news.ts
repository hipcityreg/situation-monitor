/**
 * News store - manages news data across all categories
 */

import { writable, derived, get } from 'svelte/store';
import type { NewsItem, NewsCategory } from '$lib/types';
import { containsAlertKeyword, detectRegion, detectTopics } from '$lib/config';

export interface CategoryState {
	items: NewsItem[];
	loading: boolean;
	error: string | null;
	lastUpdated: number | null;
}

export interface NewsState {
	categories: Record<NewsCategory, CategoryState>;
	initialized: boolean;
}

// All news categories
const NEWS_CATEGORIES: NewsCategory[] = [
	'politics',
	'tech',
	'security',
	'finance',
	'gov',
	'ai',
	'intel'
];

const CVE_REGEX = /\bCVE-\d{4}-\d{4,7}\b/gi;

function extractCveIds(text: string): string[] {
	const matches = text.match(CVE_REGEX);
	if (!matches) return [];
	return Array.from(new Set(matches.map((match) => match.toUpperCase())));
}

// Create initial state for a category
function createCategoryState(): CategoryState {
	return {
		items: [],
		loading: false,
		error: null,
		lastUpdated: null
	};
}

// Create initial state
function createInitialState(): NewsState {
	const categories = {} as Record<NewsCategory, CategoryState>;
	for (const category of NEWS_CATEGORIES) {
		categories[category] = createCategoryState();
	}
	return { categories, initialized: false };
}

// Enrich news item with analysis
function enrichNewsItem(item: NewsItem): NewsItem {
	const text = `${item.title} ${item.description || ''} ${item.content || ''}`;
	const alertResult = containsAlertKeyword(text);
	const cveIds = item.cveIds ?? extractCveIds(text);

	return {
		...item,
		isAlert: alertResult.isAlert,
		alertKeyword: alertResult.keyword,
		region: item.region ?? detectRegion(text) ?? undefined,
		topics: item.topics ?? detectTopics(text),
		cveIds: cveIds.length > 0 ? cveIds : undefined
	};
}

// Create the store
function createNewsStore() {
	const { subscribe, set, update } = writable<NewsState>(createInitialState());

	return {
		subscribe,

		/**
		 * Initialize store
		 */
		init() {
			update((state) => ({ ...state, initialized: true }));
		},

		/**
		 * Set loading state for a category
		 */
		setLoading(category: NewsCategory, loading: boolean) {
			update((state) => ({
				...state,
				categories: {
					...state.categories,
					[category]: {
						...state.categories[category],
						loading,
						error: loading ? null : state.categories[category].error
					}
				}
			}));
		},

		/**
		 * Set error state for a category
		 */
		setError(category: NewsCategory, error: string | null) {
			update((state) => ({
				...state,
				categories: {
					...state.categories,
					[category]: {
						...state.categories[category],
						loading: false,
						error
					}
				}
			}));
		},

		/**
		 * Set items for a category
		 */
		setItems(category: NewsCategory, items: NewsItem[]) {
			const enrichedItems = items.map(enrichNewsItem);

			update((state) => ({
				...state,
				categories: {
					...state.categories,
					[category]: {
						items: enrichedItems,
						loading: false,
						error: null,
						lastUpdated: Date.now()
					}
				}
			}));
		},

		/**
		 * Append items to a category (for pagination)
		 */
		appendItems(category: NewsCategory, items: NewsItem[]) {
			const enrichedItems = items.map(enrichNewsItem);

			update((state) => {
				const existing = state.categories[category].items;
				const existingIds = new Set(existing.map((i) => i.id));
				const newItems = enrichedItems.filter((i) => !existingIds.has(i.id));

				return {
					...state,
					categories: {
						...state.categories,
						[category]: {
							...state.categories[category],
							items: [...existing, ...newItems],
							loading: false,
							error: null,
							lastUpdated: Date.now()
						}
					}
				};
			});
		},

		/**
		 * Get items for a category
		 */
		getItems(category: NewsCategory): NewsItem[] {
			return get({ subscribe }).categories[category].items;
		},

		/**
		 * Get all items across all categories
		 */
		getAllItems(): NewsItem[] {
			const state = get({ subscribe });
			const allItems: NewsItem[] = [];
			for (const category of NEWS_CATEGORIES) {
				allItems.push(...state.categories[category].items);
			}
			return allItems;
		},

		/**
		 * Get alert items (items with alert keywords)
		 */
		getAlertItems(): NewsItem[] {
			const state = get({ subscribe });
			const alerts: NewsItem[] = [];
			for (const category of NEWS_CATEGORIES) {
				alerts.push(...state.categories[category].items.filter((i) => i.isAlert));
			}
			return alerts.sort((a, b) => b.timestamp - a.timestamp);
		},

		/**
		 * Clear a category
		 */
		clearCategory(category: NewsCategory) {
			update((state) => ({
				...state,
				categories: {
					...state.categories,
					[category]: createCategoryState()
				}
			}));
		},

		/**
		 * Clear all categories
		 */
		clearAll() {
			set(createInitialState());
		},

		/**
		 * Check if any category is loading
		 */
		isAnyLoading(): boolean {
			const state = get({ subscribe });
			return NEWS_CATEGORIES.some((cat) => state.categories[cat].loading);
		}
	};
}

// Export singleton store
export const news = createNewsStore();

// Derived stores for each category
export const politicsNews = derived(news, ($news) => $news.categories.politics);
export const techNews = derived(news, ($news) => $news.categories.tech);
export const securityNews = derived(news, ($news) => $news.categories.security);
export const financeNews = derived(news, ($news) => $news.categories.finance);
export const govNews = derived(news, ($news) => $news.categories.gov);
export const aiNews = derived(news, ($news) => $news.categories.ai);
export const intelNews = derived(news, ($news) => $news.categories.intel);

// Derived store for all news items (reactive)
export const allNewsItems = derived(news, ($news) => {
	const allItems: NewsItem[] = [];
	for (const category of NEWS_CATEGORIES) {
		allItems.push(...$news.categories[category].items);
	}
	return allItems;
});

// Derived store for alerts
export const alerts = derived(news, ($news) => {
	const allAlerts: NewsItem[] = [];
	for (const category of NEWS_CATEGORIES) {
		allAlerts.push(...$news.categories[category].items.filter((i) => i.isAlert));
	}
	return allAlerts.sort((a, b) => b.timestamp - a.timestamp);
});

// Derived store for loading state
export const isLoading = derived(news, ($news) =>
	NEWS_CATEGORIES.some((cat) => $news.categories[cat].loading)
);

// Derived store for any errors
export const hasErrors = derived(news, ($news) =>
	NEWS_CATEGORIES.some((cat) => $news.categories[cat].error !== null)
);
