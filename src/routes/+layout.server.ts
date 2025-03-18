import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { lines, stations, stationLines, connections } from '$lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export const load: LayoutServerLoad = async () => {
	// Get stations with their station lines
	const stationsWithLines = await db
		.select({
			id: stations.id,
			name: stations.name,
			stationLines: sql`json_agg(${stationLines})`
		})
		.from(stations)
		.leftJoin(stationLines, eq(stations.id, stationLines.station_id))
		.groupBy(stations.id, stations.name);

	const fromStations = alias(stations, 'fromStations');
	const toStations = alias(stations, 'toStations');

	// Get connections with station names and line info
	const connectionsData = await db
		.select({
			id: connections.id,
			fromStationId: connections.from_station_id,
			toStationId: connections.to_station_id,
			lineId: connections.line_id,
			fromLineId: connections.from_line_id,
			toLineId: connections.to_line_id,
			durationSeconds: connections.duration_seconds,
			distanceKm: connections.distance_km,
			isTransfer: connections.is_transfer,
			fromStationName: fromStations.name,
			toStationName: toStations.name,
			lineName: lines.name
		})
		.from(connections)
		.leftJoin(fromStations, eq(connections.from_station_id, fromStations.id))
		.leftJoin(toStations, eq(connections.to_station_id, toStations.id))
		.leftJoin(lines, eq(connections.line_id, lines.id));

	return {
		stationsWithLines,
		connections: connectionsData
	};
};
