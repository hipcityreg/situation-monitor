/**
 * Panel configuration
 */

export interface PanelConfig {
	name: string;
	priority: 1 | 2 | 3;
}

export type PanelId =
	| 'map'
	| 'politics'
	| 'tech'
	| 'finance'
	| 'gov'
	| 'heatmap'
	| 'markets'
	| 'monitors'
	| 'commodities'
	| 'crypto'
	| 'polymarket'
	| 'whales'
	| 'mainchar'
	| 'printer'
	| 'contracts'
	| 'ai'
	| 'layoffs'
	| 'venezuela'
	| 'greenland'
	| 'iran'
	| 'leaders'
	| 'intel'
	| 'correlation'
	| 'narrative'
	| 'nifty50'
	| 'niftynext50';

export const PANELS: Record<PanelId, PanelConfig> = {
	map: { name: 'Global Map', priority: 1 },
	politics: { name: 'World / Geopolitical', priority: 1 },
	tech: { name: 'Technology / AI', priority: 1 },
	finance: { name: 'Financial', priority: 1 },
	gov: { name: 'Government / Policy', priority: 2 },
	heatmap: { name: 'Sector Heatmap', priority: 1 },
	markets: { name: 'Markets', priority: 1 },
	monitors: { name: 'My Monitors', priority: 1 },
	commodities: { name: 'Commodities / VIX', priority: 2 },
	crypto: { name: 'Crypto', priority: 2 },
	polymarket: { name: 'Polymarket', priority: 2 },
	whales: { name: 'Whale Watch', priority: 3 },
	mainchar: { name: 'Main Character', priority: 2 },
	printer: { name: 'Money Printer', priority: 2 },
	contracts: { name: 'Gov Contracts', priority: 3 },
	ai: { name: 'AI Arms Race', priority: 3 },
	layoffs: { name: 'Layoffs Tracker', priority: 3 },
	venezuela: { name: 'Venezuela Situation', priority: 2 },
	greenland: { name: 'Greenland Situation', priority: 2 },
	iran: { name: 'Iran Situation', priority: 2 },
	leaders: { name: 'World Leaders', priority: 1 },
	intel: { name: 'Intel Feed', priority: 2 },
	correlation: { name: 'Correlation Engine', priority: 1 },
	narrative: { name: 'Narrative Tracker', priority: 1 },
	nifty50: { name: 'Nifty 50 Heatmap', priority: 2 },
	niftynext50: { name: 'Nifty Next 50 Heatmap', priority: 2 }
};

export const NON_DRAGGABLE_PANELS: PanelId[] = ['map'];

export const MAP_ZOOM_MIN = 1;
export const MAP_ZOOM_MAX = 4;
export const MAP_ZOOM_STEP = 0.5;
