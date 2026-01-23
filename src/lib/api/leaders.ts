/**
 * World Leaders API - Fetch news for world leaders from GDELT
 */

import { WORLD_LEADERS } from '$lib/config/leaders';
import type { WorldLeader, LeaderNews } from '$lib/types';
import { fetchWithProxy, logger } from '$lib/config/api';

interface GdeltArticle {
	title: string;
	url: string;
	seendate: string;
	domain: string;
}

interface GdeltResponse {
	articles?: GdeltArticle[];
}

/**
 * Fetch news for a single leader
 */
async function fetchLeaderNews(leader: WorldLeader): Promise<WorldLeader> {
	// Build query from leader's keywords - GDELT requires OR'd terms to be wrapped in parentheses
	const query = `(${leader.keywords.map((k) => `"${k}"`).join(' OR ')})`;

	try {
		const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&maxrecords=5&format=json&sort=date`;

		const response = await fetchWithProxy(gdeltUrl);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const contentType = response.headers.get('content-type');
		if (!contentType?.includes('application/json')) {
			return { ...leader, news: [] };
		}

		const text = await response.text();
		let data: GdeltResponse;
		try {
			data = JSON.parse(text);
		} catch {
			return { ...leader, news: [] };
		}

		const news: LeaderNews[] = (data.articles || []).map((article) => ({
			source: article.domain || 'Unknown',
			title: article.title || '',
			link: article.url || '',
			pubDate: article.seendate || ''
		}));

		return { ...leader, news };
	} catch (error) {
		logger.warn('Leaders API', `Error fetching news for ${leader.name}:`, error);
		return { ...leader, news: [] };
	}
}

/**
 * Fetch news for all world leaders
 * Batches requests to avoid rate limits
 */
export async function fetchWorldLeaders(): Promise<WorldLeader[]> {
	const batchSize = 5;
	const results: WorldLeader[] = [];

	// Fetch in batches to avoid rate limits
	for (let i = 0; i < WORLD_LEADERS.length; i += batchSize) {
		const batch = WORLD_LEADERS.slice(i, i + batchSize);
		const batchResults = await Promise.allSettled(batch.map(fetchLeaderNews));

		for (const result of batchResults) {
			if (result.status === 'fulfilled') {
				results.push(result.value);
			}
		}

		// Small delay between batches
		if (i + batchSize < WORLD_LEADERS.length) {
			await new Promise((resolve) => setTimeout(resolve, 300));
		}
	}

	// Sort by news activity (leaders with more news first)
	return results.sort((a, b) => (b.news?.length || 0) - (a.news?.length || 0));
}
