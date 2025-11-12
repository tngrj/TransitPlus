import type { TrainServiceAlert } from '$lib/types/transit';

const LTA_BASE_URL = 'https://datamall2.mytransport.sg/ltaodataservice';

const createHeaders = (apiKey: string) => {
	const headers = new Headers();
	headers.append('AccountKey', apiKey);
	headers.append('accept', 'application/json');
	return headers;
};

const createRequestOptions = (apiKey: string): RequestInit => ({
	method: 'GET',
	headers: createHeaders(apiKey),
	redirect: 'follow'
});

export const getTrainServiceAlerts = async (
	apiKey: string
): Promise<TrainServiceAlert | null> => {
	try {
		if (!apiKey) {
			console.error('LTA API key not provided');
			return null;
		}

		const response = await fetch(
			`${LTA_BASE_URL}/TrainServiceAlerts`,
			createRequestOptions(apiKey)
		);

		if (!response.ok) {
			console.error('Failed to fetch train service alerts:', response.status);
			return null;
		}

		const result = (await response.json()) as { value: TrainServiceAlert };
		return result.value;
	} catch (error) {
		console.error('Error fetching train service alerts:', error);
		return null;
	}
};
