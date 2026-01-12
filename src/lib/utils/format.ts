/**
 * Formatting utilities
 */

/**
 * Format relative time from a date
 */
export function timeAgo(dateInput: string | number | Date | undefined | null): string {
	if (!dateInput) return '';

	const date = new Date(dateInput);

	// Check if date is valid
	if (isNaN(date.getTime())) return '';

	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	// Handle future dates
	if (seconds < 0) return 'just now';

	if (seconds < 60) return 'just now';
	if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
	if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
	return Math.floor(seconds / 86400) + 'd';
}

/**
 * Get relative time with more detail
 */
export function getRelativeTime(dateInput: string | number | Date | undefined | null): string {
	if (!dateInput) return '';

	const date = new Date(dateInput);

	// Check if date is valid
	if (isNaN(date.getTime())) return '';

	const now = new Date();
	const diff = now.getTime() - date.getTime();

	// Handle future dates
	if (diff < 0) return 'Just now';

	const hours = Math.floor(diff / (1000 * 60 * 60));
	const days = Math.floor(hours / 24);

	if (hours < 1) return 'Just now';
	if (hours < 24) return `${hours}h ago`;
	if (days < 7) return `${days}d ago`;
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
	if (value > 0) return 'up';
	if (value < 0) return 'down';
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
