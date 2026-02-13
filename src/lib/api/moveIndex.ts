/**
 * MOVE Index API - Bond market volatility
 * Uses multiple data sources with fallback
 */

import { CACHE_CONFIG, LocalCache } from '$lib/utils/cache';

export interface MoveIndexData {
	value: number;
	change: number;
	changePercent: number;
}

export interface MoveIndexResult {
	data: MoveIndexData | null;
	source: 'yahoo' | 'demo';
}

// Yahoo Finance via CORS proxy
const YAHOO_MOVE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/%5EMOVE';

// CORS Proxies
const CORS_PROXY = 'https://corsproxy.io/?url=';

const DEMO_DATA: MoveIndexData = {
	value: 95.2,
	change: 2.5,
	changePercent: 2.7
};

/**
 * Fetch MOVE Index from Yahoo Finance
 */
export async function fetchMoveIndex(): Promise<MoveIndexResult> {
	// Try cache first
	const cached = LocalCache.get<MoveIndexData>(CACHE_CONFIG.MOVE_INDEX.key);
	if (cached) {
		console.log('[MOVE] Using cached data');
		return { data: cached, source: 'demo' }; // Cache is still marked as demo since source is lost
	}

	// Try Yahoo Finance via proxy
	try {
		const url = CORS_PROXY + encodeURIComponent(YAHOO_MOVE_URL + '?interval=1d&range=5d');
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			},
			signal: AbortSignal.timeout(15000)
		});

		if (response.ok) {
			const json = await response.json();
			const result = json.chart?.result?.[0];
			
			if (result?.indicators?.quote?.[0]) {
				const quote = result.indicators.quote[0];
				const close = quote.close;
				
				if (close && close.length > 0) {
					const latestValue = close[close.length - 1];
					const prevValue = close[close.length - 2] || latestValue;
					
					if (latestValue !== null) {
						const change = latestValue - prevValue;
						const changePercent = (change / prevValue) * 100;

						const data: MoveIndexData = {
							value: latestValue,
							change: parseFloat(change.toFixed(2)),
							changePercent: parseFloat(changePercent.toFixed(2))
						};

						// Cache for 30 minutes
						LocalCache.set(CACHE_CONFIG.MOVE_INDEX.key, data, CACHE_CONFIG.MOVE_INDEX.ttl / 60);
						
						console.log('[MOVE] Yahoo Finance success:', data);
						return { data, source: 'yahoo' };
					}
				}
			}
		}
	} catch (error) {
		console.warn('[MOVE] Yahoo Finance failed:', error);
	}

	// Fallback to demo data
	console.log('[MOVE] Using demo data');
	return { data: DEMO_DATA, source: 'demo' };
}
