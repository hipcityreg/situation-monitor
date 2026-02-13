/**
 * Web Scrapers for Financial Data
 * 
 * Uses CORS proxies to bypass cross-origin restrictions
 * For data that doesn't have free APIs
 */

// CORS Proxies (free tier)
const CORS_PROXIES = [
	'https://api.allorigins.win/raw?url=',
	'https://corsproxy.io/?url=',
	'https://proxy.cors.sh/'
];

interface ScrapeResult {
	success: boolean;
	data: string | null;
	error?: string;
}

/**
 * Fetch URL with CORS proxy
 */
async function fetchWithProxy(url: string): Promise<ScrapeResult> {
	for (const proxy of CORS_PROXIES) {
		try {
			const proxyUrl = proxy + encodeURIComponent(url);
			const response = await fetch(proxyUrl, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
					'Accept': 'text/html,application/xhtml+xml'
				},
				signal: AbortSignal.timeout(10000)
			});
			
			if (response.ok) {
				const text = await response.text();
				return { success: true, data: text };
			}
		} catch (e) {
			console.warn(`[Scraper] Proxy ${proxy} failed:`, e);
			continue;
		}
	}
	
	return { success: false, data: null, error: 'All proxies failed' };
}

/**
 * Parse numeric value from string
 */
function parseNumber(str: string | null | undefined): number | null {
	if (!str) return null;
	const cleaned = str.toString().replace(/[^0-9.-]/g, '');
	const num = parseFloat(cleaned);
	return isNaN(num) ? null : num;
}

// ============ SCRAPER TARGETS ============

/**
 * Scrape MOVE Index from Investing.com
 */
export async function scrapeMoveIndex(): Promise<{
	value: number | null;
	change: number | null;
	changePercent: number | null;
}> {
	try {
		const result = await fetchWithProxy('https://www.investing.com/indices/ice-bofaml-move');
		
		if (!result.success) {
			throw new Error(result.error);
		}
		
		// Parse the HTML - look for the value
		const text = result.data || '';
		
		// Try multiple selectors
		const valueMatch = text.match(/"last_last"\s*[:=]\s*["']?([\d.]+)/i) ||
			text.match(/>([\d.]+)<\/span>\s*<[^>]*class="[^"]*value/i);
		
		const value = parseNumber(valueMatch?.[1]);
		
		return {
			value,
			change: null,
			changePercent: null
		};
	} catch (error) {
		console.error('[Scraper] MOVE Index failed:', error);
		return { value: null, change: null, changePercent: null };
	}
}

/**
 * Scrape US Treasury Yields from Trading Economics
 */
export async function scrapeTreasuryYields(): Promise<{
	twoYear: number | null;
	tenYear: number | null;
}> {
	try {
		const result = await fetchWithProxy('https://tradingeconomics.com/united-states/government-bond-yield');
		
		if (!result.success) {
			throw new Error(result.error);
		}
		
		const text = result.data || '';
		
		// Look for yield values in the page
		const twoYearMatch = text.match(/2-Year[^<]*?([\d.]+)%/i) ||
			text.match(/United States.*?2-Year[^>]*?([\d.]+)/i);
		
		const tenYearMatch = text.match(/10-Year[^<]*?([\d.]+)%/i) ||
			text.match(/United States.*?10-Year[^>]*?([\d.]+)/i);
		
		return {
			twoYear: parseNumber(twoYearMatch?.[1]),
			tenYear: parseNumber(tenYearMatch?.[1])
		};
	} catch (error) {
		console.error('[Scraper] Treasury Yields failed:', error);
		return { twoYear: null, tenYear: null };
	}
}

/**
 * Scrapers for other financial data
 */
export const SCRAPERS = {
	moveIndex: {
		name: 'MOVE Index',
		url: 'https://www.investing.com/indices/ice-bofaml-move',
		scrape: scrapeMoveIndex,
		updateFrequency: '30 minutes'
	},
	
	treasuryYields: {
		name: 'US Treasury Yields',
		url: 'https://tradingeconomics.com/united-states/government-bond-yield',
		scrape: scrapeTreasuryYields,
		updateFrequency: '1 hour'
	}
};

/**
 * Run all scrapers and return combined results
 */
export async function runAllScrapers(): Promise<{
	moveIndex: { value: number | null; change: number | null; changePercent: number | null };
	treasuryYields: { twoYear: number | null; tenYear: number | null };
}> {
	console.log('[Scraper] Running all scrapers...');
	
	const [moveIndex, treasuryYields] = await Promise.all([
		scrapeMoveIndex(),
		scrapeTreasuryYields()
	]);
	
	console.log('[Scraper] Results:', { moveIndex, treasuryYields });
	
	return { moveIndex, treasuryYields };
}

/**
 * Health check for scrapers
 */
export function checkScraperHealth(): { total: number; working: number; failing: number } {
	return {
		total: Object.keys(SCRAPERS).length,
		working: 0,
		failing: 0
	};
}
