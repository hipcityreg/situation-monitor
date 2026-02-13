/**
 * Treasury Yield API - Fetch US Treasury yield data from FRED
 * Uses CORS proxy to bypass browser restrictions
 * 
 * FRED (Federal Reserve Economic Data) - St. Louis Fed
 * Free tier: Unlimited requests
 */

import { logger } from '$lib/config/api';
import { CACHE_CONFIG, LocalCache } from '$lib/utils/cache';

export interface TreasuryYield {
	date: string;
	value: number;
}

export interface YieldCurveData {
	'2Y': TreasuryYield | null;
	'10Y': TreasuryYield | null;
	spread: number | null; // 10Y - 2Y
	isInverted: boolean;
	lastUpdated: string;
	dataSource: 'api' | 'demo';
}

// Treasury series IDs in FRED
const TREASURY_SERIES = {
	'2Y': 'DGS2', // 2-Year Treasury Constant Maturity Rate
	'10Y': 'DGS10' // 10-Year Treasury Constant Maturity Rate
} as const;

// Nginx Reverse Proxy URL (bypasses CORS)
const PROXY_BASE = '/api/fred/series/observations';

// Demo data fallback
const DEMO_YIELD_DATA: YieldCurveData = {
	'2Y': { date: new Date().toISOString().split('T')[0], value: 4.25 },
	'10Y': { date: new Date().toISOString().split('T')[0], value: 4.55 },
	spread: 0.30,
	isInverted: false,
	lastUpdated: new Date().toISOString(),
	dataSource: 'demo'
};

/**
 * Check if we have API key configured
 */
function hasFredApiKey(): boolean {
	const apiKey = import.meta.env.VITE_FRED_API_KEY;
	return Boolean(apiKey && apiKey.length > 0 && !apiKey.includes('your'));
}

/**
 * Fetch treasury yield using Nginx reverse proxy
 */
async function fetchYieldWithProxy(seriesId: string): Promise<TreasuryYield | null> {
	if (!hasFredApiKey()) {
		return null;
	}

	const apiKey = import.meta.env.VITE_FRED_API_KEY;
	// Use Nginx reverse proxy path
	const url = `${PROXY_BASE}?series_id=${seriesId}&sort_order=desc&limit=1&api_key=${apiKey}&file_type=json`;

	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0'
			},
			signal: AbortSignal.timeout(15000)
		});
		
		if (!response.ok) {
			console.error(`[Treasury] Proxy returned ${response.status}`);
			return null;
		}
		
		const data = await response.json();
		
		if (data.observations?.[0]) {
			const obs = data.observations[0];
			const value = parseFloat(obs.value);
			if (!isNaN(value)) {
				return {
					date: obs.date,
					value
				};
			}
		}
	} catch (e) {
		console.error('[Treasury] Proxy error:', e);
	}
	
	return null;
}

/**
 * Fetch yield curve data using CORS proxy
 */
export async function fetchYieldCurve(): Promise<YieldCurveData> {
	// Create daily cache key
	const today = new Date().toISOString().split('T')[0];
	const dailyKey = `${CACHE_CONFIG.TREASURY_YIELDS.key}_${today}`;
	
	// Try cache first
	const cached = LocalCache.get<YieldCurveData>(dailyKey);
	if (cached) {
		logger.log('Treasury API', 'Using cached data');
		return cached;
	}

	// Try fetching with CORS proxy
	const [yield2Y, yield10Y] = await Promise.all([
		fetchYieldWithProxy(TREASURY_SERIES['2Y']),
		fetchYieldWithProxy(TREASURY_SERIES['10Y'])
	]);

	// Check if we got valid data
	if (yield2Y && yield10Y) {
		const spread = yield10Y.value - yield2Y.value;
		
		const result: YieldCurveData = {
			'2Y': yield2Y,
			'10Y': yield10Y,
			spread,
			isInverted: spread < 0,
			lastUpdated: new Date().toISOString(),
			dataSource: 'api'
		};

		// Cache for 1 hour
		LocalCache.set(dailyKey, result, CACHE_CONFIG.TREASURY_YIELDS.ttl / 60);
		logger.log('Treasury API', `Success: 2Y=${yield2Y.value}, 10Y=${yield10Y.value}`);
		
		return result;
	}

	logger.warn('Treasury API', 'Using demo data (proxy failed)');
	return DEMO_YIELD_DATA;
}

/**
 * Fetch historical yield curve for charting
 */
export async function fetchYieldCurveHistory(): Promise<{
	dates: string[];
	'2Y': number[];
	'10Y': number[];
	spread: number[];
}> {
	// Generate demo data
	const dates: string[] = [];
	const yields2Y: number[] = [];
	const yields10Y: number[] = [];
	const spreads: number[] = [];
	
	for (let i = 90; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		dates.push(date.toISOString().split('T')[0]);
		
		const base2Y = 4.25 + Math.sin(i / 10) * 0.3;
		const base10Y = 4.55 + Math.sin(i / 10) * 0.25;
		
		yields2Y.push(Number(base2Y.toFixed(2)));
		yields10Y.push(Number(base10Y.toFixed(2)));
		spreads.push(Number((base10Y - base2Y).toFixed(2)));
	}
	
	return { dates, '2Y': yields2Y, '10Y': yields10Y, spread: spreads };
}
