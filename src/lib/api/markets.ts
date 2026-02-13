/**
 * Markets API - Fetch market data
 * - Crypto: CoinGecko (free, unlimited)
 * - Indices/Sectors/Commodities: Finnhub (demo fallback)
 */

import { INDICES, SECTORS, COMMODITIES, CRYPTO } from '$lib/config/markets';
import type { MarketItem, SectorPerformance, CryptoItem } from '$lib/types';
import { fetchWithProxy, logger, FINNHUB_API_KEY, FINNHUB_BASE_URL } from '$lib/config/api';

interface CoinGeckoPrice {
	usd: number;
	usd_24h_change?: number;
}

interface CoinGeckoPricesResponse {
	[key: string]: CoinGeckoPrice;
}

interface FinnhubQuote {
	c: number;
	d: number;
	dp: number;
	h: number;
	l: number;
	o: number;
	pc: number;
	t: number;
}

/**
 * Demo data for indices/sectors/commodities (Finnhub fallback)
 */
const DEMO_DATA = {
	indices: {
		'DIA': { c: 438.50, d: 1.25, dp: 0.29 },
		'SPY': { c: 605.50, d: 1.25, dp: 0.21 },
		'QQQ': { c: 615.00, d: 2.50, dp: 0.41 },
		'IWM': { c: 223.40, d: -0.85, dp: -0.38 }
	},
	sectors: {
		'XLK': { c: 247.50, d: 1.85, dp: 0.75 },
		'XLF': { c: 50.25, d: 0.15, dp: 0.30 },
		'XLE': { c: 96.80, d: -0.45, dp: -0.46 },
		'XLI': { c: 138.20, d: 0.42, dp: 0.30 },
		'XLP': { c: 81.50, d: 0.08, dp: 0.10 },
		'XLRE': { c: 43.85, d: -0.12, dp: -0.27 },
		'XLU': { c: 77.40, d: 0.25, dp: 0.32 },
		'XLB': { c: 92.15, d: 0.35, dp: 0.38 },
		'XLC': { c: 88.60, d: 0.55, dp: 0.62 },
		'XLV': { c: 149.30, d: -0.25, dp: -0.17 }
	},
	commodities: {
		'VIXY': { c: 12.85, d: -0.35, dp: -2.65 },
		'GLD': { c: 268.50, d: 2.15, dp: 0.81 },
		'USO': { c: 78.25, d: -0.45, dp: -0.57 },
		'UNG': { c: 14.35, d: 0.08, dp: 0.56 },
		'SLV': { c: 29.80, d: 0.25, dp: 0.84 },
		'CPER': { c: 28.45, d: 0.12, dp: 0.42 }
	}
};

const INDEX_ETF_MAP: Record<string, string> = {
	'^DJI': 'DIA',
	'^GSPC': 'SPY',
	'^IXIC': 'QQQ',
	'^RUT': 'IWM'
};

const ETF_TO_INDEX_MULTIPLIERS: Record<string, number> = {
	'DIA': 100,
	'SPY': 10,
	'QQQ': 37.5,
	'IWM': 8.5
};

// ============ COINGECKO (免费，无限制) ============

/**
 * Fetch crypto prices from CoinGecko
 * API: https://www.coingecko.com/en/api
 * Free tier: Unlimited requests
 */
export async function fetchCryptoPrices(): Promise<CryptoItem[]> {
	const createDemoCrypto = () =>
		CRYPTO.map((c) => ({
			id: c.id,
			symbol: c.symbol,
			name: c.name,
			current_price: 0,
			price_change_24h: 0,
			price_change_percentage_24h: 0
		}));

	try {
		const ids = CRYPTO.map((c) => c.id).join(',');
		const coinGeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

		logger.log('Crypto', 'Fetching from CoinGecko');

		const response = await fetch(coinGeckoUrl, {
			headers: { 'Accept': 'application/json' },
			signal: AbortSignal.timeout(10000)
		});

		if (!response.ok) {
			logger.warn('Crypto', `API returned ${response.status}, using demo data`);
			return createDemoCrypto();
		}

		const data: CoinGeckoPricesResponse = await response.json();
		const hasValidData = Object.values(data).some((p) => p?.usd > 0);
		if (!hasValidData) return createDemoCrypto();

		return CRYPTO.map((crypto) => {
			const priceData = data[crypto.id];
			return {
				id: crypto.id,
				symbol: crypto.symbol,
				name: crypto.name,
				current_price: priceData?.usd || 0,
				price_change_24h: priceData?.usd_24h_change || 0,
				price_change_percentage_24h: priceData?.usd_24h_change || 0
			};
		});
	} catch (error) {
		logger.error('Crypto', 'Error fetching from CoinGecko:', error);
		return createDemoCrypto();
	}
}

// ============ FINNHUB (付费/演示) ============

async function getFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
	if (!FINNHUB_API_KEY) return null;

	try {
		const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`;
		const response = await fetch(url);
		if (!response.ok) return null;

		const data: FinnhubQuote = await response.json();
		return (data.c === 0 && data.pc === 0) ? null : data;
	} catch (error) {
		logger.error('Finnhub', `Error fetching ${symbol}:`, error);
		return null;
	}
}

/**
 * Export Finnhub quote for external use
 */
export async function fetchFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
	return getFinnhubQuote(symbol);
}

export async function fetchIndices(): Promise<MarketItem[]> {
	const createDemo = () =>
		INDICES.map((i) => {
			const etf = INDEX_ETF_MAP[i.symbol] || i.symbol;
			const demo = DEMO_DATA.indices[etf as keyof typeof DEMO_DATA.indices];
			const mult = ETF_TO_INDEX_MULTIPLIERS[etf] || 1;
			return {
				symbol: i.symbol,
				name: i.name,
				price: (demo?.c ?? NaN) * mult,
				change: (demo?.d ?? NaN) * mult,
				changePercent: demo?.dp ?? NaN,
				type: 'index' as const
			};
		});

	if (!FINNHUB_API_KEY) return createDemo();

	try {
		const quotes = await Promise.all(
			INDICES.map(async (index) => {
				const etf = INDEX_ETF_MAP[index.symbol] || index.symbol;
				const quote = await getFinnhubQuote(etf);
				return { index, quote, etf };
			})
		);

		const hasValid = quotes.some((q) => q.quote?.c > 0);
		if (!hasValid) return createDemo();

		return quotes.map(({ index, quote, etf }) => {
			const mult = ETF_TO_INDEX_MULTIPLIERS[etf] || 1;
			return {
				symbol: index.symbol,
				name: index.name,
				price: (quote?.c ?? NaN) * mult,
				change: (quote?.d ?? NaN) * mult,
				changePercent: quote?.dp ?? NaN,
				type: 'index' as const
			};
		});
	} catch (error) {
		logger.error('Indices', 'Error:', error);
		return createDemo();
	}
}

export async function fetchSectorPerformance(): Promise<SectorPerformance[]> {
	const createDemo = () =>
		SECTORS.map((s) => {
			const demo = DEMO_DATA.sectors[s.symbol as keyof typeof DEMO_DATA.sectors];
			return {
				symbol: s.symbol,
				name: s.name,
				price: demo?.c ?? NaN,
				change: demo?.d ?? NaN,
				changePercent: demo?.dp ?? NaN
			};
		});

	if (!FINNHUB_API_KEY) return createDemo();

	try {
		const quotes = await Promise.all(
			SECTORS.map(async (sector) => ({
				sector,
				quote: await getFinnhubQuote(sector.symbol)
			}))
		);

		const hasValid = quotes.some((q) => q.quote?.c > 0);
		if (!hasValid) return createDemo();

		return quotes.map(({ sector, quote }) => ({
			symbol: sector.symbol,
			name: sector.name,
			price: quote?.c ?? NaN,
			change: quote?.d ?? NaN,
			changePercent: quote?.dp ?? NaN
		}));
	} catch (error) {
		logger.error('Sectors', 'Error:', error);
		return createDemo();
	}
}

const COMMODITY_MAP: Record<string, string> = {
	'^VIX': 'VIXY',
	'GC=F': 'GLD',
	'CL=F': 'USO',
	'NG=F': 'UNG',
	'SI=F': 'SLV',
	'HG=F': 'CPER'
};

export async function fetchCommodities(): Promise<MarketItem[]> {
	const createDemo = () =>
		COMMODITIES.map((c) => {
			const finnhub = COMMODITY_MAP[c.symbol] || c.symbol;
			const demo = DEMO_DATA.commodities[finnhub as keyof typeof DEMO_DATA.commodities];
			return {
				symbol: c.symbol,
				name: c.name,
				price: demo?.c ?? NaN,
				change: demo?.d ?? NaN,
				changePercent: demo?.dp ?? NaN,
				type: 'commodity' as const
			};
		});

	if (!FINNHUB_API_KEY) return createDemo();

	try {
		const quotes = await Promise.all(
			COMMODITIES.map(async (commodity) => {
				const finnhub = COMMODITY_MAP[commodity.symbol] || commodity.symbol;
				return {
					commodity,
					quote: await getFinnhubQuote(finnhub)
				};
			})
		);

		const hasValid = quotes.some((q) => q.quote?.c > 0);
		if (!hasValid) return createDemo();

		return quotes.map(({ commodity, quote }) => ({
			symbol: commodity.symbol,
			name: commodity.name,
			price: quote?.c ?? NaN,
			change: quote?.d ?? NaN,
			changePercent: quote?.dp ?? NaN,
			type: 'commodity' as const
		}));
	} catch (error) {
		logger.error('Commodities', 'Error:', error);
		return createDemo();
	}
}

export async function fetchAllMarkets(): Promise<{
	crypto: CryptoItem[];
	indices: MarketItem[];
	sectors: SectorPerformance[];
	commodities: MarketItem[];
}> {
	const [crypto, indices, sectors, commodities] = await Promise.all([
		fetchCryptoPrices(),
		fetchIndices(),
		fetchSectorPerformance(),
		fetchCommodities()
	]);

	return { crypto, indices, sectors, commodities };
}
