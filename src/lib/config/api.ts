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
 * Primary: New Cloudflare Worker
 * Fallback: Public CORS proxies
 */
export const CORS_PROXIES = {
	primary: 'https://situation-03.jwang287.workers.dev/?url=',
	fallback: 'https://corsproxy.io/?url=',
	backup: 'https://api.allorigins.win/raw?url='
} as const;

// Default export for backward compatibility
export const CORS_PROXY_URL = CORS_PROXIES.fallback;

/**
 * Fetch with CORS proxy fallback
 * Tries multiple proxies in sequence
 */
export async function fetchWithProxy(url: string): Promise<Response> {
	const encodedUrl = encodeURIComponent(url);
	const proxies = [
		{ name: 'worker', url: CORS_PROXIES.primary + encodedUrl },
		{ name: 'corsproxy', url: CORS_PROXIES.fallback + encodedUrl },
		{ name: 'allorigins', url: CORS_PROXIES.backup + encodedUrl }
	];

	for (const proxy of proxies) {
		try {
			logger.log('API', `Trying ${proxy.name} proxy...`);
			const response = await fetch(proxy.url, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});
			
			if (response.ok) {
				logger.log('API', `${proxy.name} proxy succeeded`);
				// For AllOrigins raw endpoint, return response directly
				if (proxy.name === 'allorigins') {
					return response;
				}
				return response;
			}
			logger.warn('API', `${proxy.name} proxy failed: ${response.status}`);
		} catch (error) {
			logger.warn('API', `${proxy.name} proxy error:`, error);
		}
	}

	throw new Error('All CORS proxies failed');
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
