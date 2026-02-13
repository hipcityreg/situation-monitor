/**
 * News API - Fetch news from RSS feeds via rss2json
 * Each category: max 10 latest articles
 * Shows: source, time, link
 */

import type { NewsItem, NewsCategory } from '$lib/types';
import { logger } from '$lib/config/api';

// RSS to JSON API (free tier: 10,000 requests/day)
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

// Primary RSS feeds for each category
const RSS_FEEDS: Record<NewsCategory, string> = {
	politics: 'https://feeds.bbci.co.uk/news/world/rss.xml',
	tech: 'https://hnrss.org/frontpage',
	finance: 'https://feeds.marketwatch.com/marketwatch/topstories',
	gov: 'https://www.whitehouse.gov/news/feed/',
	ai: 'https://openai.com/news/rss.xml',
	intel: 'https://www.cisa.gov/uscert/ncas/alerts.xml'
};

function timeAgo(timestamp: number): string {
	const seconds = Math.floor((Date.now() - timestamp) / 1000);
	if (seconds < 60) return `${seconds}s ago`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

interface RSSItem {
	title: string;
	link: string;
	description: string;
	pubDate: string;
	author?: string;
	categories?: string[];
}

interface RSSFeed {
	status: string;
	items: RSSItem[];
	feed?: {
		title: string;
		description?: string;
		image?: { url: string };
	};
}

/**
 * Fetch news for a category - max 10 articles
 */
export async function fetchCategoryNews(category: NewsCategory): Promise<NewsItem[]> {
	const maxArticles = 10;
	const rssUrl = RSS_FEEDS[category];

	if (!rssUrl) {
		logger.warn('News', `No RSS feed for ${category}`);
		return [];
	}

	try {
		const response = await fetch(RSS2JSON_API + encodeURIComponent(rssUrl), {
			signal: AbortSignal.timeout(15000)
		});

		if (!response.ok) {
			logger.warn('News', `${category}: HTTP ${response.status}`);
			return [];
		}

		const data: RSSFeed = await response.json();

		if (data.status !== 'ok' || !data.items || data.items.length === 0) {
			logger.warn('News', `${category}: No items or status failed`);
			return [];
		}

		// Get source name from feed title
		const sourceName = data.feed?.title || category.charAt(0).toUpperCase() + category.slice(1);

		// Transform RSS items to NewsItem format
		return data.items.slice(0, maxArticles).map((item, index) => {
			const pubDate = new Date(item.pubDate);
			
			return {
				id: `${category}-${index}-${Date.now()}`,
				title: item.title || '',
				link: item.link || '',
				pubDate: item.pubDate,
				timestamp: pubDate.getTime(),
				source: sourceName,
				category,
				isAlert: false,
				region: undefined,
				topics: item.categories || []
			};
		});
	} catch (error) {
		logger.error('News', `Error fetching ${category}:`, error);
		return [];
	}
}

/**
 * Fetch all news - sequential to avoid rate limits
 */
export async function fetchAllNews(): Promise<Record<NewsCategory, NewsItem[]>> {
	const categories: NewsCategory[] = ['politics', 'tech', 'finance', 'gov', 'ai', 'intel'];
	const result: Record<NewsCategory, NewsItem[]> = {
		politics: [],
		tech: [],
		finance: [],
		gov: [],
		ai: [],
		intel: []
	};

	for (const category of categories) {
		logger.log('News', `Fetching ${category}...`);
		result[category] = await fetchCategoryNews(category);
	}

	return result;
}
