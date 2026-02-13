/**
 * Local Cache Utility - Client-side caching for API responses
 * Reduces API calls and improves performance
 */

interface CacheItem<T> {
	data: T;
	timestamp: number;
	ttl: number; // Time to live in milliseconds
}

export class LocalCache {
	private static readonly PREFIX = 'sm_cache_';

	/**
	 * Store data in cache
	 */
	static set<T>(key: string, data: T, ttlMinutes: number): void {
		try {
			const item: CacheItem<T> = {
				data,
				timestamp: Date.now(),
				ttl: ttlMinutes * 60 * 1000
			};
			localStorage.setItem(this.PREFIX + key, JSON.stringify(item));
			console.log(`[Cache] Stored: ${key} (TTL: ${ttlMinutes}min)`);
		} catch (e) {
			console.error('[Cache] Failed to store:', e);
		}
	}

	/**
	 * Get data from cache if not expired
	 */
	static get<T>(key: string): T | null {
		try {
			const stored = localStorage.getItem(this.PREFIX + key);
			if (!stored) return null;

			const item: CacheItem<T> = JSON.parse(stored);
			const now = Date.now();
			const age = now - item.timestamp;

			if (age > item.ttl) {
				// Cache expired
				localStorage.removeItem(this.PREFIX + key);
				console.log(`[Cache] Expired: ${key} (age: ${Math.round(age / 1000)}s)`);
				return null;
			}

			console.log(`[Cache] Hit: ${key} (age: ${Math.round(age / 1000)}s)`);
			return item.data;
		} catch (e) {
			console.error('[Cache] Failed to retrieve:', e);
			return null;
		}
	}

	/**
	 * Check if cache exists and is valid
	 */
	static isValid(key: string): boolean {
		return this.get(key) !== null;
	}

	/**
	 * Remove specific cache entry
	 */
	static remove(key: string): void {
		localStorage.removeItem(this.PREFIX + key);
	}

	/**
	 * Clear all cache entries
	 */
	static clearAll(): void {
		const keysToRemove: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(this.PREFIX)) {
				keysToRemove.push(key);
			}
		}
		keysToRemove.forEach(key => localStorage.removeItem(key));
		console.log(`[Cache] Cleared ${keysToRemove.length} entries`);
	}

	/**
	 * Get cache statistics
	 */
	static getStats(): { total: number; valid: number; expired: number } {
		let total = 0;
		let valid = 0;
		let expired = 0;

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(this.PREFIX)) {
				total++;
				const stored = localStorage.getItem(key);
				if (stored) {
					try {
						const item: CacheItem<unknown> = JSON.parse(stored);
						if (Date.now() - item.timestamp <= item.ttl) {
							valid++;
						} else {
							expired++;
						}
					} catch {
						expired++;
					}
				}
			}
		}

		return { total, valid, expired };
	}
}

/**
 * Cache configuration for different data types
 */
export const CACHE_CONFIG = {
	// Market data - update frequently
	TREASURY_YIELDS: { key: 'treasury_yields_daily', ttl: 60 }, // 1 hour, daily key
	MOVE_INDEX: { key: 'move_index_hourly', ttl: 30 }, // 30 minutes
	FEAR_GREED: { key: 'fear_greed_hourly', ttl: 60 }, // 1 hour
	
	// Financial data - moderate frequency
	STOCK_QUOTES: { key: 'stock_quote_', ttl: 15 }, // 15 minutes (per symbol)
	EARNINGS_CALENDAR: { key: 'earnings_calendar', ttl: 360 }, // 6 hours
	
	// Macro data - update less frequently
	MACRO_INDICATORS: { key: 'macro_', ttl: 1440 }, // 24 hours (per indicator)
	AI_INDUSTRY: { key: 'ai_industry', ttl: 720 }, // 12 hours
	
	// Static/Semi-static data
	FOMC_SCHEDULE: { key: 'fomc_schedule', ttl: 10080 }, // 7 days
};

/**
 * Force refresh - bypass cache and get fresh data
 */
export async function fetchWithCache<T>(
	cacheKey: string,
	fetchFn: () => Promise<T>,
	ttlMinutes: number = 60,
	forceRefresh: boolean = false
): Promise<T> {
	// If force refresh, skip cache
	if (forceRefresh) {
		console.log(`[Cache] Force refresh: ${cacheKey}`);
		const data = await fetchFn();
		LocalCache.set(cacheKey, data, ttlMinutes);
		return data;
	}
	
	// Try cache first
	const cached = LocalCache.get<T>(cacheKey);
	if (cached) return cached;
	
	// Fetch fresh data
	const data = await fetchFn();
	LocalCache.set(cacheKey, data, ttlMinutes);
	return data;
}
