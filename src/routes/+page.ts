import type { Station, Connection } from '$lib/utils/transitTyping';

export interface PageData {
	stationsWithLines: Station[];
	connections: Connection[];
}
