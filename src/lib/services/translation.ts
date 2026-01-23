/**
 * Translation service for news titles and content
 * Uses MyMemory API with caching and queue management
 */

import { browser } from '$app/environment';

// Global translation queue to limit concurrent requests
class TranslationQueue {
	private queue: Array<() => Promise<void>> = [];
	private activeCount = 0;
	private readonly maxConcurrent = 2; // Only 2 concurrent translations

	async add<T>(fn: () => Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			const task = async () => {
				try {
					this.activeCount++;
					const result = await fn();
					resolve(result);
				} catch (error) {
					reject(error);
				} finally {
					this.activeCount--;
					this.processQueue();
				}
			};

			this.queue.push(task);
			this.processQueue();
		});
	}

	private processQueue() {
		while (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
			const task = this.queue.shift();
			if (task) {
				task();
			}
		}
	}
}

const translationQueue = new TranslationQueue();

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
 * Check if text is likely already in the target language
 * Simple heuristic: check for Chinese characters
 */
function isAlreadyChinese(text: string): boolean {
	// Check if text contains Chinese characters
	const chineseCharCount = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
	// If more than 30% of text is Chinese characters, consider it Chinese
	return chineseCharCount > text.length * 0.3;
}

/**
 * Validate translation result
 * Check if the translation looks valid (not corrupted, not partial)
 */
function isValidTranslation(original: string, translated: string, targetLang: string): boolean {
	// If translation is empty or same as original, it might have failed
	if (!translated || translated === original) return false;
	
	// For Chinese translations, check if result contains mostly Chinese
	if (targetLang === 'zh') {
		const chineseCharCount = (translated.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
		const nonSpaceLength = translated.replace(/\s/g, '').length;
		
		// At least 40% should be Chinese characters for it to be considered valid
		// This helps filter out partial/corrupted translations
		if (nonSpaceLength > 0 && chineseCharCount / nonSpaceLength < 0.4) {
			return false;
		}
	}
	
	return true;
}

/**
 * Translate text using translation API with fallback
 * Supports auto-detection of source language for non-English text
 */
async function translateWithApi(text: string, targetLang: string): Promise<string> {
	// Skip if already in target language
	if (targetLang === 'zh' && isAlreadyChinese(text)) {
		return text;
	}

	const api = TRANSLATION_APIS[currentApiIndex];

	try {
		if (api.type === 'mymemory') {
			// MyMemory API uses GET with query parameters
			// Use 'autodetect' to automatically detect source language
			const params = new URLSearchParams({
				q: text,
				langpair: `autodetect|${targetLang === 'zh' ? 'zh-CN' : targetLang}`
			});

			const response = await fetch(`${api.url}?${params.toString()}`);

			if (!response.ok) {
				throw new Error(`Translation API error: ${response.status}`);
			}

			const data = await response.json();
			return data.responseData?.translatedText || text;
		} else {
			// LibreTranslate API uses POST
			// Use 'auto' for automatic language detection
			const response = await fetch(api.url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					q: text,
					source: 'auto',
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
 * Uses cache first, then API with queue management
 * Supports auto-detection of source language (not just English)
 */
export async function translate(text: string, targetLang: string): Promise<string> {
	if (!text || targetLang === 'en') return text;

	// Skip if text is already in target language
	if (targetLang === 'zh' && isAlreadyChinese(text)) return text;

	// Check cache first
	const cached = getCached(text, targetLang);
	if (cached) return cached;

	// Translate via API using queue to limit concurrency
	const translated = await translationQueue.add(() => translateWithApi(text, targetLang));

	// Validate and cache result only if valid
	if (isValidTranslation(text, translated, targetLang)) {
		setCached(text, targetLang, translated);
		return translated;
	}

	// Return original if translation is invalid
	return text;
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
