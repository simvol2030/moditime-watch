<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingServiceId = $state<number | null>(null);
	let showAddService = $state(false);
	let editingStatId = $state<number | null>(null);
	let showAddStat = $state(false);
</script>

<svelte:head>
	<title>Homepage Management - Moditime Admin</title>
</svelte:head>

<PageHeader title="Homepage Management" description="Edit hero section, services, stats, and telegram widget" />

{#if form?.error}
	<div class="alert error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert success">Changes saved successfully</div>
{/if}

<!-- HERO SECTION -->
{#if data.hero}
	<div class="card">
		<h3>Hero Section</h3>
		<form method="POST" action="?/updateHero" use:enhance>
			<input type="hidden" name="id" value={data.hero.id} />
			<div class="form-grid">
				<div class="form-group full">
					<label for="hero-tagline">Tagline</label>
					<input type="text" id="hero-tagline" name="tagline" value={data.hero.tagline} />
				</div>
				<div class="form-group full">
					<label for="hero-title">Title</label>
					<input type="text" id="hero-title" name="title" value={data.hero.title} required />
				</div>
				<div class="form-group full">
					<label for="hero-description">Description</label>
					<textarea id="hero-description" name="description" rows="3">{data.hero.description}</textarea>
				</div>
				<div class="form-group">
					<label for="hero-primary-text">Primary CTA Text</label>
					<input type="text" id="hero-primary-text" name="primary_cta_text" value={data.hero.primary_cta_text} />
				</div>
				<div class="form-group">
					<label for="hero-primary-href">Primary CTA URL</label>
					<input type="text" id="hero-primary-href" name="primary_cta_href" value={data.hero.primary_cta_href} />
				</div>
				<div class="form-group">
					<label for="hero-secondary-text">Secondary CTA Text</label>
					<input type="text" id="hero-secondary-text" name="secondary_cta_text" value={data.hero.secondary_cta_text} />
				</div>
				<div class="form-group">
					<label for="hero-secondary-href">Secondary CTA URL</label>
					<input type="text" id="hero-secondary-href" name="secondary_cta_href" value={data.hero.secondary_cta_href} />
				</div>
				<div class="form-group full">
					<label for="hero-image">Image URL</label>
					<input type="text" id="hero-image" name="image_url" value={data.hero.image_url} />
				</div>
				<div class="form-group">
					<label for="hero-image-alt">Image Alt</label>
					<input type="text" id="hero-image-alt" name="image_alt" value={data.hero.image_alt} />
				</div>
				<div class="form-group">
					<label for="hero-badge-label">Badge Label</label>
					<input type="text" id="hero-badge-label" name="image_badge_label" value={data.hero.image_badge_label} />
				</div>
				<div class="form-group">
					<label for="hero-badge-title">Badge Title</label>
					<input type="text" id="hero-badge-title" name="image_badge_title" value={data.hero.image_badge_title} />
				</div>
				<div class="form-group full">
					<label for="hero-stats">Stats JSON</label>
					<textarea id="hero-stats" name="stats_json" rows="3" class="mono">{data.hero.stats_json}</textarea>
				</div>
				<div class="form-group full">
					<label for="hero-quicklinks">Quick Links JSON</label>
					<textarea id="hero-quicklinks" name="quick_links_json" rows="3" class="mono">{data.hero.quick_links_json}</textarea>
				</div>
				<div class="form-group full">
					<label for="hero-brands">Brands JSON</label>
					<textarea id="hero-brands" name="brands_json" rows="2" class="mono">{data.hero.brands_json}</textarea>
				</div>
			</div>
			<div class="form-actions">
				<ActionButton type="submit" variant="primary">Save Hero</ActionButton>
			</div>
		</form>
	</div>
{/if}

<!-- SERVICES SECTION -->
<div class="card">
	<div class="card-header">
		<h3>Services</h3>
		<ActionButton variant="secondary" size="sm" onclick={() => showAddService = !showAddService}>
			{showAddService ? 'Cancel' : '+ Add Service'}
		</ActionButton>
	</div>

	{#if showAddService}
		<form method="POST" action="?/createService" use:enhance class="service-form">
			<div class="form-grid">
				<div class="form-group full">
					<label for="new-svc-title">Title</label>
					<input type="text" id="new-svc-title" name="title" required placeholder="Service title" />
				</div>
				<div class="form-group full">
					<label for="new-svc-desc">Description</label>
					<textarea id="new-svc-desc" name="description" rows="2"></textarea>
				</div>
				<div class="form-group full">
					<label for="new-svc-icon">Icon SVG</label>
					<textarea id="new-svc-icon" name="icon_svg" rows="2" class="mono"></textarea>
				</div>
				<div class="form-group">
					<label for="new-svc-link-text">Link Text</label>
					<input type="text" id="new-svc-link-text" name="link_text" />
				</div>
				<div class="form-group">
					<label for="new-svc-link-href">Link URL</label>
					<input type="text" id="new-svc-link-href" name="link_href" />
				</div>
				<div class="form-group">
					<label for="new-svc-pos">Position</label>
					<input type="number" id="new-svc-pos" name="position" value="0" />
				</div>
				<div class="form-group checkbox">
					<label><input type="checkbox" name="is_active" checked /> Active</label>
				</div>
			</div>
			<div class="form-actions">
				<ActionButton type="submit" variant="primary" size="sm">Add Service</ActionButton>
			</div>
		</form>
	{/if}

	<div class="items-list">
		{#each data.services as service}
			<div class="item-row">
				{#if editingServiceId === service.id}
					<form method="POST" action="?/updateService" use:enhance class="service-form">
						<input type="hidden" name="id" value={service.id} />
						<div class="form-grid">
							<div class="form-group full">
								<label for="svc-title-{service.id}">Title</label>
								<input type="text" id="svc-title-{service.id}" name="title" value={service.title} required />
							</div>
							<div class="form-group full">
								<label for="svc-desc-{service.id}">Description</label>
								<textarea id="svc-desc-{service.id}" name="description" rows="2">{service.description}</textarea>
							</div>
							<div class="form-group full">
								<label for="svc-icon-{service.id}">Icon SVG</label>
								<textarea id="svc-icon-{service.id}" name="icon_svg" rows="2" class="mono">{service.icon_svg}</textarea>
							</div>
							<div class="form-group">
								<label for="svc-lt-{service.id}">Link Text</label>
								<input type="text" id="svc-lt-{service.id}" name="link_text" value={service.link_text} />
							</div>
							<div class="form-group">
								<label for="svc-lh-{service.id}">Link URL</label>
								<input type="text" id="svc-lh-{service.id}" name="link_href" value={service.link_href} />
							</div>
							<div class="form-group">
								<label for="svc-pos-{service.id}">Position</label>
								<input type="number" id="svc-pos-{service.id}" name="position" value={service.position} />
							</div>
							<div class="form-group checkbox">
								<label><input type="checkbox" name="is_active" checked={service.is_active === 1} /> Active</label>
							</div>
						</div>
						<div class="form-actions">
							<ActionButton type="submit" variant="primary" size="sm">Save</ActionButton>
							<ActionButton variant="ghost" size="sm" onclick={() => editingServiceId = null}>Cancel</ActionButton>
						</div>
					</form>
				{:else}
					<div class="item-content">
						<div class="item-info">
							<strong>{service.title}</strong>
							<span class="item-meta">{service.description?.substring(0, 60)}...</span>
						</div>
						<div class="item-actions">
							<span class="status-badge" class:active={service.is_active === 1}>
								{service.is_active ? 'Active' : 'Inactive'}
							</span>
							<button type="button" class="btn-link" onclick={() => editingServiceId = service.id}>Edit</button>
							<form method="POST" action="?/deleteService" use:enhance class="inline-form">
								<input type="hidden" name="id" value={service.id} />
								<button type="submit" class="btn-link danger"
									onclick={(e) => { if (!confirm('Delete this service?')) e.preventDefault(); }}>Delete</button>
							</form>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<!-- SERVICE STATS -->
<div class="card">
	<div class="card-header">
		<h3>Service Stats</h3>
		<ActionButton variant="secondary" size="sm" onclick={() => showAddStat = !showAddStat}>
			{showAddStat ? 'Cancel' : '+ Add Stat'}
		</ActionButton>
	</div>

	{#if showAddStat}
		<form method="POST" action="?/createStat" use:enhance class="stat-form">
			<div class="form-row">
				<div class="form-group">
					<label for="new-stat-label">Label</label>
					<input type="text" id="new-stat-label" name="label" required placeholder="e.g. Гарантийный сервис" />
				</div>
				<div class="form-group">
					<label for="new-stat-value">Value</label>
					<input type="text" id="new-stat-value" name="value" required placeholder="e.g. 5 лет" />
				</div>
				<div class="form-group">
					<label for="new-stat-pos">Position</label>
					<input type="number" id="new-stat-pos" name="position" value="0" />
				</div>
				<div class="form-group">
					<ActionButton type="submit" variant="primary" size="sm">Add</ActionButton>
				</div>
			</div>
		</form>
	{/if}

	<div class="items-list">
		{#each data.stats as stat}
			<div class="item-row">
				{#if editingStatId === stat.id}
					<form method="POST" action="?/updateStat" use:enhance class="stat-edit-form">
						<input type="hidden" name="id" value={stat.id} />
						<input type="text" name="label" value={stat.label} class="input-sm" />
						<input type="text" name="value" value={stat.value} class="input-sm" />
						<input type="number" name="position" value={stat.position} class="input-xs" />
						<ActionButton type="submit" variant="primary" size="sm">Save</ActionButton>
						<ActionButton variant="ghost" size="sm" onclick={() => editingStatId = null}>Cancel</ActionButton>
					</form>
				{:else}
					<div class="item-content">
						<div class="item-info">
							<strong>{stat.value}</strong>
							<span class="item-meta">{stat.label}</span>
							<span class="item-position">#{stat.position}</span>
						</div>
						<div class="item-actions">
							<button type="button" class="btn-link" onclick={() => editingStatId = stat.id}>Edit</button>
							<form method="POST" action="?/deleteStat" use:enhance class="inline-form">
								<input type="hidden" name="id" value={stat.id} />
								<button type="submit" class="btn-link danger"
									onclick={(e) => { if (!confirm('Delete this stat?')) e.preventDefault(); }}>Delete</button>
							</form>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<!-- TELEGRAM WIDGET -->
{#if data.telegramWidget}
	<div class="card">
		<h3>Telegram Widget</h3>
		<form method="POST" action="?/updateTelegram" use:enhance>
			<input type="hidden" name="id" value={data.telegramWidget.id} />
			<div class="form-grid">
				<div class="form-group checkbox">
					<label><input type="checkbox" name="is_active" checked={data.telegramWidget.is_active === 1} /> Widget Active</label>
				</div>
				<div class="form-group full">
					<label for="tg-data">Data JSON</label>
					<textarea id="tg-data" name="data_json" rows="8" class="mono">{JSON.stringify(data.telegramWidget.data, null, 2)}</textarea>
				</div>
			</div>
			<div class="form-actions">
				<ActionButton type="submit" variant="primary">Save Telegram Widget</ActionButton>
			</div>
		</form>
	</div>
{/if}

<style>
	.card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
	}

	.card h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1rem 0;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.card-header h3 {
		margin: 0;
	}

	.alert {
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.alert.error {
		background: #fee2e2;
		border: 1px solid #ef4444;
		color: #dc2626;
	}

	.alert.success {
		background: #dcfce7;
		border: 1px solid #22c55e;
		color: #16a34a;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.form-group.full {
		grid-column: 1 / -1;
	}

	.form-group label {
		font-size: 0.75rem;
		font-weight: 500;
		color: #6b7280;
	}

	.form-group input[type="text"],
	.form-group input[type="number"],
	.form-group textarea {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.form-group textarea {
		resize: vertical;
	}

	.form-group textarea.mono {
		font-family: monospace;
		font-size: 0.8125rem;
	}

	.form-group.checkbox {
		flex-direction: row;
		align-items: center;
	}

	.form-group.checkbox label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
		justify-content: flex-end;
	}

	.form-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: flex-end;
		margin-bottom: 1rem;
	}

	.items-list {
		display: flex;
		flex-direction: column;
	}

	.item-row {
		padding: 0.75rem 0;
		border-bottom: 1px solid #f3f4f6;
	}

	.item-row:last-child {
		border-bottom: none;
	}

	.item-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.item-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.item-meta {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.item-position {
		color: #9ca3af;
		font-size: 0.75rem;
	}

	.item-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.status-badge {
		font-size: 0.75rem;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		background: #fee2e2;
		color: #dc2626;
	}

	.status-badge.active {
		background: #dcfce7;
		color: #16a34a;
	}

	.service-form,
	.stat-form {
		padding: 1rem 0;
		border-bottom: 1px solid #e5e7eb;
		margin-bottom: 0.5rem;
	}

	.stat-edit-form {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.btn-link {
		background: none;
		border: none;
		color: #3b82f6;
		font-size: 0.8125rem;
		cursor: pointer;
		padding: 0;
	}

	.btn-link:hover {
		text-decoration: underline;
	}

	.btn-link.danger {
		color: #ef4444;
	}

	.inline-form {
		display: inline;
	}

	.input-sm {
		padding: 0.375rem 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 0.875rem;
		width: 180px;
	}

	.input-xs {
		padding: 0.375rem 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 0.875rem;
		width: 60px;
	}
</style>
