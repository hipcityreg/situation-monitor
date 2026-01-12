/**
 * News API - Fetch news from GDELT and other sources
 */

import { FEEDS } from '$lib/config/feeds';
import type { NewsItem, NewsCategory, CoreNewsCategory } from '$lib/types';
import {
	containsAlertKeyword,
	detectRegion,
	detectTopics,
	SYSADMIN_KEYWORDS
} from '$lib/config/keywords';
import { fetchWithProxy, API_DELAYS, logger } from '$lib/config/api';

/**
 * Simple hash function to generate unique IDs from URLs
 */
function hashCode(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash).toString(36);
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse GDELT date format (20251202T224500Z) to valid Date
 */
function parseGdeltDate(dateStr: string): Date {
	if (!dateStr) return new Date();
	// Convert 20251202T224500Z to 2025-12-02T22:45:00Z
	const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
	if (match) {
		const [, year, month, day, hour, min, sec] = match;
		return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}Z`);
	}
	// Fallback to standard parsing
	return new Date(dateStr);
}

interface GdeltArticle {
	title: string;
	url: string;
	seendate: string;
	domain: string;
	socialimage?: string;
}

interface GdeltResponse {
	articles?: GdeltArticle[];
}

/**
 * Parse RSS/Atom feed into NewsItem entries
 */
function parseRssFeed(xmlText: string, source: string, category: NewsCategory): NewsItem[] {
	if (typeof DOMParser === 'undefined') return [];

	const doc = new DOMParser().parseFromString(xmlText, 'text/xml');

	const readText = (parent: Element, selectors: string[]): string => {
		for (const selector of selectors) {
			const el = parent.querySelector(selector);
			if (el?.textContent) return el.textContent.trim();
		}
		return '';
	};

	const parseDate = (value: string): { timestamp: number; pubDate?: string } => {
		if (!value) return { timestamp: Date.now() };
		const parsed = Date.parse(value);
		if (Number.isNaN(parsed)) return { timestamp: Date.now() };
		return { timestamp: parsed, pubDate: value };
	};

	const rssItems = Array.from(doc.querySelectorAll('item'));
	const atomEntries = Array.from(doc.querySelectorAll('entry'));
	const items = rssItems.length > 0 ? rssItems : atomEntries;

	return items
		.map((item) => {
			const title = readText(item, ['title']);
			const description = readText(item, ['description', 'summary', 'content\\:encoded', 'content']);

			let link = readText(item, ['link', 'guid']);
			if (!link && item.tagName.toLowerCase() === 'entry') {
				const linkEl =
					item.querySelector('link[rel="alternate"]') ?? item.querySelector('link');
				link = linkEl?.getAttribute('href')?.trim() ?? '';
			}

			const dateText = readText(item, ['pubDate', 'updated', 'published', 'dc\\:date']);
			const { timestamp, pubDate } = parseDate(dateText);

			if (!title && !link) return null;

			const idSource = link || `${title}-${dateText || timestamp}`;
			const uniqueId = `rss-${category}-${hashCode(idSource)}`;

			return {
				id: uniqueId,
				title: title || link,
				link,
				pubDate,
				timestamp,
				description: description || undefined,
				source,
				category
			} satisfies NewsItem;
		})
		.filter((item): item is NewsItem => Boolean(item));
}

function dedupeNewsItems(items: NewsItem[]): NewsItem[] {
	const seen = new Set<string>();
	return items.filter((item) => {
		const key = item.link || item.id;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function buildKeywordQuery(keywords: readonly string[]): string {
	return keywords
		.map((keyword) => keyword.trim())
		.filter((keyword) => keyword.length > 0)
		.map((keyword) => (/\s/.test(keyword) ? `"${keyword}"` : keyword))
		.join(' OR ');
}

function sanitizeQueryTerm(value: string): string {
	return value.replace(/[()"']/g, '').trim();
}

function buildLocationQuery(city: string, state: string): string {
	const safeCity = sanitizeQueryTerm(city);
	const safeState = sanitizeQueryTerm(state);
	const terms: string[] = [];

	if (safeCity && safeState) {
		terms.push(`"${safeCity}, ${safeState}"`, `"${safeCity} ${safeState}"`);
	}
	if (safeCity) terms.push(`"${safeCity}"`);
	if (safeState) terms.push(`"${safeState}"`);

	return terms.length > 0 ? `(${terms.join(' OR ')})` : '';
}

async function fetchRssFeedsForCategory(category: CoreNewsCategory): Promise<NewsItem[]> {
	const sources = FEEDS[category] ?? [];
	if (sources.length === 0) return [];

	const results = await Promise.allSettled(
		sources.map(async (source) => {
			try {
				const response = await fetchWithProxy(source.url);
				if (!response.ok) {
					logger.warn('News API', `RSS fetch failed (${source.name}): ${response.status}`);
					return [];
				}
				const xml = await response.text();
				return parseRssFeed(xml, source.name, category);
			} catch (error) {
				logger.warn('News API', `RSS fetch error (${source.name}):`, error);
				return [];
			}
		})
	);

	return results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
}

/**
 * Transform GDELT article to NewsItem
 */
function transformGdeltArticle(
	article: GdeltArticle,
	category: NewsCategory,
	source: string,
	index: number
): NewsItem {
	const title = article.title || '';
	const alert = containsAlertKeyword(title);
	// Generate unique ID using category, URL hash, and index
	const urlHash = article.url ? hashCode(article.url) : Math.random().toString(36).slice(2);
	const uniqueId = `gdelt-${category}-${urlHash}-${index}`;

	const parsedDate = parseGdeltDate(article.seendate);

	return {
		id: uniqueId,
		title,
		link: article.url,
		pubDate: article.seendate,
		timestamp: parsedDate.getTime(),
		source: source || article.domain || 'Unknown',
		category,
		isAlert: !!alert,
		alertKeyword: alert?.keyword || undefined,
		region: detectRegion(title) ?? undefined,
		topics: detectTopics(title)
	};
}

/**
 * Fetch news for a specific category using GDELT via proxy
 */
export async function fetchCategoryNews(category: CoreNewsCategory): Promise<NewsItem[]> {
	// Build query from category keywords (GDELT requires OR queries in parentheses)
	const sysadminQuery = buildKeywordQuery(SYSADMIN_KEYWORDS);
	const categoryQueries: Record<CoreNewsCategory, string> = {
		politics: '(politics OR government OR election OR congress)',
		tech: '(technology OR software OR startup OR "silicon valley")',
		security:
			'(CVE OR vulnerability OR exploit OR "security advisory" OR "zero day" OR ransomware OR "privilege escalation" OR "remote code execution")',
		sysadmin: sysadminQuery.length > 0 ? `(${sysadminQuery})` : '(sysadmin OR devops OR sre)',
		finance: '(finance OR "stock market" OR economy OR banking)',
		gov: '("federal government" OR "white house" OR congress OR regulation)',
		ai: '("artificial intelligence" OR "machine learning" OR AI OR ChatGPT)',
		intel: '(intelligence OR security OR military OR defense)'
	};

	let gdeltItems: NewsItem[] = [];

	try {
		// Add English language filter and timespan for fresh results
		const baseQuery = categoryQueries[category];
		const fullQuery = `${baseQuery} sourcelang:english`;
		// Build the raw GDELT URL with timespan=7d to get recent articles
		const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${fullQuery}&timespan=7d&mode=artlist&maxrecords=20&format=json&sort=date`;

		logger.log('News API', `Fetching ${category} from GDELT`);

		const response = await fetchWithProxy(gdeltUrl);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		// Check content type before parsing as JSON
		const contentType = response.headers.get('content-type');
		if (!contentType?.includes('application/json')) {
			logger.warn('News API', `Non-JSON response for ${category}:`, contentType);
		} else {
			const text = await response.text();
			let data: GdeltResponse;
			try {
				data = JSON.parse(text);
			} catch {
				logger.warn('News API', `Invalid JSON for ${category}:`, text.slice(0, 100));
				data = {};
			}

			if (data?.articles?.length) {
				// Get source names for this category
				const categoryFeeds = FEEDS[category] || [];
				const defaultSource = categoryFeeds[0]?.name || 'News';

				gdeltItems = data.articles.map((article, index) =>
					transformGdeltArticle(article, category, article.domain || defaultSource, index)
				);
			}
		}
	} catch (error) {
		logger.error('News API', `Error fetching ${category}:`, error);
	}

	if (category === 'security' || category === 'sysadmin') {
		const rssItems = await fetchRssFeedsForCategory(category);
		return dedupeNewsItems([...rssItems, ...gdeltItems]).sort((a, b) => b.timestamp - a.timestamp);
	}

	return gdeltItems;
}

export interface LocalNewsFilter {
	city: string;
	state: string;
}

/**
 * Fetch local news for a specific city/state using GDELT via proxy
 */
export async function fetchLocalNews(filter: LocalNewsFilter): Promise<NewsItem[]> {
	const city = filter.city.trim();
	const state = filter.state.trim();
	const locationQuery = buildLocationQuery(city, state);
	if (!locationQuery) return [];

	const fullQuery = `${locationQuery} sourcelang:english`;
	const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${fullQuery}&timespan=7d&mode=artlist&maxrecords=20&format=json&sort=date`;

	try {
		logger.log('News API', `Fetching local news for ${city} ${state}`.trim());

		const response = await fetchWithProxy(gdeltUrl);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const contentType = response.headers.get('content-type');
		if (!contentType?.includes('application/json')) {
			logger.warn('News API', 'Non-JSON response for local news:', contentType);
			return [];
		}

		const text = await response.text();
		let data: GdeltResponse;
		try {
			data = JSON.parse(text);
		} catch {
			logger.warn('News API', 'Invalid JSON for local news:', text.slice(0, 100));
			return [];
		}

		if (!data?.articles?.length) return [];

		const locationLabel = [city, state].filter(Boolean).join(', ') || 'Local News';

		return dedupeNewsItems(
			data.articles.map((article, index) =>
				transformGdeltArticle(article, 'local', article.domain || locationLabel, index)
			)
		).sort((a, b) => b.timestamp - a.timestamp);
	} catch (error) {
		logger.error('News API', 'Error fetching local news:', error);
		return [];
	}
}

/** All news categories in fetch order */
const NEWS_CATEGORIES: CoreNewsCategory[] = [
	'politics',
	'tech',
	'security',
	'sysadmin',
	'finance',
	'gov',
	'ai',
	'intel'
];

/** Create an empty news result object */
function createEmptyNewsResult(): Record<CoreNewsCategory, NewsItem[]> {
	return {
		politics: [],
		tech: [],
		security: [],
		sysadmin: [],
		finance: [],
		gov: [],
		ai: [],
		intel: []
	};
}

/**
 * Fetch all news - sequential with delays to avoid rate limiting
 */
export async function fetchAllNews(): Promise<Record<CoreNewsCategory, NewsItem[]>> {
	const result = createEmptyNewsResult();

	for (let i = 0; i < NEWS_CATEGORIES.length; i++) {
		const category = NEWS_CATEGORIES[i];

		if (i > 0) {
			await delay(API_DELAYS.betweenCategories);
		}

		result[category] = await fetchCategoryNews(category);
	}

	return result;
}
