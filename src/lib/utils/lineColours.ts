export type LineColours = Record<number, { color: string; code: string }>;

// Referenced from https://en.wikipedia.org/wiki/Module:Adjacent_stations/SMRT
export const lineColours: LineColours = {
	1: { color: '#d42e12', code: 'NS' },
	2: { color: '#009645', code: 'EW' },
	3: { color: '#fa9e0d', code: 'CC' },
	4: { color: '#9900aa', code: 'NE' },
	5: { color: '#005ec4', code: 'DT' },
	6: { color: '#9D5B25', code: 'TE' },
	7: { color: '#009645', code: 'CG' },
	8: { color: '#748477', code: 'BP' },
	9: { color: '#748477', code: 'SE' },
	10: { color: '#748477', code: 'SW' },
	11: { color: '#748477', code: 'PE' },
	12: { color: '#748477', code: 'PW' },
	13: { color: '#fa9e0d', code: 'CE' }
};

export function getLineColour(lineId: number | null): string {
	if (lineId === null) return 'gray';
	return lineColours[lineId]?.color || 'gray';
}

export function getLineCodeFromId(lineId: number): string {
	return lineColours[lineId]?.code || 'Unknown';
}

export function getApiLineCodeFromStationCode(stationCode: string): string | null {
	// Extract the line prefix (letters only)
	const linePrefix = stationCode.replace(/[0-9]/g, '');

	const mapping: Record<string, string> = {
		NS: 'NSL',
		EW: 'EWL',
		CC: 'CCL',
		NE: 'NEL',
		DT: 'DTL',
		TE: 'TEL',
		CG: 'CGL',
		BP: 'BPL',
		SE: 'SLRT',
		SW: 'SLRT',
		PE: 'PLRT',
		PW: 'PLRT',
		CE: 'CEL'
	};

	return mapping[linePrefix] || null;
}
