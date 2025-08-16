<script lang="ts">
	import { Select, Modal, Card } from 'flowbite-svelte';
	import { Train } from '@lucide/svelte';
	import MetroGraph from './metroGraph.svelte';
	import { PathFinder } from './pathFinder';
	import { getLineColour } from '$lib/utils/lineColours';
	import type { Station, Connection, StationLine } from '$lib/utils/transitTyping';

	let {
		stationsWithLines,
		connections
	}: { stationsWithLines: Station[]; connections: Connection[] } = $props();

	const pathFinder = new PathFinder(stationsWithLines, connections);

	// UI state
	let fromStation: number | null = $state(null);
	let toStation: number | null = $state(null);
	let path: any[] = $state([]);
	let showPathDetails = $state(false);
	let totalDuration = $state(0);
	let totalDistance = $state(0);
	let transfersCount = $state(0);

	// Reference to the graph component
	let graphComponent: any;

	// Calculate and display the path
	function calculatePath() {
		if (fromStation && toStation) {
			const result = pathFinder.findShortestPath(fromStation, toStation);
			path = result.path;
			totalDuration = result.duration;
			totalDistance = result.distance;

			// Use PathFinder's method to count transfers
			transfersCount = pathFinder.countTransfers(path);

			showPathDetails = true;

			// Highlight the path on the graph
			if (graphComponent) {
				const stationIds = path.map((p) => p.station);
				graphComponent.highlightPath(stationIds);
			}
		}
	}

	// Handle station click from the graph
	function handleStationClick(stationId: number) {
		if (!fromStation) {
			fromStation = stationId;
		} else if (!toStation) {
			toStation = stationId;
			calculatePath();
		} else {
			fromStation = stationId;
			toStation = null;
			showPathDetails = false;

			if (graphComponent) {
				graphComponent.resetHighlight();
			}
		}
	}

	// Get unique stations for dropdown
	let uniqueStations = () => {
		const stationMap = new Map<number, { id: number; name: string; codes: string[] }>();
		stationsWithLines.forEach((station) => {
			if (!stationMap.has(station.id)) {
				stationMap.set(station.id, {
					id: station.id,
					name: station.name,
					codes: []
				});
			}
			const entry = stationMap.get(station.id)!;
			station.stationLines.forEach((sl: StationLine) => {
				const code = sl.station_code;
				if (code && !entry.codes.includes(code)) {
					entry.codes.push(code);
				}
			});
		});
		return Array.from(stationMap.values());
	};

	// Get filtered stations for departure dropdown (excludes arrival station)
	let departureStations = $derived(
		uniqueStations()
			.filter((station) => station.id !== toStation)
			.sort((a, b) => a.name.localeCompare(b.name))
	);

	// Get filtered stations for arrival dropdown (excludes departure station)
	let arrivalStations = $derived(
		uniqueStations()
			.filter((station) => station.id !== fromStation)
			.sort((a, b) => a.name.localeCompare(b.name))
	);
</script>

<div class="container mx-auto p-4">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
		<div class="hidden md:col-span-3 md:block">
			<MetroGraph
				bind:this={graphComponent}
				{stationsWithLines}
				{connections}
				onStationClick={handleStationClick}
			/>
		</div>

		<Card>
			<div class="mb-4 space-y-4">
				<Select
					bind:value={fromStation}
					on:change={() => {
						if (toStation) calculatePath();
					}}
				>
					<option value={null}>Departure Station</option>
					{#each departureStations as station}
						<option value={station.id}>
							{station.name} ({station.codes.join(', ')})
						</option>
					{/each}
				</Select>

				<Select
					bind:value={toStation}
					on:change={() => {
						if (fromStation) calculatePath();
					}}
				>
					<option value={null}>Arrival Station</option>
					{#each arrivalStations as station}
						<option value={station.id}>
							{station.name} ({station.codes.join(', ')})
						</option>
					{/each}
				</Select>
			</div>
		</Card>
	</div>
</div>

<Modal bind:open={showPathDetails}>
	<div slot="header" class="flex items-center gap-2 text-black dark:text-white">
		<Train class="mr-2" size={24} />
		<h2 class="text-xl font-semibold">
			{path[0]?.stationName} to {path[path.length - 1]?.stationName}
		</h2>
	</div>
	<div class="p-4">
		<div class="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
			<Card class="text-center">
				<div class="text-sm text-gray-400">Duration</div>
				<div class="text-xl font-bold">{Math.floor(totalDuration / 60)} min</div>
			</Card>

			<Card class="text-center">
				<div class="text-sm text-gray-400">Transfers</div>
				<div class="text-xl font-bold">{transfersCount}</div>
			</Card>

			<Card class="text-center">
				<div class="text-sm text-gray-400">Stations</div>
				<div class="text-xl font-bold">{path.length - 1}</div>
			</Card>

			<Card class="text-center">
				<div class="text-sm text-gray-400">Distance</div>
				<div class="text-xl font-bold">{totalDistance.toFixed(1)} km</div>
			</Card>
		</div>

		<div class="space-y-3 text-black dark:text-white">
			{#each path as step, i}
				{#if i === 0 || i === path.length - 1 || (i > 0 && i < path.length - 1 && step.line !== path[i + 1].line)}
					<div class="flex">
						<div class="mr-3 flex flex-col items-center">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full text-white"
								style="background-color: {getLineColour(step.line)}"
							>
								<span class="font-bold">{i + 1}</span>
							</div>
							{#if i < path.length - 1}
								<div class="h-12 w-1 bg-gray-300"></div>
							{/if}
						</div>

						<div class="flex-1">
							<div class="font-semibold">{step.stationName}</div>
							{#if i === 0}
								<div class="text-sm text-slate-500">Start on {step.lineName || 'Unknown Line'}</div>
							{:else if i === path.length - 1}
								<div class="text-sm text-slate-500">Final destination</div>
							{:else}
								<div
									class="mt-1 mb-2 border-l-4 border-yellow-400 bg-yellow-50 p-2 text-sm text-black"
								>
									Transfer from {step.lineName || 'Unknown Line'} to {path[i + 1].lineName ||
										'Unknown Line'}
								</div>
							{/if}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</Modal>
