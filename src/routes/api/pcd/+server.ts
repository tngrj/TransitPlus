import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPcdRealTime } from '$lib/server/lta';

export const GET: RequestHandler = async ({ url, platform }) => {
	const trainLine = url.searchParams.get('trainLine');

	if (!trainLine) {
		return json({ error: 'trainLine parameter is required' }, { status: 400 });
	}

	try {
		const env = platform?.env as any;
		if (!env || !env['lta-datamall-api']) {
			return json({ error: 'API key not configured' }, { status: 500 });
		}

		const ltaApiKey = await env['lta-datamall-api'].get();
		if (!ltaApiKey) {
			return json({ error: 'API key not available' }, { status: 500 });
		}

		const pcdData = await getPcdRealTime(ltaApiKey, trainLine);

		if (!pcdData) {
			return json({ error: 'Failed to fetch PCD data' }, { status: 500 });
		}

		return json({ data: pcdData });
	} catch (error) {
		console.error('Error in PCD API:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
