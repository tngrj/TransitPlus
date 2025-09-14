import type { LayoutServerLoad } from './$types';
import {
	getStationsWithLines,
	getConnectionsWithDetails,
	getFaresWithBands
} from '$lib/data/index.js';

export const load: LayoutServerLoad = async () => {
	// Get stations with their station lines
	const stationsWithLines = await getStationsWithLines();

	// Get connections with station names and line info
	const connectionsData = await getConnectionsWithDetails();

	// Get fares with distance bands
	const faresWithBands = await getFaresWithBands();

	return {
		stationsWithLines,
		connections: connectionsData,
		faresWithBands
	};
};
