<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let brand = $state('');
	let priceRange = $state('');
	let type = $state('');

	const brands = [
		'Rolex',
		'Patek Philippe',
		'Audemars Piguet',
		'Omega',
		'Cartier',
		'Vacheron Constantin'
	];

	const prices = [
		{ label: 'До 500 000 ₽', value: '0-500000' },
		{ label: '500 000 - 1 000 000 ₽', value: '500000-1000000' },
		{ label: '1 000 000 - 3 000 000 ₽', value: '1000000-3000000' },
		{ label: 'От 3 000 000 ₽', value: '3000000-100000000' }
	];

	const types = ['Мужские', 'Женские', 'Унисекс'];

	function handleSearch() {
		const params = new URLSearchParams();
		if (brand) params.set('brand', brand.toLowerCase().replace(' ', '-'));
		if (priceRange) {
			const [min, max] = priceRange.split('-');
			params.set('minPrice', min);
			params.set('maxPrice', max);
		}
		if (type) {
			if (type === 'Мужские') params.set('gender', 'male');
			if (type === 'Женские') params.set('gender', 'female');
			if (type === 'Унисекс') params.set('gender', 'unisex');
		}

		goto(`/catalog?${params.toString()}`);
	}
</script>

<div class="search-widget">
	<div class="search-widget__header">
		<h3 class="search-widget__title">Подбор часов</h3>
		<p class="search-widget__subtitle">Найдите идеальную модель</p>
	</div>

	<div class="search-widget__form">
		<div class="form-group">
			<label for="brand">Бренд</label>
			<select id="brand" bind:value={brand} class="input-field">
				<option value="">Все бренды</option>
				{#each brands as b}
					<option value={b}>{b}</option>
				{/each}
			</select>
		</div>

		<div class="form-group">
			<label for="price">Бюджет</label>
			<select id="price" bind:value={priceRange} class="input-field">
				<option value="">Любой бюджет</option>
				{#each prices as p}
					<option value={p.value}>{p.label}</option>
				{/each}
			</select>
		</div>

		<div class="form-group">
			<label for="type">Тип</label>
			<select id="type" bind:value={type} class="input-field">
				<option value="">Любые</option>
				{#each types as t}
					<option value={t}>{t}</option>
				{/each}
			</select>
		</div>

		<button class="btn btn-primary search-widget__submit" onclick={handleSearch}>
			<span>Найти часы</span>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="11" cy="11" r="8"></circle>
				<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
			</svg>
		</button>
	</div>
</div>

<style>
	.search-widget {
		background-color: var(--color-white);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--color-border);
	}

	.search-widget__header {
		margin-bottom: var(--space-lg);
		text-align: center;
	}

	.search-widget__title {
		font-size: var(--font-size-h3);
		margin-bottom: var(--space-2xs);
	}

	.search-widget__subtitle {
		color: var(--color-text-soft);
		font-size: var(--font-size-body-sm);
	}

	.search-widget__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.form-group label {
		font-size: var(--font-size-caption);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.search-widget__submit {
		margin-top: var(--space-xs);
		width: 100%;
		justify-content: center;
	}
</style>
