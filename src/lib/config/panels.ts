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
	| 'fed';

export const PANELS: Record<PanelId, PanelConfig> = {
	map: { name: '全球地图', priority: 1 },
	politics: { name: '世界/地缘政治', priority: 1 },
	tech: { name: '技术/AI', priority: 1 },
	finance: { name: '金融', priority: 1 },
	gov: { name: '政府/政策', priority: 2 },
	heatmap: { name: '行业热图', priority: 1 },
	markets: { name: '市场', priority: 1 },
	monitors: { name: '我的监控器', priority: 1 },
	commodities: { name: '商品/VIX', priority: 2 },
	crypto: { name: '加密货币', priority: 2 },
	polymarket: { name: 'Polymarket', priority: 2 },
	whales: { name: '鲸鱼监控', priority: 3 },
	mainchar: { name: '主要角色', priority: 2 },
	printer: { name: '印钞机', priority: 2 },
	contracts: { name: '政府合同', priority: 3 },
	ai: { name: 'AI军备竞赛', priority: 3 },
	layoffs: { name: '裁员追踪', priority: 3 },
	venezuela: { name: '委内瑞拉局势', priority: 2 },
	greenland: { name: '格陵兰局势', priority: 2 },
	iran: { name: '伊朗局势', priority: 2 },
	leaders: { name: '世界领导人', priority: 1 },
	intel: { name: '情报源', priority: 2 },
	correlation: { name: '关联引擎', priority: 1 },
	narrative: { name: '叙事追踪', priority: 1 },
	fed: { name: '美联储', priority: 1 }
};

export const NON_DRAGGABLE_PANELS: PanelId[] = ['map'];

export const MAP_ZOOM_MIN = 1;
export const MAP_ZOOM_MAX = 4;
export const MAP_ZOOM_STEP = 0.5;
