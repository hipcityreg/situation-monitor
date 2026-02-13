/**
 * Treasury API Proxy - Server-side proxy for FRED data
 * Bypasses browser CORS restrictions
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// FRED API configuration
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';
const FRED_API_KEY = process.env.VITE_FRED_API_KEY || '';

export const GET: RequestHandler = async ({ url }) => {
	const seriesId = url.searchParams.get('series_id') || 'DGS2';
	
	// Validate series_id
	const validSeries = ['DGS2', 'DGS10', 'DGS5', 'DGS30'];
	if (!validSeries.includes(seriesId)) {
		return json({ error: `Invalid series_id: ${seriesId}` }, { status: 400 });
	}

	if (!FRED_API_KEY) {
		return json({ error: 'FRED API key not configured' }, { status: 500 });
	}

	try {
		// Fetch from FRED API server-side (no CORS issues)
		const apiUrl = `${FRED_BASE_URL}?series_id=${seriesId}&sort_order=desc&limit=1&api_key=${FRED_API_KEY}&file_type=json`;
		
		const response = await fetch(apiUrl);
		
		if (!response.ok) {
			throw new Error(`FRED API returned ${response.status}`);
		}

		const data = await response.json();
		
		// Return simplified data
		const observation = data.observations?.[0];
		
		return json({
			series_id: seriesId,
			date: observation?.date || null,
			value: observation?.value ? parseFloat(observation.value) : null,
			realtime_start: data.realtime_start,
			source: 'FRED (St. Louis Fed)'
		});

	} catch (error) {
		console.error('[Treasury Proxy] Error:', error);
		return json({ 
			error: 'Failed to fetch treasury data',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
};
