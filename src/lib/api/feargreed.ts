/**
 * Fear & Greed Index API - For Bitcoin (alternative.me)
 * 
 * Free API: https://api.alternative.me/fng/?limit=0
 * Returns current index + historical data
 */

import { logger } from '$lib/config/api';

export interface FearGreedData {
	value: number | string;
	value_classification: string;
	timestamp: string;
	time_until_update: string;
}

export interface FearGreedResponse {
	name: string;
	data: FearGreedData[];
	metadata: { error: string | null };
}

export type FearGreedClassification = 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';

const FEARGREED_URL = 'https://api.alternative.me/fng/';

/**
 * Demo data for when API fails
 */
const DEMO_FEARGREED: FearGreedData = {
	value: 55,
	value_classification: 'Neutral',
	timestamp: Math.floor(Date.now() / 1000).toString(),
	time_until_update: '3600'
};

/**
 * Fetch Fear & Greed Index for BTC
 */
export async function fetchFearGreedIndex(limit: number = 1): Promise<FearGreedData | null> {
	try {
		logger.log('FearGreed API', 'Fetching BTC Fear & Greed Index');

		const response = await fetch(`${FEARGREED_URL}?limit=${limit}`);
		
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: FearGreedResponse = await response.json();
		
		if (data.metadata.error || !data.data || data.data.length === 0) {
			throw new Error(data.metadata.error || 'No data returned');
		}

		return data.data[0];
	} catch (error) {
		logger.error('FearGreed API', 'Error fetching Fear & Greed:', error);
		return DEMO_FEARGREED;
	}
}

/**
 * Fetch historical Fear & Greed data and calculate percentile
 * @param days Number of historical days (default 365)
 * @returns { current: FearGreedData, history: FearGreedData[], percentile: number }
 */
export async function fetchFearGreedHistory(days: number = 365): Promise<{
	current: FearGreedData | null;
	history: FearGreedData[];
	percentile: number | null;
}> {
	try {
		const response = await fetch(`${FEARGREED_URL}?limit=${days}`);
		
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: FearGreedResponse = await response.json();
		
		if (data.metadata.error || !data.data || data.data.length === 0) {
			throw new Error(data.metadata.error || 'No data returned');
		}

		const history = data.data;
		const current = history[0];

		// Calculate percentile: % of historical values below current
		// Ensure value is parsed as number (API returns string)
		const historicalValues = history.slice(1).map((d) => {
			const val = typeof d.value === 'string' ? parseInt(d.value, 10) : d.value;
			return isNaN(val) ? 0 : val;
		});
		const currentValueRaw = typeof current.value === 'string' ? parseInt(current.value, 10) : current.value;
		const currentValue = isNaN(currentValueRaw) ? 0 : currentValueRaw;
		
		// Calculate percentile
		let percentile: number | null = null;
		if (historicalValues.length > 0 && currentValue > 0) {
			const lowerCount = historicalValues.filter((v) => v < currentValue).length;
			percentile = Math.round((lowerCount / historicalValues.length) * 100);
		}
		
		logger.log('FearGreed API', `Calculated percentile: ${percentile}% (current: ${currentValue}, history length: ${historicalValues.length})`);

		return { current, history, percentile };
	} catch (error) {
		logger.error('FearGreed API', 'Error fetching history:', error);
		return { current: DEMO_FEARGREED, history: [], percentile: null };
	}
}

/**
 * Get classification label
 */
export function getFearGreedLabel(classification: string): string {
	return classification;
}

/**
 * Get color class for value
 */
export function getFearGreedClass(value: number): string {
	if (value <= 24) return 'extreme-fear';
	if (value <= 44) return 'fear';
	if (value <= 55) return 'neutral';
	if (value <= 74) return 'greed';
	return 'extreme-greed';
}

/**
 * Get status text
 */
export function getFearGreedStatus(value: number): string {
	if (value <= 24) return 'Extreme Fear - Potential buying opportunity';
	if (value <= 44) return 'Fear - Market caution';
	if (value <= 55) return 'Neutral - Balanced sentiment';
	if (value <= 74) return 'Greed - Growing optimism';
	return 'Extreme Greed - Potential overvaluation';
}
