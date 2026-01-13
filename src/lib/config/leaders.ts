/**
 * World Leaders configuration for tracking
 */

import type { WorldLeader } from '$lib/types';

export const WORLD_LEADERS: WorldLeader[] = [
	// United States
	{
		id: 'trump',
		name: 'Donald Trump',
		title: 'President',
		country: 'United States',
		flag: '🇺🇸',
		keywords: ['trump', 'potus', 'white house'],
		since: 'Jan 2025',
		party: 'Republican',
		focus: ['tariffs', 'immigration', 'deregulation']
	},
	{
		id: 'vance',
		name: 'JD Vance',
		title: 'Vice President',
		country: 'United States',
		flag: '🇺🇸',
		keywords: ['jd vance', 'vice president vance'],
		since: 'Jan 2025',
		party: 'Republican'
	},

	// China
	{
		id: 'xi',
		name: 'Xi Jinping',
		title: 'President',
		country: 'China',
		flag: '🇨🇳',
		keywords: ['xi jinping', 'xi', 'chinese president'],
		since: 'Mar 2013',
		party: 'CCP',
		focus: ['taiwan', 'belt and road', 'tech dominance']
	},

	// Russia
	{
		id: 'putin',
		name: 'Vladimir Putin',
		title: 'President',
		country: 'Russia',
		flag: '🇷🇺',
		keywords: ['putin', 'kremlin', 'russian president'],
		since: 'May 2012',
		party: 'United Russia',
		focus: ['ukraine war', 'nato expansion', 'energy']
	},

	// Europe
	{
		id: 'starmer',
		name: 'Keir Starmer',
		title: 'Prime Minister',
		country: 'United Kingdom',
		flag: '🇬🇧',
		keywords: ['starmer', 'uk pm', 'british prime minister'],
		since: 'Jul 2024',
		party: 'Labour'
	},
	{
		id: 'macron',
		name: 'Emmanuel Macron',
		title: 'President',
		country: 'France',
		flag: '🇫🇷',
		keywords: ['macron', 'french president', 'elysee'],
		since: 'May 2017',
		party: 'Renaissance'
	},
	{
		id: 'merz',
		name: 'Friedtich Merz',
		title: 'Chancellor',
		country: 'Germany',
		flag: '🇩🇪',
		keywords: ['merz', 'german chancellor', 'berlin'],
		since: 'May 2025',
		party: 'CDU'
	},
	{
		id: 'meloni',
		name: 'Giorgia Meloni',
		title: 'Prime Minister',
		country: 'Italy',
		flag: '🇮🇹',
		keywords: ['meloni', 'italian pm', 'italy prime minister'],
		since: 'Oct 2022',
		party: 'Brothers of Italy'
	},

	// Middle East
	{
		id: 'netanyahu',
		name: 'Benjamin Netanyahu',
		title: 'Prime Minister',
		country: 'Israel',
		flag: '🇮🇱',
		keywords: ['netanyahu', 'bibi', 'israeli pm'],
		since: 'Dec 2022',
		party: 'Likud',
		focus: ['gaza', 'iran', 'judicial reform']
	},
	{
		id: 'mbs',
		name: 'Mohammed bin Salman',
		title: 'Crown Prince',
		country: 'Saudi Arabia',
		flag: '🇸🇦',
		keywords: ['mbs', 'saudi crown prince', 'bin salman'],
		since: 'Jun 2017',
		party: 'Royal Family',
		focus: ['vision 2030', 'oil', 'regional influence']
	},
	{
		id: 'khamenei',
		name: 'Ali Khamenei',
		title: 'Supreme Leader',
		country: 'Iran',
		flag: '🇮🇷',
		keywords: ['khamenei', 'supreme leader', 'ayatollah'],
		since: 'Jun 1989',
		party: 'Islamic Republic',
		focus: ['nuclear program', 'proxies', 'sanctions']
	},

	// Asia-Pacific
	{
		id: 'modi',
		name: 'Narendra Modi',
		title: 'Prime Minister',
		country: 'India',
		flag: '🇮🇳',
		keywords: ['modi', 'indian pm', 'india prime minister'],
		since: 'May 2014',
		party: 'BJP',
		focus: ['economy', 'china border', 'technology']
	},
	{
		id: 'kim',
		name: 'Kim Jong Un',
		title: 'Supreme Leader',
		country: 'North Korea',
		flag: '🇰🇵',
		keywords: ['kim jong un', 'north korea', 'pyongyang'],
		since: 'Dec 2011',
		party: 'Workers Party',
		focus: ['nuclear', 'missiles', 'russia alliance']
	},
	{
		id: 'ishiba',
		name: 'Shigeru Ishiba',
		title: 'Prime Minister',
		country: 'Japan',
		flag: '🇯🇵',
		keywords: ['ishiba', 'japanese pm', 'japan prime minister'],
		since: 'Oct 2024',
		party: 'LDP',
		focus: ['defense', 'china', 'us alliance']
	},
	{
		id: 'lai',
		name: 'Lai Ching-te',
		title: 'President',
		country: 'Taiwan',
		flag: '🇹🇼',
		keywords: ['lai ching-te', 'taiwan president', 'taipei'],
		since: 'May 2024',
		party: 'DPP',
		focus: ['china relations', 'defense', 'semiconductors']
	},

	// Ukraine
	{
		id: 'zelensky',
		name: 'Volodymyr Zelensky',
		title: 'President',
		country: 'Ukraine',
		flag: '🇺🇦',
		keywords: ['zelensky', 'ukraine president', 'kyiv'],
		since: 'May 2019',
		party: 'Servant of the People',
		focus: ['war', 'western aid', 'nato membership']
	},

	// Latin America
	{
		id: 'milei',
		name: 'Javier Milei',
		title: 'President',
		country: 'Argentina',
		flag: '🇦🇷',
		keywords: ['milei', 'argentina president', 'buenos aires'],
		since: 'Dec 2023',
		party: 'La Libertad Avanza',
		focus: ['dollarization', 'spending cuts', 'deregulation']
	},
	{
		id: 'lula',
		name: 'Luiz Inácio Lula da Silva',
		title: 'President',
		country: 'Brazil',
		flag: '🇧🇷',
		keywords: ['lula', 'brazil president', 'brasilia'],
		since: 'Jan 2023',
		party: 'PT',
		focus: ['amazon', 'social programs', 'brics']
	},

	// Canada
	{
		id: 'carney',
		name: 'Mark Carney',
		title: 'Prime Minister',
		country: 'Canada',
		flag: '🇨🇦',
		keywords: ['carney', 'canadian pm', 'canada prime minister', 'ottawa'],
		since: 'Mar 2025',
		party: 'Liberal',
		focus: ['tariffs', 'us relations', 'economy']
	}
];
