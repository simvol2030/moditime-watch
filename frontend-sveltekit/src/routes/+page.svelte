<script lang="ts">
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import CollectionsSection from '$lib/components/sections/CollectionsSection.svelte';
	import ShowcaseSection from '$lib/components/sections/ShowcaseSection.svelte';
	import ExperienceSection from '$lib/components/sections/ExperienceSection.svelte';
	import TestimonialsSection from '$lib/components/sections/TestimonialsSection.svelte';
	import EditorialSection from '$lib/components/sections/EditorialSection.svelte';
	import TelegramCtaSection from '$lib/components/sections/TelegramCtaSection.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Moditimewatch - Премиальные часы с доставкой</title>
	<meta
		name="description"
		content="Эксклюзивные часы премиум-класса от ведущих мировых брендов. Rolex, Patek Philippe, Omega. Гарантия подлинности, доставка по России и СНГ."
	/>

	<!-- WebSite JSON-LD with SearchAction -->
	{@html '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Moditimewatch","url":"https://moditime-watch.ru","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://moditime-watch.ru/catalog?q={search_term_string}"},"query-input":"required name=search_term_string"}}<\/script>'}
</svelte:head>

<HeroSection content={data.heroContent} />

<CollectionsSection
	eyebrow={data.collectionsContent.eyebrow}
	title={data.collectionsContent.title}
	description={data.collectionsContent.description}
	collections={data.collectionsContent.collections}
/>

<ShowcaseSection
	eyebrow={data.showcaseContent.eyebrow}
	title={data.showcaseContent.title}
	products={data.showcaseContent.products}
	showAllButton={data.showcaseContent.showAllButton}
	showAllHref={data.showcaseContent.showAllHref}
	showAllText={data.showcaseContent.showAllText}
/>

<ExperienceSection
	eyebrow={data.experienceContent.eyebrow}
	title={data.experienceContent.title}
	description={data.experienceContent.description}
	stats={data.experienceContent.stats}
	services={data.experienceContent.services}
	ctaText={data.experienceContent.ctaText}
	ctaHref={data.experienceContent.ctaHref}
/>

<TestimonialsSection
	eyebrow={data.testimonialsContent.eyebrow}
	title={data.testimonialsContent.title}
	description={data.testimonialsContent.description}
	testimonials={data.testimonialsContent.testimonials}
/>

<EditorialSection
	eyebrow={data.editorialContent.eyebrow}
	title={data.editorialContent.title}
	articles={data.editorialContent.articles}
/>

{#if data.telegramGroupEnabled}
	<TelegramCtaSection
		eyebrow={data.telegramCtaContent.eyebrow}
		title={data.telegramCtaContent.title}
		description={data.telegramCtaContent.description}
		features={data.telegramCtaContent.features}
		ctaText={data.telegramCtaContent.ctaText}
		ctaHref={data.telegramCtaContent.ctaHref}
		channelUrl={data.telegramCtaContent.channelUrl}
	/>
{/if}
