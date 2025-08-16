export interface Line {
	code: string;
	name: string;
}

export interface Station {
	name: string;
	codes: string[];
}

export interface Connection {
	from: string;
	to: string;
	line: string;
	duration_seconds: number;
	distance_km: number;
	is_transfer: boolean;
}

export interface DistanceBand {
	min_km: number;
	max_km: number;
}

export interface FareRates {
	student: { early: number; normal: number };
	adult: { early: number; normal: number };
	senior_citizen: { early: number; normal: number };
	concession: { early: number; normal: number };
	disability: { early: number; normal: number };
}

export interface TrainService {
	distance: DistanceBand;
	fares: FareRates;
}

export interface LinesData {
	lines: Line[];
}

export interface StationsData {
	stations: Station[];
}

export interface ConnectionsData {
	connections: Connection[];
}

export interface TrainFareData {
	train_services: TrainService[];
}

// Enhanced types for the application
export interface StationWithLines {
	id: string;
	name: string;
	stationLines: StationLine[];
}

export interface StationLine {
	id: string;
	station_id: string;
	line_id: string;
	station_code: string;
	position_number: number;
}

export interface ConnectionWithDetails {
	id: string;
	fromStationId: string;
	toStationId: string;
	lineId: string;
	fromLineId?: string;
	toLineId?: string;
	durationSeconds: number;
	distanceKm: number;
	isTransfer: boolean;
	fromStationName: string;
	toStationName: string;
	lineName: string;
}

export interface FareWithBands {
	passengerType: string;
	timeType: string;
	bands: Array<{
		minKm: number;
		maxKm: number;
		fare: number;
	}>;
} 