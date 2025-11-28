<script lang="ts">
	import HeroSection from '$lib/components/sections/HeroSection.svelte';
	import CollectionsSection from '$lib/components/sections/CollectionsSection.svelte';
	import ShowcaseSection from '$lib/components/sections/ShowcaseSection.svelte';
	import ExperienceSection from '$lib/components/sections/ExperienceSection.svelte';
	import TestimonialsSection from '$lib/components/sections/TestimonialsSection.svelte';
	import EditorialSection from '$lib/components/sections/EditorialSection.svelte';
	import TelegramCtaSection from '$lib/components/sections/TelegramCtaSection.svelte';
	import type { PageData } from './$types';

	// Получаем данные из БД через load функцию
	let { data }: { data: PageData } = $props();

	// Все данные теперь приходят из +page.server.ts (БД)
	const {
		heroContent,
		collectionsContent,
		showcaseContent,
		experienceContent,
		testimonialsContent,
		editorialContent,
		telegramCtaContent
	} = data;

</script>

<svelte:head>
	<title>Moditimewatch - Премиальные часы с доставкой</title>
	<meta
		name="description"
		content="Эксклюзивные часы премиум-класса от ведущих мировых брендов. Rolex, Patek Philippe, Omega. Гарантия подлинности, доставка по России и СНГ."
	/>

	<!-- SVG sprite для иконок -->
	<svg style="display: none;">
		<symbol id="icon-search" viewBox="0 0 24 24">
			<path
				d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
			/>
		</symbol>
		<symbol id="icon-heart" viewBox="0 0 24 24">
			<path
				d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
			/>
		</symbol>
		<symbol id="icon-cart" viewBox="0 0 24 24">
			<path
				d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
			/>
		</symbol>
	</svg>
</svelte:head>

<HeroSection content={heroContent} />

<CollectionsSection
	eyebrow={collectionsContent.eyebrow}
	title={collectionsContent.title}
	description={collectionsContent.description}
	collections={collectionsContent.collections}
/>

<ShowcaseSection
	eyebrow={showcaseContent.eyebrow}
	title={showcaseContent.title}
	products={showcaseContent.products}
	showAllButton={showcaseContent.showAllButton}
	showAllHref={showcaseContent.showAllHref}
	showAllText={showcaseContent.showAllText}
/>

<ExperienceSection
	eyebrow={experienceContent.eyebrow}
	title={experienceContent.title}
	description={experienceContent.description}
	stats={experienceContent.stats}
	services={experienceContent.services}
	ctaText={experienceContent.ctaText}
	ctaHref={experienceContent.ctaHref}
/>

<TestimonialsSection
	eyebrow={testimonialsContent.eyebrow}
	title={testimonialsContent.title}
	description={testimonialsContent.description}
	testimonials={testimonialsContent.testimonials}
/>

<EditorialSection
	eyebrow={editorialContent.eyebrow}
	title={editorialContent.title}
	articles={editorialContent.articles}
/>

<TelegramCtaSection
	eyebrow={telegramCtaContent.eyebrow}
	title={telegramCtaContent.title}
	description={telegramCtaContent.description}
	features={telegramCtaContent.features}
	ctaText={telegramCtaContent.ctaText}
	ctaHref={telegramCtaContent.ctaHref}
	channelUrl={telegramCtaContent.channelUrl}
/>
