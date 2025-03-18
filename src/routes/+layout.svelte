<script lang="ts">
	import type { LayoutProps } from './$types';
	import { page } from '$app/state';
	import '../app.css';
	import { Navbar, NavBrand, NavUl, NavLi, Button, DarkMode } from 'flowbite-svelte';
	import { Sun, Moon } from '@lucide/svelte';

	let { children }: LayoutProps = $props();

	let activeUrl = $state(page.url.pathname);
	let activeClass =
		'text-white bg-green-700 md:bg-transparent md:text-green-700 md:dark:text-white dark:bg-green-600 md:dark:bg-transparent';
	let nonActiveClass =
		'text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent';
	$effect(() => {
		activeUrl = page.url.pathname;
	});
</script>

<Navbar let:toggle>
	<NavBrand href="/">
		<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
			>Transit+</span
		>
	</NavBrand>
	<div class="flex md:order-2">
		<DarkMode class="ml-3">
			<Sun class="h-4 w-4 dark:hidden" />
			<Moon class="hidden h-4 w-4 dark:block" />
		</DarkMode>
		<Button color="none" class="ml-3 md:hidden" on:click={toggle}>
			<svg stroke="currentColor" fill="none" viewBox="0 0 24 24" class="h-6 w-6">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				></path>
			</svg>
		</Button>
	</div>
	<NavUl {activeUrl} {activeClass} {nonActiveClass}>
		<NavLi href="/">Route Me</NavLi>
		<NavLi href="/map">Map</NavLi>
		<NavLi href="/about">About</NavLi>
		<NavLi href="/debug">Debug</NavLi>
	</NavUl>
</Navbar>

<main class="py-4">
	<div class="container mx-auto p-4">
		{@render children()}
	</div>
</main>
