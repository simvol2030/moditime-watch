<script lang="ts">
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// Don't show admin layout on login page
	const isLoginPage = $derived(!data.admin);
</script>

{#if isLoginPage}
	{@render children()}
{:else}
	<div class="admin-layout">
		<AdminSidebar />
		<div class="admin-main">
			<AdminHeader admin={data.admin} />
			<main class="admin-content">
				{@render children()}
			</main>
		</div>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Oxygen,
			Ubuntu,
			sans-serif;
	}

	.admin-layout {
		display: flex;
		min-height: 100vh;
		background: #f3f4f6;
	}

	.admin-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.admin-content {
		flex: 1;
		padding: 1.5rem;
		overflow-y: auto;
	}
</style>
