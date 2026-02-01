<script lang="ts">
	import { onMount } from 'svelte';
	import '../../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import CityHeader from '$lib/components/layout/CityHeader.svelte';
	import CityFooter from '$lib/components/layout/CityFooter.svelte';
	import { initializeTheme } from '$lib/stores/ui.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();

	onMount(() => {
		initializeTheme();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<CityHeader siteConfig={data.siteConfig} cityNavItems={data.cityNavItems} />

<main>
	{@render children?.()}
</main>

<CityFooter siteConfig={data.siteConfig} legalLinks={data.legalLinks} />
