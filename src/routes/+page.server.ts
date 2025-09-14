import {
	getStationsWithLines,
	getConnectionsWithDetails,
	getFaresWithBands
} from '$lib/data/index.js';

export const load = async () => {
	const stationsWithLines = await getStationsWithLines();
	const connections = await getConnectionsWithDetails();
	const faresWithBands = await getFaresWithBands();

	return {
		stationsWithLines,
		connections,
		faresWithBands
	};
};
