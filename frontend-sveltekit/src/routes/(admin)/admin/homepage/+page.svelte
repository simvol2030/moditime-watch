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
		{ key: 'services', label: 'Сервисы', active: true },
		{ key: 'testimonials', label: 'Отзывы', active: true },
		{ key: 'editorial', label: 'Журнал', active: true },
		{ key: 'telegram', label: 'Telegram', active: true }
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

	// Services state
	let editingServiceId = $state<number | null>(null);
	let showAddService = $state(false);
	let editingStatId = $state<number | null>(null);
	let showAddStat = $state(false);

	// Testimonials state
	let editingTestimonialId = $state<number | null>(null);
	let showAddTestimonial = $state(false);

	// Editorial state
	let editorialMode = $state<'auto' | 'manual'>(
		(() => {
			try {
				const extra = JSON.parse(data.sectionConfigs?.editorial?.extra_json || '{}');
				return extra.mode || 'auto';
			} catch { return 'auto'; }
		})()
	);

	// Telegram state
	let telegramFeatures = $state<string[]>(
		(() => {
			try {
				return data.telegramWidget?.data?.features || ['Эксклюзивные предложения', 'Подборки часов', 'Обзоры новинок'];
			} catch { return []; }
		})()
	);
	function addFeature() {
		if (telegramFeatures.length < 6) telegramFeatures = [...telegramFeatures, ''];
	}
	function removeFeature(i: number) {
		telegramFeatures = telegramFeatures.filter((_, idx) => idx !== i);
	}
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

<!-- SHOWCASE TAB -->
{#if data.tab === 'showcase'}
	{@const scfg = data.sectionConfigs?.showcase || { eyebrow: '', title: '', extra_json: '{}' }}
	{@const scExtra = (() => { try { return JSON.parse(scfg.extra_json || '{}'); } catch { return {}; } })()}

	<!-- Section config -->
	<form method="POST" action="?/saveShowcaseConfig" use:enhance>
		<input type="hidden" name="is_active" value="1" />
		<div class="card">
			<h3>Тексты секции</h3>
			<div class="form-grid">
				<div class="form-group">
					<label for="sc-eyebrow">Eyebrow <span class="hint">max 40</span></label>
					<input type="text" id="sc-eyebrow" name="eyebrow" value={scfg.eyebrow} maxlength="40" />
				</div>
				<div class="form-group">
					<label for="sc-title">Заголовок <span class="hint">max 100</span></label>
					<input type="text" id="sc-title" name="title" value={scfg.title} maxlength="100" />
				</div>
				<div class="form-group">
					<label for="sc-link-text">Текст ссылки</label>
					<input type="text" id="sc-link-text" name="link_text" value={scExtra.link_text || 'Вся витрина'} maxlength="40" />
				</div>
				<div class="form-group">
					<label for="sc-link-href">URL ссылки</label>
					<input type="text" id="sc-link-href" name="link_href" value={scExtra.link_href || '/catalog'} />
				</div>
			</div>
		</div>

		<!-- Mode selector -->
		<div class="card">
			<h3>Режим выбора товаров</h3>
			<div class="brands-mode">
				<label class="radio-label">
					<input type="radio" name="showcase_mode" value="auto" checked={showcaseMode === 'auto'} onchange={() => showcaseMode = 'auto'} />
					Автоматический (is_featured = 1, LIMIT 8)
				</label>
				<label class="radio-label">
					<input type="radio" name="showcase_mode" value="manual" checked={showcaseMode === 'manual'} onchange={() => showcaseMode = 'manual'} />
					Ручной (выбрать конкретные товары)
				</label>
			</div>
			<div class="form-actions-inline">
				<ActionButton type="submit" variant="primary" size="sm">Сохранить настройки</ActionButton>
			</div>
		</div>
	</form>

	<!-- Manual products list -->
	{#if showcaseMode === 'manual'}
		<div class="card">
			<div class="card-header">
				<h3>Товары в витрине ({data.showcaseItems.length} / 12)</h3>
			</div>

			<!-- Add product -->
			<form method="POST" action="?/addShowcaseItem" use:enhance class="product-add-row">
				<select name="product_id">
					<option value="">Выберите товар...</option>
					{#each data.brands as brand}
						{@const brandName = brand.name}
						<option disabled>--- {brandName} ---</option>
					{/each}
				</select>
				<ActionButton type="submit" variant="secondary" size="sm">Добавить</ActionButton>
			</form>

			<!-- Showcase items list -->
			<div class="items-list">
				{#each data.showcaseItems as item, i}
					<div class="item-row">
						<div class="item-content">
							<div class="item-info">
								<div>
									<strong>{item.brand_name} {item.name}</strong>
									<span class="item-meta">{item.sku || ''}</span>
								</div>
							</div>
							<div class="item-actions">
								<span class="item-count">{item.price ? `${Math.round(item.price / 100).toLocaleString('ru-RU')} ₽` : ''}</span>
								{#if i > 0}
									<form method="POST" action="?/moveShowcaseItem" use:enhance class="inline-form">
										<input type="hidden" name="id" value={item.id} />
										<input type="hidden" name="direction" value="up" />
										<button type="submit" class="btn-arrow" title="Вверх">↑</button>
									</form>
								{/if}
								{#if i < data.showcaseItems.length - 1}
									<form method="POST" action="?/moveShowcaseItem" use:enhance class="inline-form">
										<input type="hidden" name="id" value={item.id} />
										<input type="hidden" name="direction" value="down" />
										<button type="submit" class="btn-arrow" title="Вниз">↓</button>
									</form>
								{/if}
								<form method="POST" action="?/removeShowcaseItem" use:enhance class="inline-form">
									<input type="hidden" name="id" value={item.id} />
									<button type="submit" class="btn-link danger"
										onclick={(e) => { if (!confirm('Убрать товар?')) e.preventDefault(); }}>Убрать</button>
								</form>
							</div>
						</div>
					</div>
				{/each}
			</div>

			{#if data.showcaseItems.length === 0}
				<p class="coming-soon-text">Товары не добавлены. Добавьте товары вручную или переключитесь на автоматический режим.</p>
			{/if}
		</div>
	{:else}
		<div class="card">
			<p class="auto-mode-info">В автоматическом режиме отображаются товары с флагом <strong>is_featured = 1</strong> (первые 8). Управляйте этим флагом на странице товара.</p>
		</div>
	{/if}
{/if}

<!-- SERVICES TAB (Experience) -->
{#if data.tab === 'services'}
	{@const expCfg = data.sectionConfigs?.experience || { eyebrow: '', title: '', description: '', extra_json: '{}' }}
	{@const expExtra = (() => { try { return JSON.parse(expCfg.extra_json || '{}'); } catch { return {}; } })()}

	<!-- Section config + CTA -->
	<form method="POST" action="?/saveExperienceConfig" use:enhance>
		<input type="hidden" name="is_active" value="1" />
		<div class="card">
			<h3>Тексты секции</h3>
			<div class="form-grid">
				<div class="form-group">
					<label for="exp-eyebrow">Eyebrow <span class="hint">max 40</span></label>
					<input type="text" id="exp-eyebrow" name="eyebrow" value={expCfg.eyebrow} maxlength="40" />
				</div>
				<div class="form-group">
					<label for="exp-title">Заголовок <span class="hint">max 100</span></label>
					<input type="text" id="exp-title" name="title" value={expCfg.title} maxlength="100" />
				</div>
				<div class="form-group full">
					<label for="exp-desc">Описание <span class="hint">max 500</span></label>
					<textarea id="exp-desc" name="description" rows="2" maxlength="500">{expCfg.description}</textarea>
				</div>
				<div class="form-group">
					<label for="exp-cta-text">CTA текст <span class="hint">max 40</span></label>
					<input type="text" id="exp-cta-text" name="cta_text" value={expExtra.cta_text || 'Запланировать консультацию'} maxlength="40" />
				</div>
				<div class="form-group">
					<label for="exp-cta-href">CTA ссылка</label>
					<input type="text" id="exp-cta-href" name="cta_href" value={expExtra.cta_href || '/contacts'} />
				</div>
			</div>
			<div class="form-actions-inline">
				<ActionButton type="submit" variant="primary" size="sm">Сохранить тексты</ActionButton>
			</div>
		</div>
	</form>

	<!-- Stats CRUD -->
	<div class="card">
		<div class="card-header">
			<h3>Статистика ({data.stats.length})</h3>
			<ActionButton variant="secondary" size="sm" onclick={() => showAddStat = !showAddStat}>
				{showAddStat ? 'Отмена' : '+ Добавить'}
			</ActionButton>
		</div>

		{#if showAddStat}
			<form method="POST" action="?/createStat" use:enhance class="collection-edit-form">
				<div class="form-grid">
					<div class="form-group">
						<label>Значение <span class="hint">max 20</span></label>
						<input type="text" name="value" required placeholder="72 часа" maxlength="20" />
					</div>
					<div class="form-group">
						<label>Label</label>
						<input type="text" name="label" required placeholder="Поиск лимитированных серий" />
					</div>
					<input type="hidden" name="position" value={data.stats.length} />
				</div>
				<div class="form-actions-inline">
					<ActionButton type="submit" variant="primary" size="sm">Создать</ActionButton>
				</div>
			</form>
		{/if}

		<div class="items-list">
			{#each data.stats as stat, i}
				<div class="item-row">
					{#if editingStatId === stat.id}
						<form method="POST" action="?/updateStat" use:enhance class="collection-edit-form">
							<input type="hidden" name="id" value={stat.id} />
							<input type="hidden" name="position" value={stat.position} />
							<div class="form-grid">
								<div class="form-group">
									<label>Значение</label>
									<input type="text" name="value" value={stat.value} required />
								</div>
								<div class="form-group">
									<label>Label</label>
									<input type="text" name="label" value={stat.label} required />
								</div>
							</div>
							<div class="form-actions-inline">
								<ActionButton type="submit" variant="primary" size="sm">Сохранить</ActionButton>
								<ActionButton variant="ghost" size="sm" onclick={() => editingStatId = null}>Отмена</ActionButton>
							</div>
						</form>
					{:else}
						<div class="item-content">
							<div class="item-info">
								<div>
									<strong>{stat.value}</strong>
									<span class="item-meta">{stat.label}</span>
								</div>
							</div>
							<div class="item-actions">
								{#if i > 0}
									<form method="POST" action="?/moveStat" use:enhance class="inline-form">
										<input type="hidden" name="id" value={stat.id} />
										<input type="hidden" name="direction" value="up" />
										<button type="submit" class="btn-arrow" title="Вверх">↑</button>
									</form>
								{/if}
								{#if i < data.stats.length - 1}
									<form method="POST" action="?/moveStat" use:enhance class="inline-form">
										<input type="hidden" name="id" value={stat.id} />
										<input type="hidden" name="direction" value="down" />
										<button type="submit" class="btn-arrow" title="Вниз">↓</button>
									</form>
								{/if}
								<button type="button" class="btn-link" onclick={() => editingStatId = stat.id}>Ред.</button>
								<form method="POST" action="?/deleteStat" use:enhance class="inline-form">
									<input type="hidden" name="id" value={stat.id} />
									<button type="submit" class="btn-link danger"
										onclick={(e) => { if (!confirm('Удалить?')) e.preventDefault(); }}>Удал.</button>
								</form>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Services CRUD -->
	<div class="card">
		<div class="card-header">
			<h3>Карточки сервисов ({data.services.length})</h3>
			<ActionButton variant="secondary" size="sm" onclick={() => showAddService = !showAddService}>
				{showAddService ? 'Отмена' : '+ Добавить сервис'}
			</ActionButton>
		</div>

		{#if showAddService}
			<form method="POST" action="?/createService" use:enhance class="collection-edit-form">
				<div class="form-grid">
					<div class="form-group full">
						<label>Иконка SVG</label>
						<textarea name="icon_svg" rows="2" placeholder='<svg width="28" height="28">...</svg>'></textarea>
					</div>
					<div class="form-group full">
						<label>Название <span class="hint">max 60</span></label>
						<input type="text" name="title" required placeholder="Консьерж-подбор" maxlength="60" />
					</div>
					<div class="form-group full">
						<label>Описание <span class="hint">max 300</span></label>
						<textarea name="description" rows="2" maxlength="300" placeholder="Описание сервиса..."></textarea>
					</div>
					<div class="form-group">
						<label>Текст ссылки <span class="hint">max 40</span></label>
						<input type="text" name="link_text" placeholder="Узнать детали" maxlength="40" />
					</div>
					<div class="form-group">
						<label>URL ссылки</label>
						<input type="text" name="link_href" placeholder="/contacts" />
					</div>
					<input type="hidden" name="position" value={data.services.length} />
					<input type="hidden" name="is_active" value="1" />
				</div>
				<div class="form-actions-inline">
					<ActionButton type="submit" variant="primary" size="sm">Создать</ActionButton>
				</div>
			</form>
		{/if}

		<div class="items-list">
			{#each data.services as service, i}
				<div class="item-row">
					{#if editingServiceId === service.id}
						<form method="POST" action="?/updateService" use:enhance class="collection-edit-form">
							<input type="hidden" name="id" value={service.id} />
							<input type="hidden" name="position" value={service.position} />
							<div class="form-grid">
								<div class="form-group full">
									<label>Иконка SVG</label>
									<textarea name="icon_svg" rows="2">{service.icon_svg}</textarea>
								</div>
								<div class="form-group full">
									<label>Название</label>
									<input type="text" name="title" value={service.title} required />
								</div>
								<div class="form-group full">
									<label>Описание</label>
									<textarea name="description" rows="2">{service.description}</textarea>
								</div>
								<div class="form-group">
									<label>Текст ссылки</label>
									<input type="text" name="link_text" value={service.link_text} />
								</div>
								<div class="form-group">
									<label>URL ссылки</label>
									<input type="text" name="link_href" value={service.link_href} />
								</div>
								<div class="form-group checkbox">
									<label><input type="checkbox" name="is_active" checked={service.is_active === 1} /> Активен</label>
								</div>
							</div>
							<div class="form-actions-inline">
								<ActionButton type="submit" variant="primary" size="sm">Сохранить</ActionButton>
								<ActionButton variant="ghost" size="sm" onclick={() => editingServiceId = null}>Отмена</ActionButton>
							</div>
						</form>
					{:else}
						<div class="item-content">
							<div class="item-info">
								{#if service.icon_svg}
									<div class="svg-thumb">{@html service.icon_svg}</div>
								{/if}
								<div>
									<strong>{service.title}</strong>
									<span class="item-meta">{service.link_text || ''} → {service.link_href || ''}</span>
								</div>
							</div>
							<div class="item-actions">
								<span class="status-badge" class:active={service.is_active === 1}>
									{service.is_active ? 'Active' : 'Off'}
								</span>
								{#if i > 0}
									<form method="POST" action="?/moveService" use:enhance class="inline-form">
										<input type="hidden" name="id" value={service.id} />
										<input type="hidden" name="direction" value="up" />
										<button type="submit" class="btn-arrow" title="Вверх">↑</button>
									</form>
								{/if}
								{#if i < data.services.length - 1}
									<form method="POST" action="?/moveService" use:enhance class="inline-form">
										<input type="hidden" name="id" value={service.id} />
										<input type="hidden" name="direction" value="down" />
										<button type="submit" class="btn-arrow" title="Вниз">↓</button>
									</form>
								{/if}
								<button type="button" class="btn-link" onclick={() => editingServiceId = service.id}>Ред.</button>
								<form method="POST" action="?/deleteService" use:enhance class="inline-form">
									<input type="hidden" name="id" value={service.id} />
									<button type="submit" class="btn-link danger"
										onclick={(e) => { if (!confirm('Удалить сервис?')) e.preventDefault(); }}>Удал.</button>
								</form>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

<!-- TESTIMONIALS TAB -->
{#if data.tab === 'testimonials'}
	{@const testCfg = data.sectionConfigs?.testimonials || { eyebrow: '', title: '', description: '' }}

	<!-- Section config -->
	<form method="POST" action="?/saveTestimonialsConfig" use:enhance>
		<input type="hidden" name="is_active" value="1" />
		<div class="card">
			<h3>Тексты секции</h3>
			<div class="form-grid">
				<div class="form-group">
					<label for="test-eyebrow">Eyebrow <span class="hint">max 40</span></label>
					<input type="text" id="test-eyebrow" name="eyebrow" value={testCfg.eyebrow} maxlength="40" />
				</div>
				<div class="form-group">
					<label for="test-title">Заголовок <span class="hint">max 100</span></label>
					<input type="text" id="test-title" name="title" value={testCfg.title} maxlength="100" />
				</div>
				<div class="form-group full">
					<label for="test-desc">Описание <span class="hint">max 300</span></label>
					<textarea id="test-desc" name="description" rows="2" maxlength="300">{testCfg.description}</textarea>
				</div>
			</div>
			<div class="form-actions-inline">
				<ActionButton type="submit" variant="primary" size="sm">Сохранить тексты</ActionButton>
			</div>
		</div>
	</form>

	<!-- Testimonials list -->
	<div class="card">
		<div class="card-header">
			<h3>Список отзывов ({data.testimonials.length})</h3>
			<ActionButton variant="secondary" size="sm" onclick={() => { showAddTestimonial = !showAddTestimonial; editingTestimonialId = null; }}>
				{showAddTestimonial ? 'Отмена' : '+ Добавить отзыв'}
			</ActionButton>
		</div>

		<!-- Add new testimonial form -->
		{#if showAddTestimonial}
			<form method="POST" action="?/createTestimonialAdmin" use:enhance class="collection-edit-form">
				<div class="form-grid">
					<div class="form-group full">
						<label>Аватар URL <span class="hint">рек. 128x128, jpg/webp</span></label>
						<input type="text" name="avatar_url" placeholder="https://..." />
					</div>
					<div class="form-group">
						<label>Имя <span class="hint">max 60</span></label>
						<input type="text" name="name" required maxlength="60" placeholder="Имя Фамилия" />
					</div>
					<div class="form-group">
						<label>Должность <span class="hint">max 100</span></label>
						<input type="text" name="position_text" maxlength="100" placeholder="Партнёр фонда" />
					</div>
					<div class="form-group full">
						<label>Текст отзыва <span class="hint">max 1000</span></label>
						<textarea name="text" rows="3" required maxlength="1000" placeholder="Текст отзыва..."></textarea>
					</div>
					<div class="form-group">
						<label>Выбор часов <span class="hint">max 100</span></label>
						<input type="text" name="choice" maxlength="100" placeholder="Patek Philippe Nautilus 5811" />
					</div>
					<div class="form-group checkbox">
						<label><input type="checkbox" name="is_active" checked /> Активен</label>
					</div>
				</div>
				<div class="form-actions-inline">
					<ActionButton type="submit" variant="primary" size="sm">Создать</ActionButton>
				</div>
			</form>
		{/if}

		<!-- Testimonials rows -->
		<div class="items-list">
			{#each data.testimonials as testimonial, i}
				<div class="item-row">
					{#if editingTestimonialId === testimonial.id}
						<form method="POST" action="?/updateTestimonialAdmin" use:enhance class="collection-edit-form">
							<input type="hidden" name="id" value={testimonial.id} />
							<input type="hidden" name="display_order" value={testimonial.display_order} />
							<div class="form-grid">
								<div class="form-group full">
									<label>Аватар URL</label>
									<input type="text" name="avatar_url" value={testimonial.avatar_url} />
								</div>
								{#if testimonial.avatar_url}
									<div class="form-group full">
										<img src={testimonial.avatar_url} alt="Avatar" class="avatar-preview" />
									</div>
								{/if}
								<div class="form-group">
									<label>Имя</label>
									<input type="text" name="name" value={testimonial.name} required />
								</div>
								<div class="form-group">
									<label>Должность</label>
									<input type="text" name="position_text" value={testimonial.position} />
								</div>
								<div class="form-group full">
									<label>Текст отзыва</label>
									<textarea name="text" rows="3" required>{testimonial.text}</textarea>
								</div>
								<div class="form-group">
									<label>Выбор часов</label>
									<input type="text" name="choice" value={testimonial.choice} />
								</div>
								<div class="form-group checkbox">
									<label><input type="checkbox" name="is_active" checked={testimonial.is_active === 1} /> Активен</label>
								</div>
							</div>
							<div class="form-actions-inline">
								<ActionButton type="submit" variant="primary" size="sm">Сохранить</ActionButton>
								<ActionButton variant="ghost" size="sm" onclick={() => editingTestimonialId = null}>Отмена</ActionButton>
							</div>
						</form>
					{:else}
						<div class="item-content">
							<div class="item-info">
								{#if testimonial.avatar_url}
									<img src={testimonial.avatar_url} alt="" class="avatar-thumb" />
								{/if}
								<div>
									<strong>{testimonial.name}</strong>
									<span class="item-meta">{testimonial.position || ''}</span>
								</div>
							</div>
							<div class="item-actions">
								<span class="status-badge" class:active={testimonial.is_active === 1}>
									{testimonial.is_active ? 'Active' : 'Off'}
								</span>
								{#if i > 0}
									<form method="POST" action="?/moveTestimonial" use:enhance class="inline-form">
										<input type="hidden" name="id" value={testimonial.id} />
										<input type="hidden" name="direction" value="up" />
										<button type="submit" class="btn-arrow" title="Вверх">↑</button>
									</form>
								{/if}
								{#if i < data.testimonials.length - 1}
									<form method="POST" action="?/moveTestimonial" use:enhance class="inline-form">
										<input type="hidden" name="id" value={testimonial.id} />
										<input type="hidden" name="direction" value="down" />
										<button type="submit" class="btn-arrow" title="Вниз">↓</button>
									</form>
								{/if}
								<button type="button" class="btn-link" onclick={() => { editingTestimonialId = testimonial.id; showAddTestimonial = false; }}>Ред.</button>
								<form method="POST" action="?/deleteTestimonialAdmin" use:enhance class="inline-form">
									<input type="hidden" name="id" value={testimonial.id} />
									<button type="submit" class="btn-link danger"
										onclick={(e) => { if (!confirm('Удалить отзыв?')) e.preventDefault(); }}>Удал.</button>
								</form>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

<!-- EDITORIAL (JOURNAL) TAB -->
{#if data.tab === 'editorial'}
	{@const edCfg = data.sectionConfigs?.editorial || { eyebrow: '', title: '', extra_json: '{}' }}

	<!-- Section config + mode -->
	<form method="POST" action="?/saveEditorialConfig" use:enhance>
		<input type="hidden" name="is_active" value="1" />
		<div class="card">
			<h3>Тексты секции</h3>
			<div class="form-grid">
				<div class="form-group">
					<label for="ed-eyebrow">Eyebrow <span class="hint">max 40</span></label>
					<input type="text" id="ed-eyebrow" name="eyebrow" value={edCfg.eyebrow} maxlength="40" />
				</div>
				<div class="form-group">
					<label for="ed-title">Заголовок <span class="hint">max 100</span></label>
					<input type="text" id="ed-title" name="title" value={edCfg.title} maxlength="100" />
				</div>
			</div>
		</div>

		<!-- Mode selector -->
		<div class="card">
			<h3>Режим выбора статей</h3>
			<div class="brands-mode">
				<label class="radio-label">
					<input type="radio" name="editorial_mode" value="auto" checked={editorialMode === 'auto'} onchange={() => editorialMode = 'auto'} />
					Автоматический (is_featured = 1, последние 6)
				</label>
				<label class="radio-label">
					<input type="radio" name="editorial_mode" value="manual" checked={editorialMode === 'manual'} onchange={() => editorialMode = 'manual'} />
					Ручной (выбрать конкретные статьи)
				</label>
			</div>
			<div class="form-actions-inline">
				<ActionButton type="submit" variant="primary" size="sm">Сохранить настройки</ActionButton>
			</div>
		</div>
	</form>

	<!-- Manual articles list -->
	{#if editorialMode === 'manual'}
		<div class="card">
			<div class="card-header">
				<h3>Статьи в журнале ({data.editorialItems.length} / 8)</h3>
			</div>

			<!-- Search and add article -->
			{#if data.editorialItems.length < 8}
				<form method="POST" action="?/searchArticles" use:enhance class="product-add-row">
					<input type="text" name="query" placeholder="Поиск статьи..." class="search-input" />
					<ActionButton type="submit" variant="secondary" size="sm">Найти</ActionButton>
				</form>
			{/if}

			<!-- Search results -->
			{#if (form as any)?.articleSearchResults?.length > 0}
				<div class="search-results">
					{#each (form as any).articleSearchResults as article}
						<form method="POST" action="?/addEditorialItem" use:enhance class="search-result-row">
							<input type="hidden" name="article_id" value={article.id} />
							<div class="search-result-info">
								<strong>{article.title}</strong>
								<span class="item-meta">{article.category_name || 'Без категории'}</span>
							</div>
							<ActionButton type="submit" variant="secondary" size="sm">Добавить</ActionButton>
						</form>
					{/each}
				</div>
			{/if}

			<!-- Editorial items list -->
			<div class="items-list">
				{#each data.editorialItems as item, i}
					<div class="item-row">
						<div class="item-content">
							<div class="item-info">
								{#if item.image_url}
									<img src={item.image_url} alt="" class="item-thumb" />
								{/if}
								<div>
									<strong>{item.title}</strong>
									<span class="item-meta">{item.category_name || 'Без категории'}</span>
								</div>
							</div>
							<div class="item-actions">
								{#if i > 0}
									<form method="POST" action="?/moveEditorialItem" use:enhance class="inline-form">
										<input type="hidden" name="id" value={item.id} />
										<input type="hidden" name="direction" value="up" />
										<button type="submit" class="btn-arrow" title="Вверх">↑</button>
									</form>
								{/if}
								{#if i < data.editorialItems.length - 1}
									<form method="POST" action="?/moveEditorialItem" use:enhance class="inline-form">
										<input type="hidden" name="id" value={item.id} />
										<input type="hidden" name="direction" value="down" />
										<button type="submit" class="btn-arrow" title="Вниз">↓</button>
									</form>
								{/if}
								<form method="POST" action="?/removeEditorialItem" use:enhance class="inline-form">
									<input type="hidden" name="id" value={item.id} />
									<button type="submit" class="btn-link danger"
										onclick={(e) => { if (!confirm('Убрать статью?')) e.preventDefault(); }}>Убрать</button>
								</form>
							</div>
						</div>
					</div>
				{/each}
			</div>

			{#if data.editorialItems.length === 0}
				<p class="coming-soon-text">Статьи не добавлены. Используйте поиск чтобы добавить статьи или переключитесь на автоматический режим.</p>
			{/if}

			<p class="editorial-note">Статьи создаются и редактируются в разделе «Статьи»</p>
		</div>
	{:else}
		<div class="card">
			<p class="auto-mode-info">В автоматическом режиме отображаются статьи с флагом <strong>is_featured = 1</strong> (последние 6). Управляйте этим флагом на странице статьи.</p>
		</div>
	{/if}
{/if}

<!-- TELEGRAM TAB -->
{#if data.tab === 'telegram'}
	{@const tgCfg = data.sectionConfigs?.telegram || { eyebrow: '', title: '', description: '' }}
	{@const tgWidget = data.telegramWidget?.data || {}}

	<form method="POST" action="?/saveTelegramConfig" use:enhance>
		<!-- Toggle -->
		<div class="card">
			<div class="form-group checkbox">
				<label>
					<input type="checkbox" name="telegram_enabled" checked={data.telegramEnabled} />
					Показывать секцию Telegram на главной
				</label>
			</div>
		</div>

		<!-- Content -->
		<div class="card">
			<h3>Контент</h3>
			<div class="form-grid">
				<div class="form-group">
					<label for="tg-eyebrow">Eyebrow <span class="hint">max 40</span></label>
					<input type="text" id="tg-eyebrow" name="eyebrow" value={tgCfg.eyebrow} maxlength="40" />
				</div>
				<div class="form-group">
					<label for="tg-title">Заголовок <span class="hint">max 100</span></label>
					<input type="text" id="tg-title" name="title" value={tgCfg.title} maxlength="100" />
				</div>
				<div class="form-group full">
					<label for="tg-desc">Описание <span class="hint">max 300</span></label>
					<textarea id="tg-desc" name="description" rows="2" maxlength="300">{tgCfg.description}</textarea>
				</div>
			</div>
		</div>

		<!-- Features -->
		<div class="card">
			<h3>Фичи (буллеты) <span class="hint">(макс. 6)</span></h3>
			<div class="dynamic-list">
				{#each telegramFeatures as feature, i}
					<div class="dynamic-row">
						<div class="dynamic-field grow">
							<input type="text" name="feature_text" bind:value={feature} maxlength="60" placeholder="Эксклюзивные предложения" />
						</div>
						<button type="button" class="btn-remove" onclick={() => removeFeature(i)} title="Удалить">-</button>
					</div>
				{/each}
			</div>
			{#if telegramFeatures.length < 6}
				<button type="button" class="btn-add" onclick={addFeature}>+ Добавить</button>
			{/if}
		</div>

		<!-- CTA + URL -->
		<div class="card">
			<h3>CTA и ссылка</h3>
			<div class="form-grid">
				<div class="form-group">
					<label for="tg-cta">Текст CTA <span class="hint">max 30</span></label>
					<input type="text" id="tg-cta" name="cta_text" value={tgWidget.ctaText || 'Подписаться'} maxlength="30" />
				</div>
				<div class="form-group">
					<label for="tg-url">URL канала</label>
					<input type="text" id="tg-url" name="channel_url" value={data.telegramUrl} />
				</div>
			</div>
		</div>

		<div class="form-actions">
			<ActionButton type="submit" variant="primary">Сохранить</ActionButton>
		</div>
	</form>
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

	.auto-mode-info {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}

	.coming-soon-text {
		color: #9ca3af;
		font-size: 0.875rem;
	}

	/* SVG thumbnail for services */
	.svg-thumb {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #6b7280;
		flex-shrink: 0;
	}

	.svg-thumb :global(svg) {
		width: 28px;
		height: 28px;
	}

	/* Avatar thumbnail */
	.avatar-thumb {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid #e5e7eb;
		flex-shrink: 0;
	}

	.avatar-preview {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid #e5e7eb;
	}

	/* Search input */
	.search-input {
		padding: 0.375rem 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.8125rem;
		flex: 1;
	}

	/* Search results */
	.search-results {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 0.5rem;
		margin-bottom: 1rem;
	}

	.search-result-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		gap: 0.5rem;
	}

	.search-result-row:not(:last-child) {
		border-bottom: 1px solid #f3f4f6;
	}

	.search-result-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.search-result-info strong {
		font-size: 0.875rem;
	}

	/* Editorial note */
	.editorial-note {
		font-size: 0.8125rem;
		color: #9ca3af;
		font-style: italic;
		margin-top: 0.75rem;
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
