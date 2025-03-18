<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { getLineColour, getLineCodeFromId } from '$lib/utils/lineColours';

	let { stationsWithLines, connections, onStationClick } = $props();

	// Map dimensions
	let width = 900;
	let height = 600;
	let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
	let gContainer: d3.Selection<SVGGElement, unknown, null, undefined>;

	// Zoom behavior
	const zoom = d3
		.zoom<SVGSVGElement, unknown>()
		.scaleExtent([0.1, 4]) // Allow zooming from 0.1x to 4x
		.on('zoom', (event) => {
			gContainer.attr('transform', event.transform);
		});

	// Define types for nodes and links
	type Node = {
		id: number;
		name: string;
		lineId: number | null;
		code: string;
		positionNumber: number;
		x?: number;
		y?: number;
		fx?: number | null;
		fy?: number | null;
	};

	type Link = {
		source: number | Node;
		target: number | Node;
		lineId: number | null;
		isTransfer: boolean;
		duration: number;
	};

	// Force-directed graph layout
	function createForceGraph() {
		// First, extract unique line IDs
		const lineIds = new Set<number>();
		stationsWithLines.forEach((station) => {
			if (station.stationLines) {
				lineIds.add(station.stationLines.line_id);
			}
		});

		// Create nodes for each station
		const nodes: Node[] = stationsWithLines.map((station) => ({
			id: station.id,
			name: station.name,
			lineId: station.stationLines?.line_id || null,
			code: station.stationLines?.station_code || '',
			positionNumber: station.stationLines?.position_number || 0
		}));

		// Create links from connections
		const links: Link[] = connections.map((conn) => ({
			source: conn.fromStationId,
			target: conn.toStationId,
			lineId: conn.lineId || conn.fromLineId,
			isTransfer: conn.isTransfer,
			duration: conn.durationSeconds
		}));

		// Clear any existing SVG
		d3.select('#map-container').select('svg').remove();

		// Create new SVG with zoom support
		svg = d3
			.select('#map-container')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height])
			.call(zoom);

		// Add a container group for zooming
		gContainer = svg.append('g');

		// Create the simulation
		const simulation = d3
			.forceSimulation<Node>(nodes)
			.force(
				'link',
				d3
					.forceLink<Node, Link>(links)
					.id((d) => d.id)
					.distance((d) => {
						// Check if either source or target node is from BP, PW, PE, SW, or SE lines
						const shortLines = ['BP', 'PW', 'PE', 'SW', 'SE'];
						const sourceCode = (d.source as Node).code.slice(0, 2);
						const targetCode = (d.target as Node).code.slice(0, 2);
						const isShortLine = shortLines.includes(sourceCode) || shortLines.includes(targetCode);
						return isShortLine ? 25 : 50;
					})
					.strength(1)
			)
			.force('charge', d3.forceManyBody<Node>().strength(-300))
			.force('center', d3.forceCenter<Node>(width / 2, height / 2))
			.force('collision', d3.forceCollide<Node>(20));

		// Draw the links
		const link = gContainer
			.append('g')
			.selectAll<SVGLineElement, Link>('line')
			.data(links)
			.join('line')
			.attr('stroke', (d: Link) => getLineColour(d.lineId))
			.attr('stroke-width', (d: Link) => (d.isTransfer ? 1 : 3))
			.attr('stroke-dasharray', (d: Link) => (d.isTransfer ? '3,3' : ''))
			.attr('class', (d: Link) => `line-${d.lineId} connection`);

		// Draw the stations
		const node = gContainer
			.append('g')
			.selectAll<SVGGElement, Node>('g')
			.data(nodes)
			.join('g')
			.attr('class', (d: Node) => `station station-${d.id}`)
			.call(
				d3
					.drag<SVGGElement, Node>()
					.on('start', dragstarted)
					.on('drag', dragged)
					.on('end', dragended)
					.subject((event, d) => ({ x: d.x || 0, y: d.y || 0 })) // Fix dragging offset
			);

		// Add station circles
		node
			.append('circle')
			.attr('r', 8)
			.attr('fill', (d) => getLineColour(d.lineId))
			.attr('stroke', 'white')
			.attr('stroke-width', 2);

		// Add station labels
		node
			.append('text')
			.attr('dy', -12)
			.attr('text-anchor', 'middle')
			.attr('font-size', '10px')
			.text((d) => d.name);

		// Add station codes if available
		node
			.append('text')
			.attr('dy', 3)
			.attr('text-anchor', 'middle')
			.attr('font-size', '8px')
			.attr('fill', 'white')
			.text((d) => d.code || (d.lineId ? getLineCodeFromId(d.lineId) : ''));

		// Make stations clickable for path selection
		node.on('click', (event, d) => {
			if (onStationClick) {
				onStationClick(d.id);
			}
		});

		// Update positions on tick
		simulation.on('tick', () => {
			link
				.attr('x1', (d) => (d.source as any).x)
				.attr('y1', (d) => (d.source as any).y)
				.attr('x2', (d) => (d.target as any).x)
				.attr('y2', (d) => (d.target as any).y);

			node.attr('transform', (d) => `translate(${d.x},${d.y})`);
		});

		// Drag functions
		function dragstarted(event: any) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			event.subject.fx = event.subject.x;
			event.subject.fy = event.subject.y;
		}

		function dragged(event: any) {
			event.subject.fx = event.x;
			event.subject.fy = event.y;
		}

		function dragended(event: any) {
			if (!event.active) simulation.alphaTarget(0);
			event.subject.fx = null;
			event.subject.fy = null;
		}
	}

	// Highlight a path on the graph
	export function highlightPath(pathStations: number[]) {
		if (!svg || pathStations.length === 0) return;

		resetHighlight();

		// Dim all elements
		svg.selectAll('.connection').classed('dimmed', true);
		svg.selectAll('.station').classed('dimmed', true);

		// Highlight stations in the path
		for (let i = 0; i < pathStations.length; i++) {
			svg
				.select(`.station-${pathStations[i]}`)
				.classed('highlighted', true)
				.classed('dimmed', false);

			// Highlight connections between consecutive stations
			if (i < pathStations.length - 1) {
				const currentStation = pathStations[i];
				const nextStation = pathStations[i + 1];

				// Find the connection between these stations
				svg
					.selectAll('.connection')
					.filter(function (d: any) {
						return (
							(d.source.id === currentStation && d.target.id === nextStation) ||
							(d.source.id === nextStation && d.target.id === currentStation)
						);
					})
					.classed('path-highlight', true)
					.classed('dimmed', false);
			}
		}
	}

	// Reset highlights
	export function resetHighlight() {
		if (!svg) return;

		svg.selectAll('.connection').classed('dimmed', false).classed('path-highlight', false);
		svg.selectAll('.station').classed('dimmed', false).classed('highlighted', false);
	}

	onMount(() => {
		createForceGraph();
	});
</script>

<svelte:head>
	<style>
		.connection.dimmed {
			opacity: 0.2;
		}

		.station.dimmed {
			opacity: 0.3;
		}

		.connection.path-highlight {
			stroke-width: 5;
			stroke-opacity: 0.8;
		}

		.station.highlighted circle {
			r: 10;
			stroke: #ffcc00;
			stroke-width: 3;
		}
	</style>
</svelte:head>

<div id="map-container" class="h-full min-h-96 rounded-lg bg-gray-100 p-2"></div>
