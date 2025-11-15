import type { TrainServiceAlert, PcdRealTimeData } from '$lib/types/transit';

const LTA_BASE_URL = 'https://datamall2.mytransport.sg/ltaodataservice';

const VALID_LINES = [
	'CCL',
	'CEL',
	'CGL',
	'DTL',
	'EWL',
	'NEL',
	'NSL',
	'BPL',
	'SLRT',
	'PLRT',
	'TEL'
] as const;

type ValidLine = (typeof VALID_LINES)[number];

function makeHeaders(apiKey: string): Headers {
	return new Headers({
		AccountKey: apiKey,
		accept: 'application/json'
	});
}

function makeRequest(apiKey: string): RequestInit {
	return {
		method: 'GET',
		headers: makeHeaders(apiKey),
		redirect: 'follow'
	};
}

async function fetchJSON<T>(url: string, apiKey: string): Promise<T> {
	const response = await fetch(url, makeRequest(apiKey));

	if (!response.ok) {
		throw new Error(`LTA API error: ${response.status} ${response.statusText}`);
	}

	return response.json() as Promise<T>;
}

/** ---------------------------
 * Train Service Alerts
 * ---------------------------- */
export async function getTrainServiceAlerts(apiKey: string): Promise<TrainServiceAlert> {
	if (!apiKey) throw new Error('Missing LTA API key');

	const url = `${LTA_BASE_URL}/TrainServiceAlerts`;
	const result = await fetchJSON<{ value: TrainServiceAlert }>(url, apiKey);

	return result.value;
}

/** ---------------------------
 * PCD Real-time
 * ---------------------------- */
export async function getPcdRealTime(
	apiKey: string,
	trainLine: string
): Promise<PcdRealTimeData[]> {
	if (!apiKey) throw new Error('Missing LTA API key');

	const line = trainLine.toUpperCase() as ValidLine;

	if (!VALID_LINES.includes(line)) {
		throw new Error(`Invalid train line code: ${trainLine}`);
	}

	const url = `${LTA_BASE_URL}/PCDRealTime?TrainLine=${line}`;
	const result = await fetchJSON<{ value: PcdRealTimeData[] }>(url, apiKey);

	return result.value;
}
