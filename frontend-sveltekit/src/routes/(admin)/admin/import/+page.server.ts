import type { Actions } from './$types';
import { parseCSV } from '$lib/server/import/csv-parser';
import { detectCsvFormat, convertSupplierRows, type CsvFormat } from '$lib/server/import/csv-format-detector';
import { importProducts } from '$lib/server/import/product-importer';
import { importBrands } from '$lib/server/import/brand-importer';
import { importCategories } from '$lib/server/import/category-importer';
import { importCities } from '$lib/server/import/city-importer';
import { importCityArticles } from '$lib/server/import/city-article-importer';
import { importFilters } from '$lib/server/import/filter-importer';
import { extractZipImport, resolveImageReferences } from '$lib/server/import/zip-handler';
import type { EntityType } from '$lib/server/media/storage';

const IMPORTERS: Record<string, (rows: Record<string, string>[]) => { added: number; updated: number; errors: { row: number; field: string; message: string }[] }> = {
	products: importProducts,
	brands: importBrands,
	categories: importCategories,
	cities: importCities,
	city_articles: importCityArticles,
	filters: importFilters
};

/** Columns that may contain image references (for ZIP image resolution) */
const IMAGE_COLUMNS: Record<string, string[]> = {
	products: ['main_image', 'gallery_images'],
	brands: ['logo_url'],
	categories: ['image_url'],
	cities: ['hero_image_url'],
	city_articles: ['image_url'],
	filters: []
};

/** Map data type to media entity folder */
const ENTITY_MAP: Record<string, EntityType> = {
	products: 'products',
	brands: 'brands',
	categories: 'categories',
	cities: 'cities',
	city_articles: 'articles',
	filters: 'misc'
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for ZIP files

/**
 * Extract CSV text from file (CSV or ZIP).
 * If ZIP, also processes images and returns imageMap + thumbMap + errors.
 */
async function extractFileContents(file: File, dataType: string): Promise<{
	csvText: string;
	imageMap: Map<string, string>;
	thumbMap: Map<string, string>;
	imageCount: number;
	imageErrors: string[];
}> {
	const isZip = file.name.endsWith('.zip') || file.type === 'application/zip';

	if (isZip) {
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const entity = ENTITY_MAP[dataType] || 'misc';
		const result = await extractZipImport(buffer, entity);
		return {
			csvText: result.csvText,
			imageMap: result.imageMap,
			thumbMap: result.thumbMap,
			imageCount: result.imageCount,
			imageErrors: result.imageErrors
		};
	}

	const csvText = await file.text();
	return { csvText, imageMap: new Map(), thumbMap: new Map(), imageCount: 0, imageErrors: [] };
}

export const actions: Actions = {
	preview: async ({ request }) => {
		const formData = await request.formData();
		const csvFile = (formData.get('csv_file') || formData.get('file')) as File | null;
		const imagesZip = formData.get('images_zip') as File | null;
		const dataType = formData.get('data_type') as string;

		if (!csvFile || csvFile.size === 0) {
			return { error: 'Please select a CSV file' };
		}
		if (csvFile.size > MAX_FILE_SIZE) {
			return { error: 'File exceeds 50MB limit' };
		}
		if (imagesZip && imagesZip.size > MAX_FILE_SIZE) {
			return { error: 'ZIP file exceeds 50MB limit' };
		}
		if (!IMPORTERS[dataType]) {
			return { error: 'Invalid data type selected' };
		}

		try {
			// Get CSV text — from plain CSV file or from ZIP containing CSV
			const { csvText, imageCount: previewImageCount } = await extractFileContents(csvFile, dataType);
			const { rows: rawRows, headers: rawHeaders } = parseCSV(csvText);

			if (rawRows.length === 0) {
				return { error: 'CSV file is empty or has no data rows' };
			}

			// Count images from separate ZIP if provided
			let zipImageCount = 0;
			if (imagesZip && imagesZip.size > 0) {
				const zipBuffer = Buffer.from(await imagesZip.arrayBuffer());
				const { extractZipImages } = await import('$lib/server/import/zip-handler');
				const zipResult = await extractZipImages(zipBuffer);
				zipImageCount = zipResult.imageCount;
			}

			// Detect CSV format and convert if supplier
			const detectedFormat: CsvFormat = dataType === 'products'
				? detectCsvFormat(rawHeaders)
				: 'native';

			let rows = rawRows;
			let headers = rawHeaders;
			let conversionInfo: { newBrands: string[]; newCategories: string[]; specsCollected: boolean } | undefined;

			if (detectedFormat === 'supplier') {
				const conversion = convertSupplierRows(rawRows);
				rows = conversion.rows;
				headers = Object.keys(rows[0] || {});
				conversionInfo = {
					newBrands: Array.from(conversion.brandNames.entries()).map(([slug, name]) => `${name} → ${slug}`),
					newCategories: Array.from(conversion.categoryNames.entries()).map(([slug, name]) => `${name} → ${slug}`),
					specsCollected: true
				};
			}

			return {
				preview: true,
				dataType,
				headers,
				rows: rows.slice(0, 5),
				totalRows: rows.length,
				fileName: csvFile.name,
				hasZip: !!(imagesZip && imagesZip.size > 0),
				zipImageCount: zipImageCount || previewImageCount,
				detectedFormat,
				conversionInfo
			};
		} catch (err) {
			return { error: `Preview failed: ${err instanceof Error ? err.message : 'Unknown error'}` };
		}
	},

	import: async ({ request }) => {
		const formData = await request.formData();
		const csvFile = (formData.get('csv_file') || formData.get('file')) as File | null;
		const imagesZip = formData.get('images_zip') as File | null;
		const dataType = formData.get('data_type') as string;
		const cascade = formData.get('cascade') === '1';

		if (!csvFile || csvFile.size === 0) {
			return { error: 'Please select a CSV file' };
		}
		if (csvFile.size > MAX_FILE_SIZE) {
			return { error: 'File exceeds 50MB limit' };
		}
		if (imagesZip && imagesZip.size > MAX_FILE_SIZE) {
			return { error: 'ZIP file exceeds 50MB limit' };
		}

		const importer = IMPORTERS[dataType];
		if (!importer) {
			return { error: 'Invalid data type selected' };
		}

		try {
			// Get CSV text + images from CSV file (may be ZIP with CSV+images)
			const csvResult = await extractFileContents(csvFile, dataType);
			let { csvText, imageMap, imageCount, imageErrors } = csvResult;

			// If separate images ZIP provided, extract images from it too
			if (imagesZip && imagesZip.size > 0) {
				const zipBuffer = Buffer.from(await imagesZip.arrayBuffer());
				const entity = ENTITY_MAP[dataType] || 'misc';
				const zipResult = await extractZipImport(zipBuffer, entity);
				// Merge image maps (separate ZIP overrides if duplicate keys)
				for (const [key, url] of zipResult.imageMap) {
					imageMap.set(key, url);
				}
				imageCount += zipResult.imageCount;
				imageErrors = [...imageErrors, ...zipResult.imageErrors];
			}
			const { rows: rawRows, headers: rawHeaders } = parseCSV(csvText);

			if (rawRows.length === 0) {
				return { error: 'CSV file is empty or has no data rows' };
			}

			// Detect CSV format and convert if supplier
			const detectedFormat: CsvFormat = dataType === 'products'
				? detectCsvFormat(rawHeaders)
				: 'native';

			let rows = rawRows;
			let supplierBrandNames: Map<string, string> | undefined;
			let supplierCategoryNames: Map<string, string> | undefined;

			if (detectedFormat === 'supplier') {
				const conversion = convertSupplierRows(rawRows);
				rows = conversion.rows;
				supplierBrandNames = conversion.brandNames;
				supplierCategoryNames = conversion.categoryNames;
			}

			// Resolve image references from ZIP
			if (imageMap.size > 0) {
				const imgCols = IMAGE_COLUMNS[dataType] || [];
				if (imgCols.length > 0) {
					rows = resolveImageReferences(rows, imageMap, imgCols);
				}
			}

			// Cascade import: auto-create brands/categories before products
			// For supplier format — auto-enable cascade with proper names
			const shouldCascade = (cascade || detectedFormat === 'supplier') && dataType === 'products';

			if (shouldCascade) {
				const brandSlugs = new Set<string>();
				const categorySlugs = new Set<string>();

				for (const row of rows) {
					if (row.brand_slug) brandSlugs.add(row.brand_slug);
					if (row.category_slug) categorySlugs.add(row.category_slug);
				}

				// Auto-create brands (use original names from supplier if available)
				if (brandSlugs.size > 0) {
					const brandRows = Array.from(brandSlugs).map(slug => ({
						slug,
						name: supplierBrandNames?.get(slug) || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
						description: '',
						logo_url: '',
						country: 'Switzerland',
						founded_year: '',
						website_url: '',
						is_active: '1',
						position: '0'
					}));
					importBrands(brandRows);
				}

				// Auto-create categories (use Russian names from supplier if available)
				if (categorySlugs.size > 0) {
					const catRows = Array.from(categorySlugs).map(slug => ({
						slug,
						name: supplierCategoryNames?.get(slug) || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
						description: '',
						parent_slug: '',
						image_url: '',
						is_active: '1',
						position: '0'
					}));
					importCategories(catRows);
				}
			}

			const result = importer(rows);
			return {
				success: true,
				dataType,
				result,
				detectedFormat,
				imagesProcessed: imageCount,
				imageErrors: imageErrors.length > 0 ? imageErrors : undefined
			};
		} catch (err) {
			return { error: `Import failed: ${err instanceof Error ? err.message : 'Unknown error'}` };
		}
	}
};
