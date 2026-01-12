/**
 * RSS feed and news source configuration
 */

import type { NewsCategory } from '$lib/types';

export interface FeedSource {
	name: string;
	url: string;
}

export interface IntelSource extends FeedSource {
	type: 'think-tank' | 'defense' | 'regional' | 'osint' | 'govt' | 'cyber';
	topics: string[];
	region?: string;
}

export const FEEDS: Record<NewsCategory, FeedSource[]> = {
	politics: [
		{ name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
		{ name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml' },
		{ name: 'Guardian World', url: 'https://www.theguardian.com/world/rss' },
		{ name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' }
	],
	tech: [
		{ name: 'Hacker News', url: 'https://hnrss.org/frontpage' },
		{ name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
		{ name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
		{ name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
		{ name: 'ArXiv AI', url: 'https://rss.arxiv.org/rss/cs.AI' },
		{ name: 'OpenAI Blog', url: 'https://openai.com/news/rss.xml' }
	],
	security: [
		{ name: 'NVD CVE Feed', url: 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml' },
		{
			name: 'CISA Known Exploited Vulnerabilities',
			url: 'https://www.cisa.gov/feeds/known-exploited-vulnerabilities-catalog.xml'
		},
		{ name: 'MSRC Security Updates', url: 'https://msrc.microsoft.com/update-guide/rss' },
		{ name: 'SANS ISC Diary', url: 'https://isc.sans.edu/rssfeed.xml' },
		{ name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/' },
		{ name: 'The Register Security', url: 'https://www.theregister.com/security/headlines.atom' }
	],
	sysadmin: [
		{ name: 'Kubernetes Blog', url: 'https://kubernetes.io/feed.xml' },
		{ name: 'CNCF Blog', url: 'https://www.cncf.io/feed/' },
		{ name: 'HashiCorp Blog', url: 'https://www.hashicorp.com/blog/feed.xml' },
		{ name: 'Docker Blog', url: 'https://www.docker.com/blog/feed/' },
		{ name: 'AWS What\'s New', url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/' },
		{ name: 'Azure Updates', url: 'https://azurecomcdn.azureedge.net/en-us/updates/feed/' },
		{ name: 'Google Cloud Blog', url: 'https://cloudblog.withgoogle.com/rss/' },
		{ name: 'LWN Headlines', url: 'https://lwn.net/headlines/rss' }
	],
	local: [],
	finance: [
		{ name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
		{ name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories' },
		{ name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },
		{ name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
		{ name: 'FT', url: 'https://www.ft.com/rss/home' }
	],
	gov: [
		{ name: 'White House', url: 'https://www.whitehouse.gov/news/feed/' },
		{ name: 'Federal Reserve', url: 'https://www.federalreserve.gov/feeds/press_all.xml' },
		{ name: 'SEC Announcements', url: 'https://www.sec.gov/news/pressreleases.rss' },
		{
			name: 'DoD News',
			url: 'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=10&ContentType=1&Site=945'
		}
	],
	ai: [
		{ name: 'OpenAI Blog', url: 'https://openai.com/news/rss.xml' },
		{ name: 'ArXiv AI', url: 'https://rss.arxiv.org/rss/cs.AI' }
	],
	intel: [
		{ name: 'CSIS', url: 'https://www.csis.org/analysis/feed' },
		{ name: 'Brookings', url: 'https://www.brookings.edu/feed/' }
	]
};

export const INTEL_SOURCES: IntelSource[] = [
	{
		name: 'CSIS',
		url: 'https://www.csis.org/analysis/feed',
		type: 'think-tank',
		topics: ['defense', 'geopolitics']
	},
	{
		name: 'Brookings',
		url: 'https://www.brookings.edu/feed/',
		type: 'think-tank',
		topics: ['policy', 'geopolitics']
	},
	{
		name: 'CFR',
		url: 'https://www.cfr.org/rss.xml',
		type: 'think-tank',
		topics: ['foreign-policy']
	},
	{
		name: 'Defense One',
		url: 'https://www.defenseone.com/rss/all/',
		type: 'defense',
		topics: ['military', 'defense']
	},
	{
		name: 'War on Rocks',
		url: 'https://warontherocks.com/feed/',
		type: 'defense',
		topics: ['military', 'strategy']
	},
	{
		name: 'Breaking Defense',
		url: 'https://breakingdefense.com/feed/',
		type: 'defense',
		topics: ['military', 'defense']
	},
	{
		name: 'The Drive War Zone',
		url: 'https://www.thedrive.com/the-war-zone/feed',
		type: 'defense',
		topics: ['military']
	},
	{
		name: 'The Diplomat',
		url: 'https://thediplomat.com/feed/',
		type: 'regional',
		topics: ['asia-pacific'],
		region: 'APAC'
	},
	{
		name: 'Al-Monitor',
		url: 'https://www.al-monitor.com/rss',
		type: 'regional',
		topics: ['middle-east'],
		region: 'MENA'
	},
	{
		name: 'Bellingcat',
		url: 'https://www.bellingcat.com/feed/',
		type: 'osint',
		topics: ['investigation', 'osint']
	},
	{
		name: 'CISA Alerts',
		url: 'https://www.cisa.gov/uscert/ncas/alerts.xml',
		type: 'cyber',
		topics: ['cyber', 'security']
	},
	{
		name: 'Krebs Security',
		url: 'https://krebsonsecurity.com/feed/',
		type: 'cyber',
		topics: ['cyber', 'security']
	}
];
