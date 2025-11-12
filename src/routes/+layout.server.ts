import type { LayoutServerLoad } from './$types';
import type { TrainServiceAlert } from '$lib/types/transit';
import {
	getStationsWithLines,
	getConnectionsWithDetails,
	getFaresWithBands
} from '$lib/data/index.js';
import { getTrainServiceAlerts } from '$lib/server/lta';

export const load: LayoutServerLoad = async ({ platform }) => {
	// Get stations with their station lines
	const stationsWithLines = await getStationsWithLines();

	// Get connections with station names and line info
	const connections = await getConnectionsWithDetails();

	// Get fares with distance bands
	const faresWithBands = await getFaresWithBands();

	// Fetch train service alerts from LTA DataMall
	let trainServiceAlerts: TrainServiceAlert | null = null;

	const env = platform?.env as any;
	if (env && env['lta-datamall-api']) {
		const ltaApiKey = await env['lta-datamall-api'].get();
		if (ltaApiKey) {
			trainServiceAlerts = await getTrainServiceAlerts(ltaApiKey);
		}
	}

	return {
		stationsWithLines,
		connections,
		faresWithBands,
		trainServiceAlerts
	};
};
