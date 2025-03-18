<script>
	import { Card } from 'flowbite-svelte';
</script>

<Card size="xl" class="text-black dark:text-white">
	<h1 class="mb-4 text-3xl font-bold">About This Project</h1>
	<p class="mb-6">
		This project aims to improve MRT trip planning by integrating various data sources and features
		to provide users with the best travel experience. The focus is on usability, real-time
		information, and optimal route planning.
	</p>

	<h2 class="mt-4 mb-2 text-2xl font-semibold">Goals</h2>
	<ul class="mb-6 list-inside list-disc">
		<li>Better trip planning with walking time between interchange and train arrival timings.</li>
		<li>Fare calculation for various user categories.</li>
		<li>Cross-device usability with a clean and responsive design.</li>
	</ul>

	<h2 class="mt-4 mb-2 text-2xl font-semibold">Data Sources</h2>
	<ul class="mb-6 list-inside list-disc">
		<li>
			<a
				href="https://sgwiki.com/wiki/List_of_Distance_between_Stations"
				class="text-blue-600 underline"
				target="_blank">MRT Station Distances</a
			>
		</li>
		<li>
			<a
				href="https://www.ptc.gov.sg/docs/default-source/fare-structure/fre-2024---fare-table-brochure.pdf"
				class="text-blue-600 underline"
				target="_blank">Fare Data PDF</a
			> (not implemented yet)
		</li>
		<li>
			<a
				href="https://www.reddit.com/r/singapore/comments/10wkygf/mrt_map_with_transfer_timing/"
				class="text-blue-600 underline"
				target="_blank">Transfer Timing</a
			>
		</li>
		<li>
			<a
				href="https://github.com/elliotwutingfeng/train_arrival"
				class="text-blue-600 underline"
				target="_blank">Train Arrival</a
			> (not implemented yet)
		</li>
		<li>
			<a
				href="https://www.sbstransit.com.sg/travel-time"
				class="text-blue-600 underline"
				target="_blank">Train Travel Time</a
			>
		</li>
	</ul>

	<h2 class="mt-4 mb-2 text-2xl font-semibold">Limitations</h2>
	<ul class="mb-6 list-inside list-disc">
		<li>Static fare and train station data requiring manual updates.</li>
	</ul>

	<h2 class="mt-4 mb-2 text-2xl font-semibold">Future Improvements</h2>
	<ul class="mb-6 list-inside list-disc">
		<li>Real-time train arrival times.</li>
		<li>
			Integrate fare calculation for student/adult/senior/concession scheme/disabilities/monthly
			pass.
		</li>
		<li>Integrate LTA API for crowd density and train delay.</li>
		<li>Integrate best door to be at when transferring.</li>
		<li>Integrate train frequency.</li>
		<li>PWA support.</li>
	</ul>
</Card>
