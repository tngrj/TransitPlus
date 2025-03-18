import type { Station, StationLine, Connection } from '$lib/utils/transitTyping';

// Define additional types needed for the algorithm
export type StationWithLines = Station & {
	stationLines?: StationLine[];
};

export type PathStep = {
	station: number;
	line: number | null;
	lineName: string | null;
	stationName: string;
};

type Graph = Record<
	number,
	Array<{
		to: number;
		duration: number;
		distance: number;
		lineId: number | null;
		lineName: string | null;
		isTransfer: boolean;
	}>
>;

export type PathResult = {
	path: PathStep[];
	duration: number;
	distance: number;
};

export class PathFinder {
	private stationsWithLines: StationWithLines[];
	private connections: Connection[];
	private graph: Graph | null = null;

	constructor(stationsWithLines: StationWithLines[], connections: Connection[]) {
		this.stationsWithLines = stationsWithLines;
		this.connections = connections;
	}

	// Build graph data structure from connections data
	private buildGraph(): Graph {
		const graph: Graph = {};

		// Initialize an entry for each station
		this.stationsWithLines.forEach((station) => {
			graph[station.id] = [];
		});

		// Add connections to the graph
		this.connections.forEach((conn) => {
			// Add from -> to connection
			if (!graph[conn.fromStationId]) {
				graph[conn.fromStationId] = [];
			}

			graph[conn.fromStationId].push({
				to: conn.toStationId,
				duration: conn.durationSeconds,
				distance: conn.distanceKm,
				lineId: conn.lineId || conn.fromLineId,
				lineName: conn.lineName,
				isTransfer: conn.isTransfer
			});

			// If it's not a one-way connection, add to -> from as well
			// Assuming all connections are two-way unless explicitly marked
			if (!conn.isTransfer) {
				// Don't add two-way for transfers
				if (!graph[conn.toStationId]) {
					graph[conn.toStationId] = [];
				}

				graph[conn.toStationId].push({
					to: conn.fromStationId,
					duration: conn.durationSeconds,
					distance: conn.distanceKm,
					lineId: conn.lineId || conn.toLineId,
					lineName: conn.lineName,
					isTransfer: false
				});
			}
		});

		return graph;
	}

	// Get station by ID
	private getStationName(stationId: number): string {
		const station = this.stationsWithLines.find((s) => s.id === stationId);
		return station ? String(station.name) : 'Unknown';
	}

	// Dijkstra algorithm to find shortest path
	public findShortestPath(from: number, to: number): PathResult {
		// Build or use cached graph
		if (!this.graph) {
			this.graph = this.buildGraph();
		}

		const graph = this.graph;
		const queue: Array<{
			station: number;
			duration: number;
			distance: number;
			path: PathStep[];
			currentLine: number | null;
			transfers: number;
		}> = [];

		// Track best path to each station for each number of transfers
		const bestPaths = new Map<string, number>(); // key: station-transfers, value: duration

		// Start from the source station
		queue.push({
			station: from,
			duration: 0,
			distance: 0,
			path: [
				{
					station: from,
					line: graph[from][0]?.lineId || null,
					lineName: graph[from][0]?.lineName || null,
					stationName: this.getStationName(from)
				}
			],
			currentLine: graph[from][0]?.lineId || null,
			transfers: 0
		});

		let bestResult: {
			path: PathStep[];
			duration: number;
			distance: number;
			transfers: number;
		} | null = null;

		while (queue.length > 0) {
			// Sort by transfers first, then by duration
			queue.sort((a, b) => {
				if (a.transfers !== b.transfers) return a.transfers - b.transfers;
				return a.duration - b.duration;
			});

			const current = queue.shift()!;

			// Skip if we already have a better path with fewer or equal transfers
			if (bestResult && current.transfers >= bestResult.transfers) continue;

			// If we've reached the destination
			if (current.station === to) {
				if (!bestResult || current.transfers < bestResult.transfers) {
					bestResult = {
						path: current.path,
						duration: current.duration,
						distance: current.distance,
						transfers: current.transfers
					};
				}
				continue;
			}

			// Process all neighbors
			if (graph[current.station]) {
				for (const neighbor of graph[current.station]) {
					// Check if this is a transfer
					const isTransfer =
						current.currentLine !== null &&
						neighbor.lineId !== null &&
						current.currentLine !== neighbor.lineId;

					const nextTransfers = current.transfers + (isTransfer ? 1 : 0);
					const nextDuration = current.duration + neighbor.duration;
					const nextDistance = Number(current.distance) + Number(neighbor.distance);

					// Skip if we already have a better path to this station with same or fewer transfers
					const key = `${neighbor.to}-${nextTransfers}`;
					const bestDuration = bestPaths.get(key);
					if (bestDuration !== undefined && bestDuration <= nextDuration) continue;

					// Update best path for this station and transfer count
					bestPaths.set(key, nextDuration);

					// Create updated path
					const updatedPath = [
						...current.path,
						{
							station: neighbor.to,
							line: neighbor.lineId,
							lineName: neighbor.lineName,
							stationName: this.getStationName(neighbor.to)
						}
					];

					// Add to queue
					queue.push({
						station: neighbor.to,
						duration: nextDuration,
						distance: nextDistance,
						path: updatedPath,
						currentLine: neighbor.lineId,
						transfers: nextTransfers
					});
				}
			}
		}

		// If no path found, return empty result
		if (!bestResult) {
			return { path: [], duration: 0, distance: 0 };
		}

		return {
			path: bestResult.path,
			duration: bestResult.duration,
			distance: bestResult.distance
		};
	}

	// Calculate number of transfers in a path
	public countTransfers(path: PathStep[]): number {
		let transfersCount = 0;
		let prevLine = null;

		for (const step of path) {
			if (prevLine !== null && step.line !== null && prevLine !== step.line) {
				transfersCount++;
			}
			prevLine = step.line;
		}

		return transfersCount;
	}
}
