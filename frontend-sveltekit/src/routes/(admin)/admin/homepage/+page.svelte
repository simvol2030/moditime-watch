<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Hero dynamic fields
	let heroStats = $state<{ value: string; label: string }[]>([...(data.heroStats || [])]);
	let heroQuickLinks = $state<{ text: string; href: string }[]>([...(data.heroQuickLinks || [])]);
	let brandsMode = $state<'auto' | 'manual'>(data.heroBrands?.length > 0 ? 'manual' : 'auto');
	let showBadge = $state(!!(data.hero?.image_badge_label || data.hero?.image_badge_title));
	let showSecondary = $state(!!(data.hero?.secondary_cta_text));

	const tabs = [
		{ key: 'hero', label: 'Hero', active: true },
		{ key: 'collections', label: 'Коллекции', active: true },
		{ key: 'showcase', label: 'Бестселлеры', active: true },
		{ key: 'services', label: 'Сервисы', active: false },
		{ key: 'testimonials', label: 'Отзывы', active: false },
		{ key: 'editorial', label: 'Журнал', active: false },
		{ key: 'telegram', label: 'Telegram', active: false }
	];

	function switchTab(key: string) {
		goto(`/admin/homepage?tab=${key}`, { replaceState: true, noScroll: true });
	}

	function addStat() {
		if (heroStats.length < 4) heroStats = [...heroStats, { value: '', label: '' }];
	}
	function removeStat(i: number) {
		heroStats = heroStats.filter((_, idx) => idx !== i);
	}
	function addQuickLink() {
		if (heroQuickLinks.length < 8) heroQuickLinks = [...heroQuickLinks, { text: '', href: '' }];
	}
	function removeQuickLink(i: number) {
		heroQuickLinks = heroQuickLinks.filter((_, idx) => idx !== i);
	}

	// Collections state
	let editingCollectionId = $state<number | null>((form as any)?.editingCollectionId || null);
	let showAddCollection = $state(false);
	let collectionProductSearch = $state('');

	// Showcase state
	let showcaseMode = $state<'auto' | 'manual'>(
		(() => {
			try {
				const extra = JSON.parse(data.sectionConfigs?.showcase?.extra_json || '{}');
				return extra.mode || 'auto';
			} catch { return 'auto'; }
		})()
	);
	let showcaseProductSearch = $state('');
</script>

<svelte:head>
	<title>Homepage Management - Moditime Admin</title>
</svelte:head>

<PageHeader title="Управление главной" description="Редактирование секций главной страницы" />

{#if form?.error}
	<div class="alert error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert success">Изменения сохранены</div>
{/if}

<!-- TAB BAR -->
<div class="tabs-bar">
	{#each tabs as tab}
		<button
			type="button"
			class="tab-btn"
			class:active={data.tab === tab.key}
			class:disabled={!tab.active}
			disabled={!tab.active}
			onclick={() => tab.active && switchTab(tab.key)}
		>
			{tab.label}
			{#if !tab.active}<span class="tab-soon">*</span>{/if}
		</button>
	{/each}
</div>

<!-- HERO TAB -->
{#if data.tab === 'hero' && data.hero}
	<form method="POST" action="?/saveHero" use:enhance>
		<input type="hidden" name="id" value={data.hero.id} />

		<!-- Тексты -->
		<div class="card">
			<h3>Тексты</h3>
			<div class="form-grid">
				<div class="form-group full">
					<label for="hero-tagline">Tagline <span class="hint">max 80</span></label>
					<input type="text" id="hero-tagline" name="tagline" value={data.hero.tagline} maxlength="80" />
				</div>
				<div class="form-group full">
					<label for="hero-title">Заголовок (H1) <span class="hint">max 150</span></label>
					<input type="text" id="hero-title" name="title" value={data.hero.title} maxlength="150" required />
				</div>
				<div class="form-group full">
					<label for="hero-desc">Описание <span class="hint">max 500</span></label>
					<textarea id="hero-desc" name="description" rows="3" maxlength="500">{data.hero.description}</textarea>
				</div>
			</div>
		</div>

		<!-- Кнопки CTA -->
		<div class="card">
			<h3>Кнопки CTA</h3>
			<div class="form-grid">
				<div class="form-group">
					<label for="hero-cta1-text">Primary: Текст <span class="hint">max 30</span></label>
					<input type="text" id="hero-cta1-text" name="primary_cta_text" value={data.hero.primary_cta_text} maxlength="30" />
				</div>
				<div class="form-group">
					<label for="hero-cta1-href">Primary: Ссылка</label>
					<input type="text" id="hero-cta1-href" name="primary_cta_href" value={data.hero.primary_cta_href} />
				</div>
				<div class="form-group">
					<label for="hero-cta2-text">Secondary: Текст <span class="hint">max 30</span></label>
					<input type="text" id="hero-cta2-text" name="secondary_cta_text" value={data.hero.secondary_cta_text} maxlength="30" />
				</div>
				<div class="form-group">
					<label for="hero-cta2-href">Secondary: Ссылка</label>
					<input type="text" id="hero-cta2-href" name="secondary_cta_href" value={data.hero.secondary_cta_href} />
				</div>
				<div class="form-group checkbox full">
					<label>
						<input type="checkbox" name="show_secondary" checked={showSecondary} onchange={(e) => showSecondary = (e.target as HTMLInputElement).checked} />
						Показывать secondary кнопку
					</label>
				</div>
			</div>
		</div>

		<!-- Изображение -->
		<div class="card">
			<h3>Изображение</h3>
			<div class="form-grid">
				<div class="form-group full">
					<label for="hero-img">Hero image URL <span class="hint">рек. 520x640, jpg/webp</span></label>
					<input type="text" id="hero-img" name="image_url" value={data.hero.image_url} />
				</div>
				{#if data.hero.image_url}
					<div class="form-group full">
						<img src={data.hero.image_url} alt="Preview" class="image-preview" />
					</div>
				{/if}
				<div class="form-group full">
					<label for="hero-img-alt">Alt текст <span class="hint">max 150</span></label>
					<input type="text" id="hero-img-alt" name="image_alt" value={data.hero.image_alt} maxlength="150" />
				</div>
				<div class="form-group checkbox full">
					<label>
						<input type="checkbox" name="show_badge" checked={showBadge} onchange={(e) => showBadge = (e.target as HTMLInputElement).checked} />
						Показывать badge
					</label>
				</div>
				{#if showBadge}
					<div class="form-group">
						<label for="hero-badge-label">Badge Label <span class="hint">max 40</span></label>
						<input type="text" id="hero-badge-label" name="image_badge_label" value={data.hero.image_badge_label} maxlength="40" />
					</div>
					<div class="form-group">
						<label for="hero-badge-title">Badge Title <span class="hint">max 80</span></label>
						<input type="text" id="hero-badge-title" name="image_badge_title" value={data.hero.image_badge_title} maxlength="80" />
					</div>
				{/if}
			</div>
		</div>

		<!-- Статистика -->
		<div class="card">
			<h3>Статистика <span class="hint">(макс. 4)</span></h3>
			<div class="dynamic-list">
				{#each heroStats as stat, i}
					<div class="dynamic-row">
						<div class="dynamic-field">
							<label>Значение <span class="hint">max 20</span></label>
							<input type="text" name="stat_value" bind:value={stat.value} maxlength="20" placeholder="172+" />
						</div>
						<div class="dynamic-field grow">
							<label>Label</label>
							<input type="text" name="stat_label" bind:value={stat.label} placeholder="моделей в каталоге" />
						</div>
						<button type="button" class="btn-remove" onclick={() => removeStat(i)} title="Удалить">-</button>
					</div>
				{/each}
			</div>
			{#if heroStats.length < 4}
				<button type="button" class="btn-add" onclick={addStat}>+ Добавить</button>
			{/if}
		</div>

		<!-- Quick Links -->
		<div class="card">
			<h3>Quick Links (чипы) <span class="hint">(макс. 8)</span></h3>
			<div class="dynamic-list">
				{#each heroQuickLinks as link, i}
					<div class="dynamic-row">
						<div class="dynamic-field">
							<label>Текст</label>
							<input type="text" name="ql_text" bind:value={link.text} placeholder="Rolex" />
						</div>
						<div class="dynamic-field grow">
							<label>Ссылка</label>
							<input type="text" name="ql_href" bind:value={link.href} placeholder="/catalog?brand=rolex" />
						</div>
						<button type="button" class="btn-remove" onclick={() => removeQuickLink(i)} title="Удалить">-</button>
					</div>
				{/each}
			</div>
			{#if heroQuickLinks.length < 8}
				<button type="button" class="btn-add" onclick={addQuickLink}>+ Добавить чип</button>
			{/if}
		</div>

		<!-- Бренды -->
		<div class="card">
			<h3>Бренды (строка внизу)</h3>
			<div class="brands-mode">
				<label class="radio-label">
					<input type="radio" name="brands_mode" value="auto" checked={brandsMode === 'auto'} onchange={() => brandsMode = 'auto'} />
					Автоматический (все активные бренды из БД)
				</label>
				<label class="radio-label">
					<input type="radio" name="brands_mode" value="manual" checked={brandsMode === 'manual'} onchange={() => brandsMode = 'manual'} />
					Ручной (выбрать конкретные бренды)
				</label>
			</div>
			{#if brandsMode === 'manual'}
				<div class="brands-checkboxes">
					{#each data.brands as brand}
						<label class="brand-checkbox">
							<input
								type="checkbox"
								name="selected_brands"
								value={brand.name}
								checked={data.heroBrands.includes(brand.name)}
							/>
							{brand.name}
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<div class="form-actions">
			<ActionButton type="submit" variant="primary">Сохранить</ActionButton>
		</div>
	</form>
{/if}

<!-- COLLECTIONS TAB -->
{#if data.tab === 'collections'}
	<!-- Section config -->
	{@const cfg = data.sectionConfigs?.collections || { eyebrow: '', title: '', description: '' }}
	<form method="POST" action="?/saveSectionConfig" use:enhance>
		<input type="hidden" name="section_key" value="collections" />
		<input type="hidden" name="tab" value="collections" />
		<input type="hidden" name="extra_json" value="{}" />
		<input type="hidden" name="is_active" value="1" />
		<div class="card">
			<h3>Тексты секции</h3>
			<div class="form-grid">
				<div class="form-group">
					<label for="coll-eyebrow">Eyebrow <span class="hint">max 40</span></label>
					<input type="text" id="coll-eyebrow" name="eyebrow" value={cfg.eyebrow} maxlength="40" />
				</div>
				<div class="form-group">
					<label for="coll-title">Заголовок <span class="hint">max 100</span></label>
					<input type="text" id="coll-title" name="title" value={cfg.title} maxlength="100" />
				</div>
				<div class="form-group full">
					<label for="coll-desc">Описание <span class="hint">max 300</span></label>
					<textarea id="coll-desc" name="description" rows="2" maxlength="300">{cfg.description}</textarea>
				</div>
			</div>
			<div class="form-actions-inline">
				<ActionButton type="submit" variant="primary" size="sm">Сохранить тексты</ActionButton>
			</div>
		</div>
	</form>

	<!-- Collections list -->
	<div class="card">
		<div class="card-header">
			<h3>Список коллекций ({data.collections.length})</h3>
			<ActionButton variant="secondary" size="sm" onclick={() => showAddCollection = !showAddCollection}>
				{showAddCollection ? 'Отмена' : '+ Добавить коллекцию'}
			</ActionButton>
		</div>

		<!-- Add new collection form -->
		{#if showAddCollection}
			<form method="POST" action="?/createCollection" use:enhance class="collection-edit-form">
				<div class="form-grid">
					<div class="form-group">
						<label>Slug</label>
						<input type="text" name="slug" required placeholder="my-collection" />
					</div>
					<div class="form-group">
						<label>Категория <span class="hint">max 50</span></label>
						<input type="text" name="category" placeholder="Для переговоров" maxlength="50" />
					</div>
					<div class="form-group full">
						<label>Название <span class="hint">max 100</span></label>
						<input type="text" name="title" required placeholder="Executive Collection" maxlength="100" />
					</div>
					<div class="form-group full">
						<label>Описание</label>
						<textarea name="description" rows="2" placeholder="Описание коллекции..."></textarea>
					</div>
					<div class="form-group full">
						<label>Изображение URL</label>
						<input type="text" name="image_url" placeholder="https://..." />
					</div>
					<div class="form-group">
						<label>Текст ссылки</label>
						<input type="text" name="link_text" value="Открыть подборку" maxlength="40" />
					</div>
					<div class="form-group">
						<label>URL ссылки</label>
						<input type="text" name="link_href" placeholder="/catalog?collection=..." />
					</div>
					<div class="form-group checkbox">
						<label><input type="checkbox" name="is_active" checked /> Активна</label>
					</div>
				</div>
				<div class="form-actions-inline">
					<ActionButton type="submit" variant="primary" size="sm">Создать</ActionButton>
				</div>
			</form>
		{/if}

		<!-- Collections rows -->
		<div class="items-list">
			{#each data.collections as collection, i}
				<div class="item-row">
					{#if editingCollectionId === collection.id}
						<!-- Inline edit form -->
						<form method="POST" action="?/updateCollection" use:enhance class="collection-edit-form">
							<input type="hidden" name="id" value={collection.id} />
							<input type="hidden" name="position" value={collection.position} />
							<div class="form-grid">
								<div class="form-group">
									<label>Slug</label>
									<input type="text" name="slug" value={collection.slug} required />
								</div>
								<div class="form-group">
									<label>Категория</label>
									<input type="text" name="category" value={collection.category} />
								</div>
								<div class="form-group full">
									<label>Название</label>
									<input type="text" name="title" value={collection.title} required />
								</div>
								<div class="form-group full">
									<label>Описание</label>
									<textarea name="description" rows="2">{collection.description}</textarea>
								</div>
								<div class="form-group full">
									<label>Изображение URL</label>
									<input type="text" name="image_url" value={collection.image_url} />
								</div>
								{#if collection.image_url}
									<div class="form-group full">
										<img src={collection.image_url} alt="Preview" class="image-preview-sm" />
									</div>
								{/if}
								<div class="form-group">
									<label>Текст ссылки</label>
									<input type="text" name="link_text" value={collection.link_text} />
								</div>
								<div class="form-group">
									<label>URL ссылки</label>
									<input type="text" name="link_href" value={collection.link_href} />
								</div>
								<div class="form-group checkbox">
									<label><input type="checkbox" name="is_active" checked={collection.is_active === 1} /> Активна</label>
								</div>
							</div>
							<div class="form-actions-inline">
								<ActionButton type="submit" variant="primary" size="sm">Сохранить</ActionButton>
								<ActionButton variant="ghost" size="sm" onclick={() => editingCollectionId = null}>Отмена</ActionButton>
							</div>
						</form>

						<!-- Products in collection -->
						<div class="collection-products">
							<h4>Товары в коллекции</h4>
							<form method="POST" action="?/addProductToCollection" use:enhance class="product-add-row">
								<input type="hidden" name="collection_id" value={collection.id} />
								<select name="product_id">
									<option value="">Выберите товар...</option>
									{#each data.brands as brand}
										{@const brandProducts = data.showcaseItems}
									{/each}
								</select>
								<ActionButton type="submit" variant="secondary" size="sm">Добавить</ActionButton>
							</form>
						</div>
					{:else}
						<!-- Display row -->
						<div class="item-content">
							<div class="item-info">
								{#if collection.image_url}
									<img src={collection.image_url} alt="" class="item-thumb" />
								{/if}
								<div>
									<strong>{collection.title}</strong>
									<span class="item-meta">{collection.category || ''}</span>
								</div>
							</div>
							<div class="item-actions">
								<span class="item-count">{collection.product_count || 0} тов.</span>
								<span class="status-badge" class:active={collection.is_active === 1}>
									{collection.is_active ? 'Active' : 'Off'}
								</span>
								<!-- Move buttons -->
								{#if i > 0}
									<form method="POST" action="?/moveCollection" use:enhance class="inline-form">
										<input type="hidden" name="id" value={collection.id} />
										<input type="hidden" name="direction" value="up" />
										<button type="submit" class="btn-arrow" title="Вверх">↑</button>
									</form>
								{/if}
								{#if i < data.collections.length - 1}
									<form method="POST" action="?/moveCollection" use:enhance class="inline-form">
										<input type="hidden" name="id" value={collection.id} />
										<input type="hidden" name="direction" value="down" />
										<button type="submit" class="btn-arrow" title="Вниз">↓</button>
									</form>
								{/if}
								<button type="button" class="btn-link" onclick={() => editingCollectionId = collection.id}>Ред.</button>
								<form method="POST" action="?/deleteCollection" use:enhance class="inline-form">
									<input type="hidden" name="id" value={collection.id} />
									<button type="submit" class="btn-link danger"
										onclick={(e) => { if (!confirm('Удалить коллекцию?')) e.preventDefault(); }}>Удал.</button>
								</form>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

<!-- SHOWCASE TAB (Task 5) -->
{#if data.tab === 'showcase'}
	<div class="card">
		<h3>Бестселлеры</h3>
		<p class="coming-soon-text">Вкладка реализуется в Task 5...</p>
	</div>
{/if}

<!-- DISABLED TABS -->
{#if data.tab === 'services' || data.tab === 'testimonials' || data.tab === 'editorial' || data.tab === 'telegram'}
	<div class="card coming-soon">
		<h3>Coming soon</h3>
		<p>Эта вкладка будет реализована в Session-19</p>
	</div>
{/if}

<style>
	.tabs-bar {
		display: flex;
		gap: 0;
		border-bottom: 2px solid #e5e7eb;
		margin-bottom: 1.5rem;
		overflow-x: auto;
	}

	.tab-btn {
		padding: 0.75rem 1.25rem;
		border: none;
		background: none;
		font-size: 0.875rem;
		font-weight: 500;
		color: #6b7280;
		cursor: pointer;
		border-bottom: 2px solid transparent;
		margin-bottom: -2px;
		white-space: nowrap;
		transition: all 0.2s;
	}

	.tab-btn:hover:not(.disabled) {
		color: #1f2937;
	}

	.tab-btn.active {
		color: #3b82f6;
		border-bottom-color: #3b82f6;
		font-weight: 600;
	}

	.tab-btn.disabled {
		color: #d1d5db;
		cursor: not-allowed;
	}

	.tab-soon {
		font-size: 0.625rem;
		vertical-align: super;
	}

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

	.hint {
		font-weight: 400;
		color: #9ca3af;
	}

	.form-group input[type="text"],
	.form-group input[type="number"],
	.form-group textarea,
	.form-group select {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.form-group textarea {
		resize: vertical;
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
		margin-top: 0.5rem;
		margin-bottom: 1.5rem;
		justify-content: flex-end;
	}

	.image-preview {
		max-width: 200px;
		max-height: 160px;
		border-radius: 8px;
		object-fit: cover;
		border: 1px solid #e5e7eb;
	}

	/* Dynamic lists (stats, quick links) */
	.dynamic-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.dynamic-row {
		display: flex;
		gap: 0.75rem;
		align-items: flex-end;
	}

	.dynamic-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 120px;
	}

	.dynamic-field.grow {
		flex: 1;
	}

	.dynamic-field label {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.dynamic-field input {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.btn-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 36px;
		border: 1px solid #fca5a5;
		border-radius: 6px;
		background: #fef2f2;
		color: #ef4444;
		font-size: 1.125rem;
		cursor: pointer;
		flex-shrink: 0;
	}

	.btn-remove:hover {
		background: #fee2e2;
	}

	.btn-add {
		padding: 0.5rem 1rem;
		border: 1px dashed #d1d5db;
		border-radius: 6px;
		background: none;
		color: #6b7280;
		font-size: 0.8125rem;
		cursor: pointer;
	}

	.btn-add:hover {
		border-color: #3b82f6;
		color: #3b82f6;
	}

	/* Brands */
	.brands-mode {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.radio-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #374151;
		cursor: pointer;
	}

	.brands-checkboxes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 8px;
	}

	.brand-checkbox {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.875rem;
		color: #374151;
		cursor: pointer;
	}

	/* Collections / Showcase shared styles */
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.card-header h3 {
		margin: 0;
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
		color: #1f2937;
	}

	.item-info div {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.item-meta {
		color: #6b7280;
		font-size: 0.8125rem;
	}

	.item-thumb {
		width: 48px;
		height: 36px;
		object-fit: cover;
		border-radius: 4px;
		border: 1px solid #e5e7eb;
	}

	.item-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-shrink: 0;
	}

	.item-count {
		font-size: 0.75rem;
		color: #9ca3af;
	}

	.status-badge {
		font-size: 0.6875rem;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		background: #fee2e2;
		color: #dc2626;
	}

	.status-badge.active {
		background: #dcfce7;
		color: #16a34a;
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

	.btn-arrow {
		background: none;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		padding: 0.125rem 0.375rem;
		cursor: pointer;
		font-size: 0.75rem;
		color: #6b7280;
	}

	.btn-arrow:hover {
		background: #f3f4f6;
		color: #1f2937;
	}

	.inline-form {
		display: inline;
	}

	.form-actions-inline {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.collection-edit-form {
		padding: 0.75rem 0;
		border-bottom: 1px solid #e5e7eb;
	}

	.image-preview-sm {
		max-width: 120px;
		max-height: 80px;
		border-radius: 6px;
		object-fit: cover;
		border: 1px solid #e5e7eb;
	}

	.collection-products {
		padding: 0.75rem 0;
	}

	.collection-products h4 {
		font-size: 0.875rem;
		color: #374151;
		margin: 0 0 0.5rem 0;
	}

	.product-add-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.product-add-row select {
		padding: 0.375rem 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.8125rem;
		flex: 1;
	}

	/* Coming soon */
	.coming-soon {
		background: #f9fafb;
		border: 1px dashed #d1d5db;
	}

	.coming-soon-text {
		color: #9ca3af;
		font-size: 0.875rem;
	}

	@media (max-width: 640px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.dynamic-row {
			flex-wrap: wrap;
		}

		.tabs-bar {
			gap: 0;
		}

		.tab-btn {
			padding: 0.5rem 0.75rem;
			font-size: 0.8125rem;
		}
	}
</style>
