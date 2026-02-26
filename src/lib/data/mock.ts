/**
 * Mock data for demonstration purposes
 * Used when APIs are unavailable or for testing
 */

import type { NewsItem } from '$lib/types';

export const mockNewsData: Record<string, NewsItem[]> = {
	politics: [
		{
			id: 'mock-politics-1',
			title: '全球领导人峰会讨论气候变化议题',
			link: '#',
			pubDate: new Date().toISOString(),
			timestamp: Date.now(),
			source: 'Mock News',
			category: 'politics',
			isAlert: false,
			region: 'Global',
			topics: ['climate', 'diplomacy']
		},
		{
			id: 'mock-politics-2',
			title: '联合国安理会通过新决议',
			link: '#',
			pubDate: new Date().toISOString(),
			timestamp: Date.now() - 3600000,
			source: 'Mock News',
			category: 'politics',
			isAlert: false,
			region: 'Global',
			topics: ['diplomacy']
		}
	],
	tech: [
		{
			id: 'mock-tech-1',
			title: '人工智能技术在医疗领域取得突破',
			link: '#',
			pubDate: new Date().toISOString(),
			timestamp: Date.now(),
			source: 'Tech Daily',
			category: 'tech',
			isAlert: false,
			region: 'US',
			topics: ['AI', 'healthcare']
		},
		{
			id: 'mock-tech-2',
			title: '新型芯片技术提升计算性能',
			link: '#',
			pubDate: new Date().toISOString(),
			timestamp: Date.now() - 7200000,
			source: 'Tech Daily',
			category: 'tech',
			isAlert: false,
			region: 'Asia',
			topics: ['hardware']
		}
	],
	finance: [
		{
			id: 'mock-finance-1',
			title: '全球股市今日表现强劲',
			link: '#',
			pubDate: new Date().toISOString(),
			timestamp: Date.now(),
			source: 'Finance News',
			category: 'finance',
			isAlert: false,
			region: 'Global',
			topics: ['markets']
		},
		{
			id: 'mock-finance-2',
			title: '央行宣布利率调整',
			link: '#',
			pubDate: new Date().toISOString(),
			timestamp: Date.now() - 1800000,
			source: 'Finance News',
			category: 'finance',
			isAlert: true,
			region: 'US',
			topics: ['policy']
		}
	],
	gov: [
		{
			id: 'mock-gov-1',
			title: '新法案通过国会审议',
			link: '#',
			pubDate: new Date().toISOString(),
			timestamp: Date.now(),
			source: 'Government News',
			category: 'gov',
			isAlert: false,
			region: 'US',
			topics: ['legislation']
		}
	],
	ai: [
		{
			id: 'mock-ai-1',
			title: '大语言模型能力持续提升',
			link: '#',
			pubDate: new Date().toISOString(),
			timestamp: Date.now(),
			source: 'AI Weekly',
			category: 'ai',
			isAlert: false,
			region: 'Global',
			topics: ['LLM']
		},
		{
			id: 'mock-ai-2',
			title: 'AI安全研究取得新进展',
			link: '#',
			pubDate: new Date().toISOString(),
			timestamp: Date.now() - 5400000,
			source: 'AI Weekly',
			category: 'ai',
			isAlert: false,
			region: 'Europe',
			topics: ['safety']
		}
	],
	intel: [
		{
			id: 'mock-intel-1',
			title: '网络安全威胁警报升级',
			link: '#',
			pubDate: new Date().toISOString(),
			timestamp: Date.now(),
			source: 'Intel Report',
			category: 'intel',
			isAlert: true,
			region: 'Global',
			topics: ['cybersecurity']
		}
	]
};

export const mockMarketData = {
	indices: [
		{ symbol: 'SPX', name: '标普500', price: 4450.32, change: 12.45, changePercent: 0.28 },
		{ symbol: 'DJI', name: '道琼斯', price: 34500.15, change: 89.23, changePercent: 0.26 },
		{ symbol: 'IXIC', name: '纳斯达克', price: 13800.45, change: 45.67, changePercent: 0.33 }
	],
	sectors: [
		{ symbol: 'XLK', name: '科技', change: 1.2 },
		{ symbol: 'XLF', name: '金融', change: 0.8 },
		{ symbol: 'XLE', name: '能源', change: -0.5 },
		{ symbol: 'XLI', name: '工业', change: 0.3 }
	],
	commodities: [
		{ symbol: 'GC', name: '黄金', price: 1950.50, change: 5.20 },
		{ symbol: 'CL', name: '原油', price: 85.30, change: -1.10 },
		{ symbol: '^VIX', name: 'VIX', price: 18.50, change: -0.50 }
	],
	crypto: [
		{ id: 'bitcoin', name: '比特币', symbol: 'btc', current_price: 65000, price_change_percentage_24h: 2.5 },
		{ id: 'ethereum', name: '以太坊', symbol: 'eth', current_price: 3500, price_change_percentage_24h: 1.8 }
	]
};

export const mockWorldLeaders = [
	{
		id: 'us',
		name: '美国总统',
		country: '美国',
		flag: '🇺🇸',
		title: '总统',
		party: '民主党',
		since: '2021',
		news: [],
		focus: ['外交政策', '经济']
	},
	{
		id: 'cn',
		name: '中国主席',
		country: '中国',
		flag: '🇨🇳',
		title: '国家主席',
		party: '中共',
		since: '2013',
		news: [],
		focus: ['经济发展', '外交']
	}
];
