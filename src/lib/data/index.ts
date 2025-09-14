import type {
	LinesData,
	StationsData,
	ConnectionsData,
	TrainFareData,
	StationWithLines,
	ConnectionWithDetails,
	FareWithBands
} from '$lib/types/transit.js';

// Import JSON data
import linesData from './lines.json';
import stationsData from './stations.json';
import connectionsData from './connections.json';
import trainFareData from './train_fare.json';
import sgRailGeoJson from './sg-rail.geo.json';

// Create lookup maps for efficient data access
const linesMap = new Map<string, { id: string; code: string; name: string }>();
const stationsMap = new Map<string, { id: string; name: string; codes: string[] }>();
const stationCodeToNameMap = new Map<string, string>();
const stationLinesMap = new Map<
	string,
	Array<{
		id: string;
		station_id: string;
		line_id: string;
		station_code: string;
		position_number: number;
	}>
>();

// Initialize lookup maps
function initializeMaps() {
	// Initialize lines map
	(linesData as LinesData).lines.forEach((line, index) => {
		const id = (index + 1).toString();
		linesMap.set(line.code, { id, code: line.code, name: line.name });
	});

	// Initialize stations map and station lines
	(stationsData as StationsData).stations.forEach((station, index) => {
		const id = (index + 1).toString();
		stationsMap.set(station.name, { id, name: station.name, codes: station.codes });

		// Create mapping from station codes to station names
		station.codes.forEach((code) => {
			stationCodeToNameMap.set(code, station.name);
		});

		// Create station lines for each code
		const stationLines = station.codes.map((code, codeIndex) => {
			const lineCode = code.replace(/\d+$/, ''); // Extract line code (e.g., "NS" from "NS10")
			const positionNumber = parseInt(code.replace(/[A-Z]+/, '')); // Extract position number
			const line = linesMap.get(lineCode);

			return {
				id: `${id}_${codeIndex}`,
				station_id: id,
				line_id: line?.id || '',
				station_code: code,
				position_number: positionNumber
			};
		});

		stationLinesMap.set(station.name, stationLines);
	});
}

// Initialize maps on module load
initializeMaps();

export async function getStationsWithLines(): Promise<StationWithLines[]> {
	const stations: StationWithLines[] = [];

	for (const [stationName, station] of stationsMap) {
		const stationLines = stationLinesMap.get(stationName) || [];
		stations.push({
			id: station.id,
			name: station.name,
			stationLines
		});
	}

	return stations;
}

export async function getConnectionsWithDetails(): Promise<ConnectionWithDetails[]> {
	const connections: ConnectionWithDetails[] = [];
	const connectionsList = (connectionsData as ConnectionsData).connections;

	connectionsList.forEach((connection, index) => {
		const fromStationName = stationCodeToNameMap.get(connection.from);
		const toStationName = stationCodeToNameMap.get(connection.to);
		const fromStation = fromStationName ? stationsMap.get(fromStationName) : undefined;
		const toStation = toStationName ? stationsMap.get(toStationName) : undefined;
		const line = linesMap.get(connection.line);

		if (fromStation && toStation && line) {
			connections.push({
				id: (index + 1).toString(),
				fromStationId: fromStation.id,
				toStationId: toStation.id,
				lineId: line.id,
				fromLineId: connection.is_transfer ? line.id : undefined,
				toLineId: connection.is_transfer ? line.id : undefined,
				durationSeconds: connection.duration_seconds,
				distanceKm: connection.distance_km,
				isTransfer: connection.is_transfer,
				fromStationName: fromStation.name,
				toStationName: toStation.name,
				lineName: line.name
			});
		}
	});

	return connections;
}

export async function getFaresWithBands(): Promise<FareWithBands[]> {
	const fares: FareWithBands[] = [];
	const trainServices = (trainFareData as TrainFareData).train_services;

	// Process each passenger type and time type
	const passengerTypes = [
		'student',
		'adult',
		'senior_citizen',
		'concession',
		'disability'
	] as const;
	const timeTypes = ['early', 'normal'] as const;

	for (const passengerType of passengerTypes) {
		for (const timeType of timeTypes) {
			const bands = trainServices.map((service, index) => ({
				minKm: service.distance.min_km,
				maxKm: service.distance.max_km,
				fare: service.fares[passengerType][timeType]
			}));

			fares.push({
				passengerType,
				timeType,
				bands
			});
		}
	}

	return fares;
}

// Additional utility functions
export function getStationByName(name: string) {
	return stationsMap.get(name);
}

export function getLineByCode(code: string) {
	return linesMap.get(code);
}

export function getAllStations() {
	return Array.from(stationsMap.values());
}

export function getAllLines() {
	return Array.from(linesMap.values());
}

export function getConnections() {
	return (connectionsData as ConnectionsData).connections;
}

export function getTrainFares() {
	return (trainFareData as TrainFareData).train_services;
}

export function getSgRailGeoJson() {
	return sgRailGeoJson;
}
