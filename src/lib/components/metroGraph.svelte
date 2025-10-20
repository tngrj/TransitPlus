<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import maplibregl from 'maplibre-gl';
	import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
	import { getEnhancedGeoJson } from '$lib/data/index';
	import { getLineColour } from '$lib/utils/lineColours';
	import type { StationWithLines, ConnectionWithDetails } from '$lib/types/transit';

	let { stationsWithLines, connections, onStationClick } = $props();

	let mapContainer: HTMLDivElement;
	let map: MapLibreMap;
	let stationNameToIdMap = new Map<string, string>();

	function initializeMap() {
		try {
			map = new maplibregl.Map({
				container: mapContainer,
				style: {
					version: 8,
					glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
					sources: {},
					layers: []
				},
				center: [103.8198, 1.3521], // Singapore center
				zoom: 10,
				minZoom: 10,
				maxZoom: 16,
				attributionControl: false
			});

			map.on('load', () => {
				loadMRTData();
			});

			map.on('error', (e) => {
				console.error('MapLibre error:', e);
			});

			// Handle station clicks (will be added after layers are loaded)
			map.on('click', (e) => {
				const features = map.queryRenderedFeatures(e.point, { layers: ['stations-layer'] });
				if (features.length > 0 && onStationClick) {
					const internalId = features[0].properties?.internalId;
					if (internalId) {
						onStationClick(internalId);
					}
				}
			});

			// Change cursor on hover
			map.on('mouseenter', 'stations-layer', () => {
				map.getCanvas().style.cursor = 'pointer';
			});

			map.on('mouseleave', 'stations-layer', () => {
				map.getCanvas().style.cursor = '';
			});
		} catch (error) {
			console.error('Failed to initialize map:', error);
		}
	}

	function loadMRTData() {
		if (!map || !stationsWithLines) {
			console.warn('Map or data not available for loading MRT data');
			return;
		}

		try {
			// Create station name to ID mapping for our internal data
			stationNameToIdMap.clear();
			stationsWithLines.forEach((station: StationWithLines) => {
				stationNameToIdMap.set(station.name, station.id);
			});

			// Get the enhanced GeoJSON data with line information
			const geoJsonData = getEnhancedGeoJson();
			console.log('Enhanced GeoJSON data:', geoJsonData);

			// Process station features and add our internal IDs, colors, and proper names
			const processedFeatures = geoJsonData.features.map((feature): any => {
				if (feature.properties && feature.properties.name) {
					const geoJsonStationName = feature.properties.name;
					const internalId = stationNameToIdMap.get(geoJsonStationName);

					// Find the matching station from stationsWithLines to get the proper name
					const matchingStation = stationsWithLines.find(
						(s: StationWithLines) => s.name === geoJsonStationName
					);
					const displayName = matchingStation ? matchingStation.name : geoJsonStationName;

					const lineId = (feature.properties as any).lineId;

					// Get line color using the utility function
					let color = '#666666'; // default gray
					if (lineId) {
						const parsedLineId = typeof lineId === 'string' ? parseInt(lineId) : lineId;
						if (!isNaN(parsedLineId)) {
							color = getLineColour(parsedLineId);
						}
					}

					return {
						...feature,
						properties: {
							...feature.properties,
							internalId,
							color,
							displayName
						}
					};
				}
				return feature;
			});

			console.log(`Found ${processedFeatures.length} station features`);
			console.log(`Internal stations count: ${stationsWithLines.length}`);
			console.log('Station name mapping:', Array.from(stationNameToIdMap.keys()));
			console.log('Sample processed feature:', processedFeatures[0]);
			console.log(
				'Features with names:',
				processedFeatures.filter((f) => f.properties?.name).length
			);

			// Create line connections from the connections data
			const lineFeatures: any[] = [];
			if (connections) {
				connections.forEach((connection: ConnectionWithDetails) => {
					if (connection.isTransfer) return; // Skip transfer connections for line drawing

					// Find the GeoJSON features for both stations
					const fromFeature = processedFeatures.find(
						(f) => f.properties && (f.properties as any).internalId === connection.fromStationId
					);
					const toFeature = processedFeatures.find(
						(f) => f.properties && (f.properties as any).internalId === connection.toStationId
					);

					if (fromFeature && toFeature && fromFeature.geometry && toFeature.geometry) {
						const parsedLineId = parseInt(connection.lineId);
						const lineColor = getLineColour(isNaN(parsedLineId) ? null : parsedLineId);

						lineFeatures.push({
							type: 'Feature',
							geometry: {
								type: 'LineString',
								coordinates: [fromFeature.geometry.coordinates, toFeature.geometry.coordinates]
							},
							properties: {
								lineId: connection.lineId,
								color: lineColor,
								fromStation: connection.fromStationName,
								toStation: connection.toStationName
							}
						});
					}
				});
			}

			console.log(`Created ${lineFeatures.length} line segments`);

			// Add line source and layer first (so lines appear behind stations)
			if (lineFeatures.length > 0) {
				map.addSource('mrt-lines', {
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: lineFeatures
					}
				});

				map.addLayer({
					id: 'lines-layer',
					type: 'line',
					source: 'mrt-lines',
					layout: {
						'line-join': 'round',
						'line-cap': 'round'
					},
					paint: {
						'line-color': ['get', 'color'],
						'line-width': 3,
						'line-opacity': 0.8
					}
				});
			}

			// Add station source and layer
			map.addSource('mrt-stations', {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: processedFeatures as any[]
				}
			});

			// Station circles
			map.addLayer({
				id: 'stations-layer',
				type: 'circle',
				source: 'mrt-stations',
				paint: {
					'circle-radius': ['case', ['boolean', ['feature-state', 'highlighted'], false], 12, 8],
					'circle-color': ['get', 'color'],
					'circle-stroke-width': [
						'case',
						['boolean', ['feature-state', 'highlighted'], false],
						4,
						2
					],
					'circle-stroke-color': [
						'case',
						['boolean', ['feature-state', 'highlighted'], false],
						'#ffcc00',
						'white'
					],
					'circle-opacity': ['case', ['boolean', ['feature-state', 'dimmed'], false], 0.3, 1]
				}
			});

			// Station labels - improved visibility
			map.addLayer({
				id: 'stations-labels',
				type: 'symbol',
				source: 'mrt-stations',
				layout: {
					'text-field': ['get', 'displayName'],
					'text-size': ['interpolate', ['linear'], ['zoom'], 8, 10, 10, 12, 12, 14, 16, 16],
					'text-offset': [0, 1.5],
					'text-anchor': 'top',
					// 'text-allow-overlap': true,
					// 'text-ignore-placement': true,
					'text-optional': true
				},
				paint: {
					'text-color': '#000000',
					'text-halo-color': '#ffffff',
					'text-halo-width': 2,
					'text-halo-blur': 1
				}
			});

			console.log('MRT layers added successfully');
		} catch (error) {
			console.error('Error loading MRT data:', error);
		}
	}

	// Highlight a path on the map
	export function highlightPath(pathStations: string[]) {
		if (!map || !map.isStyleLoaded()) return;

		resetHighlight();

		if (pathStations.length === 0) return;

		// Get all station features from the source
		const stationSource = map.getSource('mrt-stations') as GeoJSONSource;
		if (!stationSource) return;

		// We need to use the feature IDs from the GeoJSON (which are the original IDs)
		// and match them with our internal station IDs
		const geoJsonData = getEnhancedGeoJson();
		if (!geoJsonData || !geoJsonData.features) return;

		// Dim all stations first
		geoJsonData.features.forEach((feature) => {
			if (feature.id) {
				map.setFeatureState(
					{ source: 'mrt-stations', id: feature.id },
					{ dimmed: true, highlighted: false }
				);
			}
		});

		// Highlight path stations by finding matching station names
		pathStations.forEach((stationId) => {
			const station = stationsWithLines.find((s: StationWithLines) => s.id === stationId);
			if (station) {
				// Find the corresponding GeoJSON feature by name
				const geoFeature = geoJsonData.features.find(
					(f) => f.properties && f.properties.name === station.name
				);
				if (geoFeature && geoFeature.id) {
					map.setFeatureState(
						{ source: 'mrt-stations', id: geoFeature.id },
						{ dimmed: false, highlighted: true }
					);
				}
			}
		});

		// Dim lines when highlighting path
		if (map.getLayer('lines-layer')) {
			map.setPaintProperty('lines-layer', 'line-opacity', 0.3);
		}
	}

	// Reset highlights
	export function resetHighlight() {
		if (!map || !map.isStyleLoaded()) return;

		// Reset all station states using GeoJSON feature IDs
		const geoJsonData = getEnhancedGeoJson();
		if (!geoJsonData || !geoJsonData.features) return;
		geoJsonData.features.forEach((feature) => {
			if (feature.id) {
				map.setFeatureState(
					{ source: 'mrt-stations', id: feature.id },
					{ dimmed: false, highlighted: false }
				);
			}
		});

		// Reset line opacity
		if (map.getLayer('lines-layer')) {
			map.setPaintProperty('lines-layer', 'line-opacity', 0.8);
		}
	}

	onMount(() => {
		initializeMap();
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div bind:this={mapContainer} class="h-full min-h-96 overflow-hidden rounded-lg bg-gray-100"></div>
