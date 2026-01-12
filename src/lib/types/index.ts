// Core data types for Situation Monitor

/**
 * News feed category
 */
export type NewsCategory = 'politics' | 'tech' | 'finance' | 'gov' | 'ai' | 'intel';

/**
 * A news item from any source (RSS, GDELT, etc.)
 */
export interface NewsItem {
	id: string;
	title: string;
	link: string;
	pubDate?: string;
	timestamp: number;
	description?: string;
	content?: string;
	source: string;
	category: NewsCategory;
	isAlert?: boolean;
	alertKeyword?: string;
	region?: string;
	topics?: string[];
}

/**
 * RSS feed configuration
 */
export interface FeedConfig {
	name: string;
	url: string;
	category: NewsCategory;
}

/**
 * Market data for stocks/crypto
 */
export interface MarketItem {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
	type?: 'stock' | 'crypto' | 'commodity' | 'index';
}

/**
 * Sector performance data (ETFs like XLK, XLF, etc.)
 */
export interface SectorPerformance {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
}

/**
 * Cryptocurrency data from CoinGecko
 */
export interface CryptoItem {
	id: string;
	symbol: string;
	name: string;
	current_price: number;
	price_change_24h: number;
	price_change_percentage_24h: number;
	market_cap?: number;
	volume_24h?: number;
}

/**
 * Nifty stock data (for Indian market indices)
 */
export interface NiftyStock {
	symbol: string; // e.g., "RELIANCE"
	name: string; // e.g., "Reliance Industries"
	price: number;
	changePercent: number;
	logoUrl: string; // Company logo URL
}

/**
 * Sector heatmap data
 */
export interface SectorData {
	symbol: string;
	name: string;
	change: number;
	color: string;
}

/**
 * Commodity data
 */
export interface CommodityData {
	name: string;
	price: number;
	change: number;
	unit: string;
}

/**
 * Federal Reserve balance sheet data
 */
export interface FedBalanceData {
	value: number;
	change: number;
	changePercent: number;
	percentOfMax: number;
}

/**
 * Earthquake data from USGS
 */
export interface EarthquakeData {
	id: string;
	magnitude: number;
	place: string;
	time: number;
	lat: number;
	lon: number;
	depth: number;
	url: string;
}

/**
 * Polymarket prediction data
 */
export interface PredictionData {
	id: string;
	title: string;
	probability: number;
	volume: number;
	url: string;
}

/**
 * Whale transaction data
 */
export interface WhaleTransaction {
	hash: string;
	from: string;
	to: string;
	value: number;
	token: string;
	timestamp: number;
	type: 'transfer' | 'swap' | 'mint' | 'burn';
}

/**
 * Government contract data
 */
export interface GovContract {
	id: string;
	title: string;
	agency: string;
	value: number;
	vendor: string;
	date: string;
	url: string;
}

/**
 * Layoff announcement data
 */
export interface LayoffData {
	company: string;
	count: number;
	percentage?: number;
	date: string;
	source: string;
	url: string;
}

/**
 * Map hotspot configuration
 */
export interface Hotspot {
	id: string;
	name: string;
	location: string;
	lat: number;
	lon: number;
	level: 'low' | 'medium' | 'high' | 'critical';
	category: string;
	description?: string;
	keywords?: string[];
}

/**
 * Custom monitor created by user
 */
export interface CustomMonitor {
	id: string;
	name: string;
	keywords: string[];
	enabled: boolean;
	color?: string;
	location?: {
		name: string;
		lat: number;
		lon: number;
	};
	createdAt: number;
	updatedAt?: number;
	matchCount: number;
}

/**
 * Panel configuration
 */
export interface PanelConfig {
	id: string;
	title: string;
	category: string;
	enabled: boolean;
	order: number;
}

/**
 * Correlation analysis result
 */
export interface CorrelationResult {
	topic: string;
	count: number;
	sources: string[];
	momentum: 'rising' | 'stable' | 'falling';
	sentiment?: 'positive' | 'neutral' | 'negative';
}

/**
 * Narrative tracking result
 */
export interface NarrativeResult {
	narrative: string;
	mentions: number;
	firstSeen: number;
	lastSeen: number;
	trend: 'emerging' | 'established' | 'fading';
	relatedTopics: string[];
}

/**
 * Main character ranking result
 */
export interface MainCharacterResult {
	name: string;
	mentions: number;
	sources: string[];
	sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
}

/**
 * Service client configuration
 */
export interface ServiceConfig {
	name: string;
	baseUrl: string;
	timeout: number;
	retries: number;
	cacheTtl: number;
	circuitBreaker: {
		failureThreshold: number;
		resetTimeout: number;
	};
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

/**
 * Circuit breaker state
 */
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
	data: T;
	status: 'ok' | 'error';
	error?: string;
	cached?: boolean;
	timestamp: number;
}

/**
 * Refresh state
 */
export interface RefreshState {
	isRefreshing: boolean;
	stage: 0 | 1 | 2 | 3;
	lastUpdated: Date | null;
	error: string | null;
}

/**
 * Settings state
 */
export interface SettingsState {
	panels: Record<string, boolean>;
	panelOrder: string[];
	theme: 'dark' | 'light';
}

/**
 * News item for a world leader
 */
export interface LeaderNews {
	source: string;
	title: string;
	link: string;
	pubDate: string;
}

/**
 * World leader tracking data
 */
export interface WorldLeader {
	id: string;
	name: string;
	title: string;
	country: string;
	flag: string;
	keywords: string[];
	since: string;
	party: string;
	focus?: string[];
	news?: LeaderNews[];
}
