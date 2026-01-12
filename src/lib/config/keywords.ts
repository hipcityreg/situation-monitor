/**
 * Keyword configuration for alerts and categorization
 */

export const ALERT_KEYWORDS = [
	'war',
	'invasion',
	'military',
	'nuclear',
	'sanctions',
	'missile',
	'attack',
	'troops',
	'conflict',
	'strike',
	'bomb',
	'casualties',
	'ceasefire',
	'treaty',
	'nato',
	'coup',
	'martial law',
	'emergency',
	'assassination',
	'terrorist',
	'hostage',
	'evacuation'
] as const;

export type AlertKeyword = (typeof ALERT_KEYWORDS)[number];

export const SYSADMIN_KEYWORDS = [
	'sysadmin',
	'system administrator',
	'devops',
	'site reliability',
	'sre',
	'incident response',
	'outage',
	'postmortem',
	'production incident',
	'infrastructure',
	'datacenter',
	'server update',
	'patch tuesday',
	'Windows',
	'Windows Server',
	'Microsoft',
	'Azure',
	'AWS',
	'GCP',
	'iOS',
	'Linux',
	'Linux kernel',
	'Docker',
	'Kubernetes',
	'VMware',
	'RingCentral',
	'Jack Henry',
	'Hacker News',
	'Hackernews'
] as const;

export const REGION_KEYWORDS: Record<string, string[]> = {
	EUROPE: [
		'nato',
		'eu',
		'european',
		'ukraine',
		'russia',
		'germany',
		'france',
		'uk',
		'britain',
		'poland'
	],
	MENA: [
		'iran',
		'israel',
		'saudi',
		'syria',
		'iraq',
		'gaza',
		'lebanon',
		'yemen',
		'houthi',
		'middle east'
	],
	APAC: [
		'china',
		'taiwan',
		'japan',
		'korea',
		'indo-pacific',
		'south china sea',
		'asean',
		'philippines'
	],
	AMERICAS: ['us', 'america', 'canada', 'mexico', 'brazil', 'venezuela', 'latin'],
	AFRICA: ['africa', 'sahel', 'niger', 'sudan', 'ethiopia', 'somalia']
};

export const TOPIC_KEYWORDS: Record<string, string[]> = {
	CYBER: [
		'cyber',
		'hack',
		'ransomware',
		'malware',
		'breach',
		'apt',
		'vulnerability',
		'cve-',
		'cve',
		'zero-day',
		'zero day',
		'security advisory',
		'privilege escalation',
		'remote code execution',
		'rce',
		'exploit'
	],
	NUCLEAR: ['nuclear', 'icbm', 'warhead', 'nonproliferation', 'uranium', 'plutonium'],
	CONFLICT: ['war', 'military', 'troops', 'invasion', 'strike', 'missile', 'combat', 'offensive'],
	INTEL: ['intelligence', 'espionage', 'spy', 'cia', 'mossad', 'fsb', 'covert'],
	DEFENSE: ['pentagon', 'dod', 'defense', 'military', 'army', 'navy', 'air force'],
	DIPLO: ['diplomat', 'embassy', 'treaty', 'sanctions', 'talks', 'summit', 'bilateral']
};

/**
 * Check if a headline contains alert keywords
 */
export function containsAlertKeyword(text: string): { isAlert: boolean; keyword?: string } {
	const lowerText = text.toLowerCase();
	for (const keyword of ALERT_KEYWORDS) {
		if (lowerText.includes(keyword)) {
			return { isAlert: true, keyword };
		}
	}
	return { isAlert: false };
}

/**
 * Detect region from text
 */
export function detectRegion(text: string): string | null {
	const lowerText = text.toLowerCase();
	for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
		if (keywords.some((k) => lowerText.includes(k))) {
			return region;
		}
	}
	return null;
}

/**
 * Detect topics from text
 */
export function detectTopics(text: string): string[] {
	const lowerText = text.toLowerCase();
	const detected: string[] = [];
	for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
		if (keywords.some((k) => lowerText.includes(k))) {
			detected.push(topic);
		}
	}
	return detected;
}
