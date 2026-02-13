/**
 * Miscellaneous API functions for specialized panels
 * Polymarket data: fetched server-side and saved to static JSON
 */

import { LocalCache } from '$lib/utils/cache';

export interface Prediction {
	id: string;
	question: string;
	yes: number;
	no: number;
	volume: string;
	updated: string;
}

export interface WhaleTransaction {
	coin: string;
	amount: number;
	usd: number;
	hash: string;
}

export interface Contract {
	agency: string;
	description: string;
	vendor: string;
	amount: number;
}

export interface Layoff {
	company: string;
	count: number;
	title: string;
	date: string;
}

// Polymarket data endpoint (static JSON file)
const POLYMARKET_DATA_URL = '/polymarket-data.json';

/**
 * Fetch Polymarket predictions from static JSON file
 * Data is fetched hourly by cron job on server
 */
export async function fetchPolymarket(): Promise<Prediction[]> {
	const cacheKey = 'polymarket_predictions';
	const cacheTTLMinutes = 60; // 1 hour - matches cron schedule

	// Check cache first
	const cached = LocalCache.get<Prediction[]>(cacheKey);
	if (cached) {
		return cached;
	}

	try {
		const response = await fetch(POLYMARKET_DATA_URL);
		
		if (!response.ok) {
			// Fallback to empty array if file not found
			console.warn('Polymarket data file not found, using fallback');
			return getFallbackPredictions();
		}

		const data = await response.json();
		
		if (!data.data || !Array.isArray(data.data)) {
			return getFallbackPredictions();
		}

		// Transform to Prediction format
		const predictions: Prediction[] = data.data.map((item: any) => ({
			id: item.id,
			question: item.question,
			yes: item.yes || 0,
			no: item.no || 0,
			volume: item.volume_str || formatVolume(item.volume),
			updated: data.updated || new Date().toISOString()
		}));

		// Cache the result
		LocalCache.set(cacheKey, predictions, cacheTTLMinutes);

		return predictions;

	} catch (error) {
		console.error('Failed to fetch Polymarket data:', error);
		return getFallbackPredictions();
	}
}

/**
 * Format volume number to human readable string
 */
function formatVolume(volume: number): string {
	if (!volume) return '0';
	
	if (volume >= 1000000) {
		return `$${(volume / 1000000).toFixed(1)}M`;
	} else if (volume >= 1000) {
		return `$${(volume / 1000).toFixed(0)}K`;
	}
	return `$${volume.toFixed(0)}`;
}

/**
 * Fallback predictions when API is unavailable
 * These are static examples - real data should come from JSON file
 */
function getFallbackPredictions(): Prediction[] {
	return [
		{
			id: 'fallback-1',
			question: 'Will Bitcoin reach $150K by end of 2026?',
			yes: 35,
			no: 65,
			volume: '$8.1M',
			updated: new Date().toISOString()
		},
		{
			id: 'fallback-2',
			question: 'Will Fed cut rates in Q1 2026?',
			yes: 42,
			no: 58,
			volume: '$5.2M',
			updated: new Date().toISOString()
		},
		{
			id: 'fallback-3',
			question: 'Will AI cause major job losses in 2026?',
			yes: 28,
			no: 72,
			volume: '$1.8M',
			updated: new Date().toISOString()
		}
	];
}

/**
 * Fetch whale transactions
 * Note: Would use Whale Alert API - returning sample data
 */
export async function fetchWhaleTransactions(): Promise<WhaleTransaction[]> {
	return [
		{ coin: 'BTC', amount: 1500, usd: 150000000, hash: '0x1a2b...3c4d' },
		{ coin: 'ETH', amount: 25000, usd: 85000000, hash: '0x5e6f...7g8h' },
		{ coin: 'BTC', amount: 850, usd: 85000000, hash: '0x9i0j...1k2l' },
		{ coin: 'SOL', amount: 500000, usd: 75000000, hash: '0x3m4n...5o6p' },
		{ coin: 'ETH', amount: 15000, usd: 51000000, hash: '0x7q8r...9s0t' }
	];
}

/**
 * Fetch government contracts
 * Note: Would use USASpending.gov API - returning sample data
 */
export async function fetchGovContracts(): Promise<Contract[]> {
	return [
		{
			agency: 'DOD',
			description: 'Advanced radar systems development and integration',
			vendor: 'Raytheon',
			amount: 2500000000
		},
		{
			agency: 'NASA',
			description: 'Artemis program lunar lander support services',
			vendor: 'SpaceX',
			amount: 1800000000
		},
		{
			agency: 'DHS',
			description: 'Border security technology modernization',
			vendor: 'Palantir',
			amount: 450000000
		},
		{
			agency: 'VA',
			description: 'Electronic health records system upgrade',
			vendor: 'Oracle Cerner',
			amount: 320000000
		},
		{
			agency: 'DOE',
			description: 'Clean energy grid infrastructure',
			vendor: 'General Electric',
			amount: 275000000
		}
	];
}

/**
 * Fetch layoffs data
 * Note: Would use layoffs.fyi API or similar - returning sample data
 */
export async function fetchLayoffs(): Promise<Layoff[]> {
	const now = new Date();
	const formatDate = (daysAgo: number) => {
		const d = new Date(now);
		d.setDate(d.getDate() - daysAgo);
		return d.toISOString();
	};

	return [
		{ company: 'Meta', count: 1200, title: 'Restructuring engineering teams', date: formatDate(2) },
		{ company: 'Amazon', count: 850, title: 'AWS division optimization', date: formatDate(5) },
		{
			company: 'Salesforce',
			count: 700,
			title: 'Post-acquisition consolidation',
			date: formatDate(8)
		},
		{
			company: 'Intel',
			count: 1500,
			title: 'Manufacturing pivot restructure',
			date: formatDate(12)
		},
		{ company: 'Snap', count: 500, title: 'Cost reduction initiative', date: formatDate(15) }
	];
}
