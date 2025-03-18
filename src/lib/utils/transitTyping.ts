export interface StationLine {
	id: number;
	station_id: number;
	line_id: number;
	station_code: string;
	position_number: number;
}

export interface Station {
	id: number;
	name: string;
	stationLines: StationLine[];
}

export interface Connection {
	id: number;
	fromStationId: number;
	toStationId: number;
	lineId: number | null;
	fromLineId: number | null;
	toLineId: number | null;
	durationSeconds: number;
	distanceKm: number | null;
	isTransfer: boolean;
	fromStationName: string | null;
	toStationName: string | null;
	lineName: string | null;
}
