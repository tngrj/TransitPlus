<script lang="ts">
	import RouteFinder from '$lib/components/routeFinder.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let { stationsWithLines, connections, faresWithBands } = data;
</script>

<div class="mt-4">
	<RouteFinder {stationsWithLines} {connections} />
</div>
