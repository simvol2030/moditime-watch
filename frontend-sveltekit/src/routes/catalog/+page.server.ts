import type { PageServerLoad } from './$types';
import { queries, db } from '$lib/server/db/database';
import type {
	CatalogHeroProps,
	CatalogFiltersProps,
	CatalogFilter,
	SortOption,
	FilterOption,
	ActiveFilter
} from '$lib/types/catalog';
import type { CatalogProduct } from '$lib/types/product';

interface DbProduct {
	id: number;
	slug: string;
	name: string;
	brand_id: number;
	brand_name: string;
	brand_slug: string;
	category_id: number | null;
	category_name: string | null;
	category_slug: string | null;
	price: number;
	availability_status: string;
	availability_text: string | null;
	specs_json: string | null;
	is_new: number;
	is_limited: number;
	is_featured: number;
	main_image: string | null;
}

interface DbBrand {
	id: number;
	slug: string;
	name: string;
}

export const load: PageServerLoad = async ({ url }) => {
	// Parse and validate page parameter
	const rawPage = parseInt(url.searchParams.get('page') || '1');
	const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.min(rawPage, 1000) : 1;
	const limit = 12;
	const offset = (page - 1) * limit;

	// === INPUT VALIDATION ===
	// Whitelist for sort options (prevents SQL injection in ORDER BY)
	const SORT_OPTIONS: Record<string, string> = {
		'price-asc': 'p.price ASC',
		'price-desc': 'p.price DESC',
		'new': 'p.created_at DESC',
		'popular': 'p.is_featured DESC, p.position'
	} as const;

	// Valid availability statuses whitelist
	const VALID_AVAILABILITY = ['in-stock', 'pre-order', 'waitlist'] as const;

	// Slug pattern for brand validation
	const VALID_SLUG_PATTERN = /^[a-z0-9-]{1,100}$/;

	// Parse and validate filter parameters
	const brandFilter = (url.searchParams.get('brand')?.split(',') || [])
		.filter((slug) => slug && VALID_SLUG_PATTERN.test(slug))
		.slice(0, 20); // Limit to 20 brands max

	const availabilityFilter = (url.searchParams.get('availability')?.split(',') || [])
		.filter((status): status is (typeof VALID_AVAILABILITY)[number] =>
			VALID_AVAILABILITY.includes(status as (typeof VALID_AVAILABILITY)[number])
		);

	// Parse dynamic filter parameters (material, mechanism, scenario)
	const materialFilter = (url.searchParams.get('material')?.split(',') || [])
		.filter((v) => v && VALID_SLUG_PATTERN.test(v))
		.slice(0, 20);

	const mechanismFilter = (url.searchParams.get('mechanism')?.split(',') || [])
		.filter((v) => v && VALID_SLUG_PATTERN.test(v))
		.slice(0, 20);

	const scenarioFilter = (url.searchParams.get('scenario')?.split(',') || [])
		.filter((v) => v && VALID_SLUG_PATTERN.test(v))
		.slice(0, 20);

	// Validate price range
	const rawMinPrice = parseInt(url.searchParams.get('minPrice') || '0');
	const rawMaxPrice = parseInt(url.searchParams.get('maxPrice') || '0');
	const hasExplicitMaxPrice = url.searchParams.has('maxPrice') && rawMaxPrice > 0;
	const minPrice = (Number.isFinite(rawMinPrice) && rawMinPrice >= 0 ? rawMinPrice : 0) * 100;
	const maxPrice = hasExplicitMaxPrice ? rawMaxPrice * 100 : 0;

	// Validate sort parameter against whitelist
	const sortByRaw = url.searchParams.get('sort') || 'popular';
	const sortBy = sortByRaw in SORT_OPTIONS ? sortByRaw : 'popular';

	const featured = url.searchParams.get('featured') === '1';
	const collection = url.searchParams.get('collection');

	// Build dynamic WHERE clause
	const conditions: string[] = ['p.is_active = 1'];
	const params: (string | number)[] = [];

	if (brandFilter.length > 0) {
		conditions.push(`b.slug IN (${brandFilter.map(() => '?').join(', ')})`);
		params.push(...brandFilter);
	}

	if (availabilityFilter.length > 0) {
		conditions.push(`p.availability_status IN (${availabilityFilter.map(() => '?').join(', ')})`);
		params.push(...availabilityFilter);
	}

	if (minPrice > 0) {
		conditions.push('p.price >= ?');
		params.push(minPrice);
	}

	if (hasExplicitMaxPrice && maxPrice > 0) {
		conditions.push('p.price <= ?');
		params.push(maxPrice);
	}

	if (featured) {
		conditions.push('p.is_featured = 1');
	}

	// Dynamic filter conditions (material, mechanism, scenario via product_filters)
	const dynamicFilters: { slug: string; values: string[] }[] = [];
	if (materialFilter.length > 0) dynamicFilters.push({ slug: 'material', values: materialFilter });
	if (mechanismFilter.length > 0) dynamicFilters.push({ slug: 'mechanism', values: mechanismFilter });
	if (scenarioFilter.length > 0) dynamicFilters.push({ slug: 'scenario', values: scenarioFilter });

	for (const df of dynamicFilters) {
		conditions.push(`p.id IN (
			SELECT pf.product_id FROM product_filters pf
			JOIN filter_values fv ON fv.id = pf.filter_value_id
			JOIN filter_attributes fa ON fa.id = fv.attribute_id
			WHERE fa.slug = ? AND fv.value IN (${df.values.map(() => '?').join(', ')})
		)`);
		params.push(df.slug, ...df.values);
	}

	// Build ORDER BY using whitelist (SQL injection safe)
	const orderBy = SORT_OPTIONS[sortBy] || SORT_OPTIONS['popular'];

	const whereClause = conditions.join(' AND ');

	// Count query
	const countSql = `
		SELECT COUNT(*) as total
		FROM products p
		JOIN brands b ON b.id = p.brand_id
		WHERE ${whereClause}
	`;
	const countResult = db.prepare(countSql).get(...params) as { total: number };
	const totalProducts = countResult.total;
	const totalPages = Math.ceil(totalProducts / limit);

	// Products query
	const productsSql = `
		SELECT p.*, b.name as brand_name, b.slug as brand_slug,
		       c.name as category_name, c.slug as category_slug,
		       (SELECT url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1) as main_image
		FROM products p
		JOIN brands b ON b.id = p.brand_id
		LEFT JOIN categories c ON c.id = p.category_id
		WHERE ${whereClause}
		ORDER BY ${orderBy}
		LIMIT ? OFFSET ?
	`;
	const productsFromDb = db.prepare(productsSql).all(...params, limit, offset) as DbProduct[];

	// Map to CatalogProduct interface
	const products: CatalogProduct[] = productsFromDb.map((p) => ({
		id: p.slug,
		brand: p.brand_name,
		name: p.name,
		price: p.price / 100,
		image: p.main_image || `https://picsum.photos/seed/watch-${p.slug}/360/440`,
		badge: p.is_limited ? 'Limited' : p.is_new ? 'New' : p.is_featured ? 'Top' : undefined,
		badgeType: (p.is_limited ? 'gold' : 'default') as 'default' | 'gold',
		info: buildProductInfo(p),
		availability: buildAvailabilityText(p)
	}));

	// Get brands from DB for filters
	const brandsFromDb = queries.getAllBrands.all() as DbBrand[];
	const brandOptions: FilterOption[] = brandsFromDb.map((b) => ({
		value: b.slug,
		label: b.name,
		checked: brandFilter.includes(b.slug)
	}));

	// Get total stats (unfiltered)
	const totalStatsResult = db.prepare('SELECT COUNT(*) as total FROM products WHERE is_active = 1').get() as { total: number };
	const inStockResult = db.prepare("SELECT COUNT(*) as total FROM products WHERE is_active = 1 AND availability_status = 'in-stock'").get() as { total: number };

	// Hero content
	const heroContent: CatalogHeroProps = {
		eyebrow: 'Каталог',
		title: 'Премиальные часы с доставкой Moditimewatch',
		description:
			'Отборные модели для коллекционеров и ценителей: проверенная подлинность, страхование, консьерж-подбор. Нужную модель найдём даже если её нет в открытом доступе.',
		stats: [
			{ label: 'Всего моделей', value: String(totalStatsResult.total) },
			{ label: 'В наличии', value: String(inStockResult.total) },
			{ label: 'Брендов', value: String(brandsFromDb.length) }
		]
	};

	// Telegram content (Session-12: use config values)
	const telegramGroupEnabled = (queries.getConfigByKey.get('telegram_group_enabled') as any)?.value === 'true';
	const telegramGroupUrl = (queries.getConfigByKey.get('telegram_group_url') as any)?.value || 'https://t.me/moditime_watch';
	const telegramContent = {
		eyebrow: 'Подписка',
		title: 'Канал Moditimewatch в Telegram',
		description:
			'Анонсы лимитированных релизов, backstage сервиса, приглашения на закрытые презентации.',
		features: [
			'Эксклюзивные предложения до попадания в витрину',
			'Подборки часов по городам',
			'Короткие обзоры новинок и советы коллекционеров'
		],
		ctaText: 'Подписаться',
		ctaHref: telegramGroupUrl,
		channelUrl: telegramGroupUrl
	};

	// Sort options
	const sortOptions: SortOption[] = [
		{ value: 'popular', label: 'По популярности' },
		{ value: 'new', label: 'Новинки' },
		{ value: 'price-asc', label: 'Цена: по возрастанию' },
		{ value: 'price-desc', label: 'Цена: по убыванию' }
	];

	// Filter options with checked state
	const availabilityOptions: FilterOption[] = [
		{ value: 'in-stock', label: 'В наличии', checked: availabilityFilter.includes('in-stock') },
		{ value: 'pre-order', label: 'Под заказ (7-21 день)', checked: availabilityFilter.includes('pre-order') },
		{ value: 'waitlist', label: 'Лист ожидания', checked: availabilityFilter.includes('waitlist') }
	];

	// Load filter options from database
	interface DbFilterValue {
		id: number;
		attribute_id: number;
		value: string;
		label: string;
		position: number;
		attribute_slug: string;
		attribute_name: string;
	}
	const allFilterValues = queries.getAllFilterValues.all() as DbFilterValue[];

	const filtersByAttr = new Map<string, DbFilterValue[]>();
	for (const fv of allFilterValues) {
		const arr = filtersByAttr.get(fv.attribute_slug) || [];
		arr.push(fv);
		filtersByAttr.set(fv.attribute_slug, arr);
	}

	const materialOptions: FilterOption[] = (filtersByAttr.get('material') || []).map((fv) => ({
		value: fv.value,
		label: fv.label,
		checked: materialFilter.includes(fv.value)
	}));

	const mechanismOptions: FilterOption[] = (filtersByAttr.get('mechanism') || []).map((fv) => ({
		value: fv.value,
		label: fv.label,
		checked: mechanismFilter.includes(fv.value)
	}));

	const scenarioOptions: FilterOption[] = (filtersByAttr.get('scenario') || []).map((fv) => ({
		value: fv.value,
		label: fv.label,
		checked: scenarioFilter.includes(fv.value)
	}));

	// Current filter state
	const currentFilters: CatalogFilter = {
		availability: availabilityFilter,
		brands: brandFilter,
		priceRange: { min: minPrice / 100, max: hasExplicitMaxPrice ? maxPrice / 100 : 10000000 },
		materials: materialFilter,
		mechanisms: mechanismFilter,
		scenarios: scenarioFilter
	};

	const controlsContent = {
		sortOptions,
		currentSort: sortBy
	};

	const filtersContent: Omit<CatalogFiltersProps, 'onApply' | 'onClose'> = {
		filters: currentFilters,
		brandOptions,
		materialOptions,
		mechanismOptions,
		scenarioOptions,
		availabilityOptions
	};

	// Build active filters for display
	const activeFilters: ActiveFilter[] = [];

	brandFilter.forEach((slug) => {
		const brand = brandsFromDb.find((b) => b.slug === slug);
		if (brand) {
			activeFilters.push({ id: `brand:${slug}`, label: brand.name });
		}
	});

	availabilityFilter.forEach((status) => {
		const opt = availabilityOptions.find((o) => o.value === status);
		if (opt) {
			activeFilters.push({ id: `availability:${status}`, label: opt.label });
		}
	});

	if (minPrice > 0 || hasExplicitMaxPrice) {
		activeFilters.push({
			id: `price:${minPrice / 100}-${maxPrice / 100}`,
			label: `${formatPriceShort(minPrice / 100)} — ${formatPriceShort(maxPrice / 100)}`
		});
	}

	materialFilter.forEach((val) => {
		const opt = materialOptions.find((o) => o.value === val);
		if (opt) activeFilters.push({ id: `material:${val}`, label: opt.label });
	});

	mechanismFilter.forEach((val) => {
		const opt = mechanismOptions.find((o) => o.value === val);
		if (opt) activeFilters.push({ id: `mechanism:${val}`, label: opt.label });
	});

	scenarioFilter.forEach((val) => {
		const opt = scenarioOptions.find((o) => o.value === val);
		if (opt) activeFilters.push({ id: `scenario:${val}`, label: opt.label });
	});

	return {
		heroContent,
		telegramContent,
		telegramGroupEnabled,
		controlsContent,
		filtersContent,
		products,
		totalProducts,
		shownProducts: products.length,
		currentPage: page,
		totalPages,
		activeFilters,
		currentSort: sortBy
	};
};

function formatPriceShort(price: number): string {
	if (price >= 1000000) {
		return `${(price / 1000000).toFixed(1)}M ₽`;
	}
	if (price >= 1000) {
		return `${Math.round(price / 1000)}K ₽`;
	}
	return `${price} ₽`;
}

function buildProductInfo(p: DbProduct): string[] {
	const info: string[] = [];

	if (p.specs_json) {
		try {
			const specs = JSON.parse(p.specs_json);
			if (specs['Корпус']) {
				const material = specs['Корпус'].find(
					(s: { label: string; value: string }) => s.label === 'Материал'
				);
				if (material) info.push(material.value);
				const diameter = specs['Корпус'].find(
					(s: { label: string; value: string }) => s.label === 'Диаметр'
				);
				if (diameter) info.push(diameter.value);
			}
			if (specs['Механизм']) {
				const caliber = specs['Механизм'].find(
					(s: { label: string; value: string }) => s.label === 'Калибр'
				);
				if (caliber) info.push(caliber.value);
			}
		} catch {
			// Ignore JSON parse errors
		}
	}

	info.push(buildAvailabilityText(p));
	return info;
}

function buildAvailabilityText(p: DbProduct): string {
	if (p.availability_text) return p.availability_text;

	switch (p.availability_status) {
		case 'in-stock':
			return 'В наличии';
		case 'pre-order':
			return 'Под заказ 7-21 день';
		case 'waitlist':
			return 'Лист ожидания';
		default:
			return 'Уточняйте наличие';
	}
}
