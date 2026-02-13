/**
 * Internationalization (i18n) System
 * 
 * This module provides comprehensive multilingual support for the Situation Monitor
 * dashboard. It supports English (en) and Chinese (zh) with extensible architecture
 * for additional languages.
 * 
 * Features:
 * - Reactive locale store with localStorage persistence
 * - Type-safe translation keys with TypeScript
 * - Parameter interpolation for dynamic content (e.g., {{count}})
 * - HTML lang attribute synchronization
 * - Fallback to English for missing translations
 * 
 * Usage in components:
 *   import { t } from '$lib/stores';
 *   <h1>{$t('header.title')}</h1>
 *   <span>{$t('items.count', { count: 5 })}</span>
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { translations, type TranslationKey } from './translations';

/** Supported locale codes */
export type Locale = 'en' | 'zh';

/** localStorage key for persisting user language preference */
const STORAGE_KEY = 'situation-monitor-locale';

/** Default fallback locale when no preference is saved */
const DEFAULT_LOCALE: Locale = 'en';

/**
 * Creates the locale store with persistence and utility methods
 * @returns Locale store with subscribe, init, setLocale, toggle methods
 */
function createLocaleStore() {
	const { subscribe, set } = writable<Locale>(DEFAULT_LOCALE);

	return {
		/** Subscribe to locale changes */
		subscribe,
		
		/**
		 * Initialize locale from localStorage on app startup
		 * Should be called in the root layout's onMount
		 */
		init() {
			if (browser) {
				const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
				if (saved && (saved === 'en' || saved === 'zh')) {
					set(saved);
					this.updateHtmlLang(saved);
				}
			}
		},

		/**
		 * Set the active locale and persist to localStorage
		 * @param locale - The locale code ('en' | 'zh')
		 */
		setLocale(locale: Locale) {
			if (locale !== 'en' && locale !== 'zh') return;
			set(locale);
			if (browser) {
				localStorage.setItem(STORAGE_KEY, locale);
				this.updateHtmlLang(locale);
			}
		},

		/**
		 * Update the HTML lang attribute for accessibility and SEO
		 * @param locale - The locale code to set
		 */
		updateHtmlLang(locale: Locale) {
			if (browser) {
				document.documentElement.lang = locale;
			}
		},

		/**
		 * Toggle between English and Chinese
		 * Useful for quick language switching
		 */
		toggle() {
			const current = get({ subscribe });
			const next = current === 'en' ? 'zh' : 'en';
			this.setLocale(next);
		}
	};
}

/** Global locale store instance */
export const locale = createLocaleStore();

/**
 * Derived translation store that reacts to locale changes
 * 
 * Usage:
 *   const title = $t('panel.title');
 *   const message = $t('items.count', { count: 10 });
 */
export const t = derived(locale, ($locale) => {
	return (key: TranslationKey, params?: Record<string, string | number>): string => {
		// Fallback chain: current locale -> English -> key itself
		const translation = translations[$locale][key] ?? translations[DEFAULT_LOCALE][key] ?? key;
		
		if (!params) return translation;
		
		// Simple interpolation: replaces {{paramName}} with actual values
		return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
			return String(params[paramKey] ?? match);
		});
	};
});

/**
 * Helper function for non-component usage (e.g., utility functions, API calls)
 * 
 * @param locale - The locale code to translate to
 * @param key - The translation key
 * @param params - Optional interpolation parameters
 * @returns The translated string
 */
export function getTranslation(
	locale: Locale, 
	key: TranslationKey, 
	params?: Record<string, string | number>
): string {
	const translation = translations[locale][key] ?? translations[DEFAULT_LOCALE][key] ?? key;
	
	if (!params) return translation;
	
	return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
		return String(params[paramKey] ?? match);
	});
}
