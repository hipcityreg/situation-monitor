/**
 * Nifty API - Fetch Nifty 50 and Nifty Next 50 stock data
 */

import { NIFTY_50, NIFTY_NEXT_50 } from '$lib/config/nifty';
import type { NiftyStock } from '$lib/types';
import { logger, FINNHUB_API_KEY, FINNHUB_BASE_URL } from '$lib/config/api';

interface FinnhubQuote {
	c: number; // Current price
	d: number; // Change
	dp: number; // Percent change
	h: number; // High price of the day
	l: number; // Low price of the day
	o: number; // Open price of the day
	pc: number; // Previous close price
	t: number; // Timestamp
}

/**
 * Check if Finnhub API key is configured
 */
function hasFinnhubApiKey(): boolean {
	return Boolean(FINNHUB_API_KEY && FINNHUB_API_KEY.length > 0);
}

/**
 * Fetch a quote from Finnhub
 */
async function fetchFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
	try {
		const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: FinnhubQuote = await response.json();

		// Finnhub returns all zeros when symbol not found
		if (data.c === 0 && data.pc === 0) {
			return null;
		}

		return data;
	} catch (error) {
		logger.error('Nifty API', `Error fetching quote for ${symbol}:`, error);
		return null;
	}
}

/**
 * Generate logo URL for Indian stock
 * Using a reliable source for company logos
 */
function getLogoUrl(symbol: string): string {
	// Remove .NS suffix for the logo lookup
	const cleanSymbol = symbol.replace('.NS', '');
	// Using Logo.dev API which provides company logos
	// Fallback to a placeholder if not available
	return `https://img.logo.dev/ticker/${cleanSymbol}?token=pk_X-FzGBTdQcGv-F2VdOZLbw&format=png&size=60`;
}

/**
 * Create an empty Nifty stock item
 */
function createEmptyNiftyStock(symbol: string, name: string): NiftyStock {
	return {
		symbol,
		name,
		price: NaN,
		changePercent: NaN,
		logoUrl: getLogoUrl(symbol)
	};
}

/**
 * Fetch Nifty 50 stocks data
 */
export async function fetchNifty50(): Promise<NiftyStock[]> {
	if (!hasFinnhubApiKey()) {
		logger.warn('Nifty API', 'Finnhub API key not configured. Add VITE_FINNHUB_API_KEY to .env');
		return NIFTY_50.map((stock) => createEmptyNiftyStock(stock.symbol, stock.name));
	}

	try {
		logger.log('Nifty API', 'Fetching Nifty 50 from Finnhub');

		const quotes = await Promise.all(
			NIFTY_50.map(async (stock) => {
				const quote = await fetchFinnhubQuote(stock.symbol);
				return { stock, quote };
			})
		);

		return quotes.map(({ stock, quote }) => ({
			symbol: stock.symbol,
			name: stock.name,
			price: quote?.c ?? NaN,
			changePercent: quote?.dp ?? NaN,
			logoUrl: getLogoUrl(stock.symbol)
		}));
	} catch (error) {
		logger.error('Nifty API', 'Error fetching Nifty 50:', error);
		return NIFTY_50.map((stock) => createEmptyNiftyStock(stock.symbol, stock.name));
	}
}

/**
 * Fetch Nifty Next 50 stocks data
 */
export async function fetchNiftyNext50(): Promise<NiftyStock[]> {
	if (!hasFinnhubApiKey()) {
		logger.warn('Nifty API', 'Finnhub API key not configured. Add VITE_FINNHUB_API_KEY to .env');
		return NIFTY_NEXT_50.map((stock) => createEmptyNiftyStock(stock.symbol, stock.name));
	}

	try {
		logger.log('Nifty API', 'Fetching Nifty Next 50 from Finnhub');

		const quotes = await Promise.all(
			NIFTY_NEXT_50.map(async (stock) => {
				const quote = await fetchFinnhubQuote(stock.symbol);
				return { stock, quote };
			})
		);

		return quotes.map(({ stock, quote }) => ({
			symbol: stock.symbol,
			name: stock.name,
			price: quote?.c ?? NaN,
			changePercent: quote?.dp ?? NaN,
			logoUrl: getLogoUrl(stock.symbol)
		}));
	} catch (error) {
		logger.error('Nifty API', 'Error fetching Nifty Next 50:', error);
		return NIFTY_NEXT_50.map((stock) => createEmptyNiftyStock(stock.symbol, stock.name));
	}
}
