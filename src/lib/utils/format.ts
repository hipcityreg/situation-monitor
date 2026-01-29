/**
 * Formatting utilities
 */

/**
 * Format relative time from a date
 */
export function timeAgo(dateInput: string | number | Date): string {
	const date = new Date(dateInput);
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (seconds < 60) return '刚刚';
	if (seconds < 3600) return Math.floor(seconds / 60) + '分钟前';
	if (seconds < 86400) return Math.floor(seconds / 3600) + '小时前';
	return Math.floor(seconds / 86400) + '天前';
}

/**
 * Get relative time with more detail
 */
export function getRelativeTime(dateInput: string | number | Date): string {
	const date = new Date(dateInput);
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const days = Math.floor(hours / 24);

	if (hours < 1) return '刚刚';
	if (hours < 24) return `${hours}小时前`;
	if (days < 7) return `${days}天前`;
	return date.toLocaleDateString();
}

/**
 * Format currency value
 */
export function formatCurrency(
	value: number,
	options: { decimals?: number; compact?: boolean; symbol?: string } = {}
): string {
	const { decimals = 2, compact = false, symbol = '$' } = options;

	if (compact) {
		if (Math.abs(value) >= 1e12) return symbol + (value / 1e12).toFixed(1) + 'T';
		if (Math.abs(value) >= 1e9) return symbol + (value / 1e9).toFixed(1) + 'B';
		if (Math.abs(value) >= 1e6) return symbol + (value / 1e6).toFixed(1) + 'M';
		if (Math.abs(value) >= 1e3) return symbol + (value / 1e3).toFixed(0) + 'K';
	}

	return symbol + value.toLocaleString('en-US', { maximumFractionDigits: decimals });
}

/**
 * Format number with compact notation
 */
export function formatNumber(value: number, decimals = 2): string {
	if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(1) + 'B';
	if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(1) + 'M';
	if (Math.abs(value) >= 1e3) return (value / 1e3).toFixed(1) + 'K';
	return value.toFixed(decimals);
}

/**
 * Format percent change with sign
 */
export function formatPercentChange(value: number, decimals = 2): string {
	const sign = value > 0 ? '+' : '';
	return sign + value.toFixed(decimals) + '%';
}

/**
 * Get CSS class for positive/negative change
 */
export function getChangeClass(value: number): 'up' | 'down' | '' {
	if (value > 0) return '上涨';
	if (value < 0) return '下跌';
	return '';
}

/**
 * Escape HTML for safe display
 */
export function escapeHtml(text: string): string {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Get date from days ago
 */
export function getDateDaysAgo(days: number): string {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date.toISOString().split('T')[0];
}

/**
 * Get today's date formatted
 */
export function getToday(): string {
	return new Date().toISOString().split('T')[0];
}

/**
 * Convert lat/lon to map position (equirectangular projection)
 */
export function latLonToXY(
	lat: number,
	lon: number,
	width: number,
	height: number
): { x: number; y: number } {
	const x = ((lon + 180) / 360) * width;
	const y = ((90 - lat) / 180) * height;
	return { x, y };
}
