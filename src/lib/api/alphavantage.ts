/**
 * Alpha Vantage API Integration
 * Free tier: 25 API calls/day
 * 
 * Get API key: https://www.alphavantage.co/support/#api-key
 */

import { CACHE_CONFIG, LocalCache } from '$lib/utils/cache';

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// User needs to add this to .env
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '';

export interface AlphaVantageQuote {
	symbol: string;
	price: number;
	change: number;
	changePercent: number;
	volume: number;
}

export interface EarningsRecord {
	symbol: string;
	quarter: string;
	eps: number;
	epsEstimated: number;
	revenue: number;
	revenueEstimated: number;
	timestamp: string;
}

/**
 * Fetch stock quote with caching
 */
export async function fetchStockQuote(symbol: string): Promise<AlphaVantageQuote | null> {
	const cacheKey = `${CACHE_CONFIG.STOCK_QUOTES.key}${symbol}`;
	
	// Try cache first
	const cached = LocalCache.get<AlphaVantageQuote>(cacheKey);
	if (cached) return cached;

	// Fetch from API
	try {
		const url = `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
		const response = await fetch(url);
		
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();
		
		// Parse Alpha Vantage response format
		const globalQuote = data['Global Quote'];
		if (!globalQuote || Object.keys(globalQuote).length === 0) {
			throw new Error('No quote data');
		}

		const quote: AlphaVantageQuote = {
			symbol: globalQuote['01. symbol'],
			price: parseFloat(globalQuote['05. price']),
			change: parseFloat(globalQuote['09. change']),
			changePercent: parseFloat(globalQuote['10. change percent'].replace('%', '')),
			volume: parseInt(globalQuote['06. volume'])
		};

		// Cache the result (15 minutes)
		LocalCache.set(cacheKey, quote, CACHE_CONFIG.STOCK_QUOTES.ttl / 60);

		return quote;
	} catch (error) {
		console.error(`[AlphaVantage] Error fetching ${symbol}:`, error);
		return null;
	}
}

/**
 * Fetch earnings calendar
 */
export async function fetchEarningsCalendar(symbol: string): Promise<EarningsRecord[]> {
	const cacheKey = `${CACHE_CONFIG.EARNINGS_CALENDAR.key}_${symbol}`;
	
	// Try cache first
	const cached = LocalCache.get<EarningsRecord[]>(cacheKey);
	if (cached) return cached;

	// Fetch from API
	try {
		const url = `${ALPHA_VANTAGE_BASE_URL}?function=EARNINGS&symbol=${symbol}&apikey=${API_KEY}`;
		const response = await fetch(url);
		
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();
		
		// Parse earnings data
		const earnings: EarningsRecord[] = [];
		const quarterlyEarnings = data?.quarterlyEarnings || [];
		
		for (const q of quarterlyEarnings) {
			earnings.push({
				symbol,
				quarter: q.fiscalDateEnding,
				eps: parseFloat(q.reportedEPS),
				epsEstimated: parseFloat(q.estimatedEPS),
				revenue: parseFloat(q.reportedRevenue),
				revenueEstimated: parseFloat(q.estimatedRevenue),
				timestamp: q.announcedDate
			});
		}

		// Cache the result (6 hours)
		LocalCache.set(cacheKey, earnings, CACHE_CONFIG.EARNINGS_CALENDAR.ttl / 60);

		return earnings;
	} catch (error) {
		console.error(`[AlphaVantage] Error fetching earnings for ${symbol}:`, error);
		return [];
	}
}

/**
 * Calculate next earnings date from calendar
 */
export async function calculateDaysToEarnings(symbol: string): Promise<number> {
	const earnings = await fetchEarningsCalendar(symbol);
	
	if (earnings.length === 0) return -1;
	
	// Find next earnings announcement date
	const today = new Date();
	for (const e of earnings) {
		const announcementDate = new Date(e.timestamp);
		if (announcementDate > today) {
			const diff = announcementDate.getTime() - today.getTime();
			return Math.ceil(diff / (1000 * 60 * 60 * 24));
		}
	}
	
	return -1; // No upcoming earnings found
}

/**
 * Check if API key is configured
 */
export function isAlphaVantageConfigured(): boolean {
	return Boolean(API_KEY && API_KEY.length > 0);
}

/**
 * Get API usage status (free tier limit is 25 calls/day)
 */
export async function getApiStatus(): Promise<{ used: number; limit: number; remaining: number }> {
	try {
		const url = `${ALPHA_VANTAGE_BASE_URL}?function=IP_O_SEARCH&symbol=IBM&apikey=${API_KEY}`;
		const response = await fetch(url);
		const data = await response.json();
		
		// Alpha Vantage doesn't provide usage info in response
		// This is a placeholder - in reality you'd need to track calls yourself
		return {
			used: 0,
			limit: 25,
			remaining: 25
		};
	} catch {
		return { used: 0, limit: 25, remaining: 25 };
	}
}
