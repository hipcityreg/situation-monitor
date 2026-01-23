/**
 * Translation service for news titles and content
 * Uses LibreTranslate free API with caching
 */

import { browser } from '$app/environment';

interface TranslationCache {
	[key: string]: {
		text: string;
		timestamp: number;
	};
}

// Cache translations for 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const CACHE_KEY = 'translationCache';

// Translation API endpoints
interface TranslationAPI {
	url: string;
	type: 'libretranslate' | 'mymemory';
}

const TRANSLATION_APIS: TranslationAPI[] = [
	// MyMemory Translation API (free, no registration needed, 10000 chars/day)
	{ url: 'https://api.mymemory.translated.net/get', type: 'mymemory' },
	// LibreTranslate public instance
	{ url: 'https://libretranslate.com/translate', type: 'libretranslate' }
];

let currentApiIndex = 0;

/**
 * Load cache from localStorage
 */
function loadCache(): TranslationCache {
	if (!browser) return {};
	try {
		const cached = localStorage.getItem(CACHE_KEY);
		return cached ? JSON.parse(cached) : {};
	} catch {
		return {};
	}
}

/**
 * Save cache to localStorage
 */
function saveCache(cache: TranslationCache): void {
	if (!browser) return;
	try {
		localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
	} catch (e) {
		console.warn('Failed to save translation cache:', e);
	}
}

/**
 * Get cached translation if available and not expired
 */
function getCached(text: string, targetLang: string): string | null {
	const cache = loadCache();
	const key = `${text}:${targetLang}`;
	const cached = cache[key];

	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.text;
	}

	return null;
}

/**
 * Cache a translation
 */
function setCached(text: string, targetLang: string, translation: string): void {
	const cache = loadCache();
	const key = `${text}:${targetLang}`;
	cache[key] = {
		text: translation,
		timestamp: Date.now()
	};
	saveCache(cache);
}

/**
 * Translate text using translation API with fallback
 */
async function translateWithApi(text: string, targetLang: string): Promise<string> {
	const api = TRANSLATION_APIS[currentApiIndex];

	try {
		if (api.type === 'mymemory') {
			// MyMemory API uses GET with query parameters
			const params = new URLSearchParams({
				q: text,
				langpair: `en|${targetLang === 'zh' ? 'zh-CN' : targetLang}`
			});

			const response = await fetch(`${api.url}?${params.toString()}`);

			if (!response.ok) {
				throw new Error(`Translation API error: ${response.status}`);
			}

			const data = await response.json();
			return data.responseData?.translatedText || text;
		} else {
			// LibreTranslate API uses POST
			const response = await fetch(api.url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					q: text,
					source: 'en',
					target: targetLang === 'zh' ? 'zh' : targetLang,
					format: 'text'
				})
			});

			if (!response.ok) {
				throw new Error(`Translation API error: ${response.status}`);
			}

			const data = await response.json();
			return data.translatedText || text;
		}
	} catch (error) {
		console.warn(`Translation API ${api.url} failed:`, error);

		// Try next API
		const nextIndex = (currentApiIndex + 1) % TRANSLATION_APIS.length;

		// If we've tried all APIs, return original text
		if (nextIndex === 0) {
			console.error('All translation APIs failed, returning original text');
			return text;
		}

		currentApiIndex = nextIndex;
		// Recursive retry with next API
		return translateWithApi(text, targetLang);
	}
}

/**
 * Translate text to target language
 * Uses cache first, then API
 */
export async function translate(text: string, targetLang: string): Promise<string> {
	if (!text || targetLang === 'en') return text;

	// Check cache first
	const cached = getCached(text, targetLang);
	if (cached) return cached;

	// Translate via API
	const translated = await translateWithApi(text, targetLang);

	// Cache result
	if (translated !== text) {
		setCached(text, targetLang, translated);
	}

	return translated;
}

/**
 * Batch translate multiple texts
 * Translates in parallel with rate limiting
 */
export async function translateBatch(
	texts: string[],
	targetLang: string
): Promise<Map<string, string>> {
	const results = new Map<string, string>();

	// Check cache for all texts first
	for (const text of texts) {
		const cached = getCached(text, targetLang);
		if (cached) {
			results.set(text, cached);
		}
	}

	// Get uncached texts
	const uncached = texts.filter((text) => !results.has(text));

	// Translate uncached texts with rate limiting (max 3 concurrent)
	const BATCH_SIZE = 3;
	for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
		const batch = uncached.slice(i, i + BATCH_SIZE);
		const translations = await Promise.all(batch.map((text) => translate(text, targetLang)));

		batch.forEach((text, index) => {
			results.set(text, translations[index]);
		});

		// Rate limit: wait 1 second between batches
		if (i + BATCH_SIZE < uncached.length) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	return results;
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
	if (browser) {
		localStorage.removeItem(CACHE_KEY);
	}
}
