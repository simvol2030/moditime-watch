<script lang="ts">
	import '../../../app.css';
	import type { LayoutData } from './$types';
	import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';
	import { page } from '$app/stores';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data }: { children: any; data: LayoutData } = $props();

	// Check if we're on the login page
	const isLoginPage = $derived($page.url.pathname === '/admin/login');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if isLoginPage}
	<!-- Login page: no sidebar -->
	{@render children?.()}
{:else}
	<!-- Admin pages: with sidebar -->
	<div class="admin-layout">
		<AdminSidebar admin={data.admin} />
		<main class="admin-main">
			<div class="admin-content">
				{@render children?.()}
			</div>
		</main>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.admin-layout {
		display: flex;
		min-height: 100vh;
		background: #f3f4f6;
	}

	.admin-main {
		flex: 1;
		margin-left: 260px;
		min-height: 100vh;
	}

	.admin-content {
		padding: 2rem;
		max-width: 1400px;
	}
</style>
