// CSV Format Detector + Supplier Row Converter
// Detects whether a CSV is in "native" (our format) or "supplier" format
// and converts supplier rows to native format for import pipeline

export type CsvFormat = 'native' | 'supplier' | 'unknown';

export interface ConversionResult {
	rows: Record<string, string>[];
	/** Map of brand_slug → original brand name (for cascade auto-create) */
	brandNames: Map<string, string>;
	/** Map of category_slug → Russian display name (for cascade auto-create) */
	categoryNames: Map<string, string>;
}

/** Headers that indicate our native format */
const NATIVE_MARKERS = ['slug', 'brand_slug', 'specs_json'];

/** Headers that indicate supplier format */
const SUPPLIER_MARKERS = ['Имя', 'Бренд', 'Артикул (Ref)', 'Пол'];

/** Gender → category_slug mapping */
const GENDER_MAP: Record<string, string> = {
	'Мужские': 'mens',
	'Женские': 'womens',
	'Унисекс': 'unisex'
};

/** category_slug → Russian display name (for auto-create) */
const CATEGORY_NAMES: Record<string, string> = {
	'mens': 'Мужские часы',
	'womens': 'Женские часы',
	'unisex': 'Унисекс'
};

/** Spec columns mapping: source header → { group, label } */
const SPEC_COLUMNS: { header: string; group: string; label: string; suffix?: string }[] = [
	{ header: 'Корпус', group: 'Корпус', label: 'Материал' },
	{ header: 'Размер (мм)', group: 'Корпус', label: 'Диаметр', suffix: ' мм' },
	{ header: 'Толщ, (мм)', group: 'Корпус', label: 'Толщина', suffix: ' мм' },
	{ header: 'Водозащита', group: 'Корпус', label: 'Водозащита' },
	{ header: 'Мех-м', group: 'Механизм', label: 'Тип' },
	{ header: 'Калибр', group: 'Механизм', label: 'Калибр' },
	{ header: 'Запас хода', group: 'Механизм', label: 'Запас хода' },
	{ header: 'Циферблат', group: 'Внешний вид', label: 'Циферблат' },
	{ header: 'Ремешок/Браслет', group: 'Внешний вид', label: 'Ремешок/Браслет' }
];

/**
 * Detect CSV format by examining headers.
 * Returns 'native' for our format, 'supplier' for supplier format, 'unknown' otherwise.
 */
export function detectCsvFormat(headers: string[]): CsvFormat {
	const headerSet = new Set(headers);

	if (NATIVE_MARKERS.some(h => headerSet.has(h))) {
		return 'native';
	}

	if (SUPPLIER_MARKERS.some(h => headerSet.has(h))) {
		return 'supplier';
	}

	return 'unknown';
}

/**
 * Convert brand name to slug: trim, lowercase, replace non-alphanumeric with hyphens.
 * Example: "Tissot " → "tissot", "ATOWAK" → "atowak"
 */
export function makeBrandSlug(brand: string): string {
	return brand
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Build specs_json from individual supplier columns.
 * Groups: Корпус, Механизм, Внешний вид.
 * Skips entries where value is "-", empty, or whitespace-only.
 */
function buildSpecsJson(row: Record<string, string>): string {
	const groups: Record<string, { label: string; value: string }[]> = {};

	for (const spec of SPEC_COLUMNS) {
		// Try exact header, then alternative with period instead of comma
		let value = row[spec.header]?.trim();
		if (value === undefined && spec.header === 'Толщ, (мм)') {
			value = row['Толщ. (мм)']?.trim();
		}

		// Skip empty or dash values
		if (!value || value === '-' || value === '—' || value === '–') continue;

		// Append suffix (e.g., " мм") if the value doesn't already contain it
		if (spec.suffix && !value.toLowerCase().includes(spec.suffix.trim().toLowerCase())) {
			value = value + spec.suffix;
		}

		if (!groups[spec.group]) {
			groups[spec.group] = [];
		}
		groups[spec.group].push({ label: spec.label, value });
	}

	// Only return non-empty groups
	const result: Record<string, { label: string; value: string }[]> = {};
	for (const [group, specs] of Object.entries(groups)) {
		if (specs.length > 0) {
			result[group] = specs;
		}
	}

	return Object.keys(result).length > 0 ? JSON.stringify(result) : '';
}

/**
 * Convert supplier-format rows to native format.
 * Returns converted rows + maps for brand/category auto-creation.
 */
export function convertSupplierRows(rows: Record<string, string>[]): ConversionResult {
	const brandNames = new Map<string, string>();
	const categoryNames = new Map<string, string>();

	const convertedRows = rows.map(row => {
		const name = row['Имя']?.trim() || '';
		const brandRaw = row['Бренд']?.trim() || '';
		const brandSlug = makeBrandSlug(brandRaw);
		const sku = row['Артикул (Ref)']?.trim() || '';
		const price = row['Цена']?.trim() || '0';
		const gender = row['Пол']?.trim() || '';
		const categorySlug = GENDER_MAP[gender] || '';
		const collection = row['Коллекция']?.trim() || '';
		const photo = row['Фото']?.trim() || '';

		// Track brand names for cascade auto-create
		if (brandSlug && brandRaw) {
			brandNames.set(brandSlug, brandRaw);
		}

		// Track category names for cascade auto-create
		if (categorySlug && CATEGORY_NAMES[categorySlug]) {
			categoryNames.set(categorySlug, CATEGORY_NAMES[categorySlug]);
		}

		// Photo: supports multiple values via `;` separator
		// First value → main_image, rest → gallery_images (pipe-separated)
		let mainImage = '';
		let galleryImages = '';
		if (photo) {
			const photoIds = photo.split(';').map(p => p.trim()).filter(Boolean);
			const resolvedPhotos = photoIds.map(p => /^\d+$/.test(p) ? `${p}.jpg` : p);
			mainImage = resolvedPhotos[0] || '';
			if (resolvedPhotos.length > 1) {
				galleryImages = resolvedPhotos.slice(1).join('|');
			}
		}

		// Description from collection
		const description = collection ? `Коллекция: ${collection}` : '';

		// Build specs from individual columns
		const specsJson = buildSpecsJson(row);

		return {
			slug: '',
			brand_slug: brandSlug,
			category_slug: categorySlug,
			name,
			sku,
			price,
			price_note: '',
			availability_status: '',
			description,
			specs_json: specsJson,
			is_active: '1',
			is_featured: '0',
			is_new: '0',
			is_limited: '0',
			position: '0',
			main_image: mainImage,
			gallery_images: galleryImages
		};
	});

	return { rows: convertedRows, brandNames, categoryNames };
}
