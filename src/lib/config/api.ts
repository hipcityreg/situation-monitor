/**
 * API Configuration
 */

import { browser } from '$app/environment';

/**
 * Finnhub API key
 * Get your free key at: https://finnhub.io/
 * Free tier: 60 calls/minute
 */
export const FINNHUB_API_KEY = browser
	? (import.meta.env?.VITE_FINNHUB_API_KEY ?? '')
	: (process.env.VITE_FINNHUB_API_KEY ?? '');

export const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

/**
 * FRED API key (St. Louis Fed)
 * Get your free key at: https://fred.stlouisfed.org/docs/api/api_key.html
 * Free tier: Unlimited requests
 */
export const FRED_API_KEY = browser
	? (import.meta.env?.VITE_FRED_API_KEY ?? '')
	: (process.env.VITE_FRED_API_KEY ?? '');

export const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

/**
 * Check if we're in development mode
 * Uses import.meta.env which is available in both browser and test environments
 */
const isDev = browser ? (import.meta.env?.DEV ?? false) : false;

/**
 * CORS proxy URLs for external API requests
 * Primary: AllOrigins (reliable, free)
 * Fallback: corsproxy.io (public, may rate limit)
 */
export const CORS_PROXIES = {
	primary: 'https://api.allorigins.win/get?url=',
	fallback: 'https://corsproxy.io/?url='
} as const;

// Default export for backward compatibility
export const CORS_PROXY_URL = CORS_PROXIES.fallback;

/**
 * Fetch with CORS proxy fallback
 * Tries primary proxy first, falls back to secondary on failure
 */
export async function fetchWithProxy(url: string): Promise<Response> {
	const encodedUrl = encodeURIComponent(url);

	// Try primary proxy first (AllOrigins)
	try {
		const proxyUrl = CORS_PROXIES.primary + encodedUrl;
		logger.log('API', `Trying primary proxy: ${proxyUrl.slice(0, 100)}...`);
		const response = await fetch(proxyUrl);
		if (response.ok) {
			// AllOrigins wraps response in a JSON structure
			const data = await response.json();
			if (data.contents) {
				// Create a new Response with the contents
				return new Response(data.contents, {
					status: 200,
					statusText: 'OK',
					headers: { 'Content-Type': 'application/json' }
				});
			}
			return new Response(JSON.stringify(data), {
				status: 200,
				statusText: 'OK',
				headers: { 'Content-Type': 'application/json' }
			});
		}
		logger.warn('API', `Primary proxy failed (${response.status}), trying fallback`);
	} catch (error) {
		logger.warn('API', 'Primary proxy error, trying fallback:', error);
	}

	// Fallback to secondary proxy (corsproxy.io)
	logger.log('API', 'Using fallback proxy');
	return fetch(CORS_PROXIES.fallback + encodedUrl);
}

/**
 * API request delays (ms) to avoid rate limiting
 */
export const API_DELAYS = {
	betweenCategories: 500,
	betweenRetries: 1000
} as const;

/**
 * Cache TTLs (ms)
 */
export const CACHE_TTLS = {
	weather: 10 * 60 * 1000, // 10 minutes
	news: 5 * 60 * 1000, // 5 minutes
	markets: 60 * 1000, // 1 minute
	default: 5 * 60 * 1000 // 5 minutes
} as const;

/**
 * Debug/logging configuration
 * Enable logging in production for debugging API issues
 */
export const DEBUG = {
	enabled: true,
	logApiCalls: true,
	logCacheHits: false
} as const;

/**
 * Logger - always logs for debugging
 */
export const logger = {
	log: (prefix: string, ...args: unknown[]) => {
		console.log(`[${prefix}]`, ...args);
	},
	warn: (prefix: string, ...args: unknown[]) => {
		console.warn(`[${prefix}]`, ...args);
	},
	error: (prefix: string, ...args: unknown[]) => {
		console.error(`[${prefix}]`, ...args);
	}
};
