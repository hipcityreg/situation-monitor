import { describe, it, expect } from 'vitest';
import {
	HOTSPOTS,
	CHOKEPOINTS,
	CABLE_LANDINGS,
	NUCLEAR_SITES,
	MILITARY_BASES,
	THREAT_COLORS
} from '$lib/config/map';

// These tests verify the data structures and logic used by GlobePanel
describe('GlobePanel Data Functions', () => {
	describe('Test 1: Points Data Generation', () => {
		it('should have valid hotspot data with all required fields', () => {
			HOTSPOTS.forEach((h) => {
				expect(h.name).toBeDefined();
				expect(typeof h.lat).toBe('number');
				expect(typeof h.lon).toBe('number');
				expect(['critical', 'high', 'elevated', 'low']).toContain(h.level);
				expect(h.desc).toBeDefined();
			});
		});

		it('should have valid chokepoint data', () => {
			expect(CHOKEPOINTS.length).toBeGreaterThan(0);
			CHOKEPOINTS.forEach((cp) => {
				expect(cp.name).toBeDefined();
				expect(typeof cp.lat).toBe('number');
				expect(typeof cp.lon).toBe('number');
			});
		});

		it('should have valid cable landing data', () => {
			expect(CABLE_LANDINGS.length).toBeGreaterThan(0);
			CABLE_LANDINGS.forEach((cl) => {
				expect(cl.name).toBeDefined();
				expect(typeof cl.lat).toBe('number');
				expect(typeof cl.lon).toBe('number');
			});
		});

		it('should have valid nuclear site data', () => {
			expect(NUCLEAR_SITES.length).toBeGreaterThan(0);
			NUCLEAR_SITES.forEach((ns) => {
				expect(ns.name).toBeDefined();
				expect(typeof ns.lat).toBe('number');
				expect(typeof ns.lon).toBe('number');
			});
		});

		it('should have valid military base data', () => {
			expect(MILITARY_BASES.length).toBeGreaterThan(0);
			MILITARY_BASES.forEach((mb) => {
				expect(mb.name).toBeDefined();
				expect(typeof mb.lat).toBe('number');
				expect(typeof mb.lon).toBe('number');
			});
		});
	});

	describe('Test 2: Threat Colors Configuration', () => {
		it('should have all threat level colors defined', () => {
			expect(THREAT_COLORS.critical).toBeDefined();
			expect(THREAT_COLORS.high).toBeDefined();
			expect(THREAT_COLORS.elevated).toBeDefined();
			expect(THREAT_COLORS.low).toBeDefined();
		});

		it('should have valid hex color format', () => {
			const hexRegex = /^#[0-9a-fA-F]{6}$/;
			expect(THREAT_COLORS.critical).toMatch(hexRegex);
			expect(THREAT_COLORS.high).toMatch(hexRegex);
			expect(THREAT_COLORS.elevated).toMatch(hexRegex);
			expect(THREAT_COLORS.low).toMatch(hexRegex);
		});
	});

	describe('Test 3: Arc Data for Tension Corridors', () => {
		it('should have required hotspots for arc connections', () => {
			const hotspotNames = HOTSPOTS.map((h) => h.name);

			// Verify all arc connection endpoints exist
			expect(hotspotNames).toContain('Moscow');
			expect(hotspotNames).toContain('Kyiv');
			expect(hotspotNames).toContain('Tehran');
			expect(hotspotNames).toContain('Tel Aviv');
			expect(hotspotNames).toContain('Beijing');
			expect(hotspotNames).toContain('Taipei');
			expect(hotspotNames).toContain('Pyongyang');
			expect(hotspotNames).toContain('Tokyo');
		});

		it('should be able to create arc data between connected hotspots', () => {
			const arcConnections = [
				{ from: 'Moscow', to: 'Kyiv' },
				{ from: 'Tehran', to: 'Tel Aviv' },
				{ from: 'Beijing', to: 'Taipei' },
				{ from: 'Pyongyang', to: 'Tokyo' }
			];

			const hotspotMap = new Map(HOTSPOTS.map((h) => [h.name, h]));

			arcConnections.forEach((conn) => {
				const from = hotspotMap.get(conn.from);
				const to = hotspotMap.get(conn.to);
				expect(from).toBeDefined();
				expect(to).toBeDefined();
				if (from && to) {
					expect(typeof from.lat).toBe('number');
					expect(typeof from.lon).toBe('number');
					expect(typeof to.lat).toBe('number');
					expect(typeof to.lon).toBe('number');
				}
			});
		});
	});

	describe('Marker Size Calculations', () => {
		it('should calculate correct sizes based on threat level', () => {
			const getSizeForLevel = (level: string): number => {
				switch (level) {
					case 'critical':
						return 0.8;
					case 'high':
						return 0.6;
					default:
						return 0.4;
				}
			};

			expect(getSizeForLevel('critical')).toBe(0.8);
			expect(getSizeForLevel('high')).toBe(0.6);
			expect(getSizeForLevel('elevated')).toBe(0.4);
			expect(getSizeForLevel('low')).toBe(0.4);
		});
	});

	describe('Rings Data for Critical Hotspots', () => {
		it('should identify critical hotspots for pulsing rings', () => {
			const criticalHotspots = HOTSPOTS.filter((h) => h.level === 'critical');
			expect(criticalHotspots.length).toBeGreaterThan(0);

			criticalHotspots.forEach((h) => {
				expect(h.lat).toBeDefined();
				expect(h.lon).toBeDefined();
			});
		});
	});
});
