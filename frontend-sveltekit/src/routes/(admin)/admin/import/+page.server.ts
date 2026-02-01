import type { Actions } from './$types';
import { parseCSV } from '$lib/server/import/csv-parser';
import { importProducts } from '$lib/server/import/product-importer';
import { importBrands } from '$lib/server/import/brand-importer';
import { importCategories } from '$lib/server/import/category-importer';
import { importCities } from '$lib/server/import/city-importer';
import { importCityArticles } from '$lib/server/import/city-article-importer';
import { importFilters } from '$lib/server/import/filter-importer';

const IMPORTERS: Record<string, (rows: Record<string, string>[]) => { added: number; updated: number; errors: { row: number; field: string; message: string }[] }> = {
	products: importProducts,
	brands: importBrands,
	categories: importCategories,
	cities: importCities,
	city_articles: importCityArticles,
	filters: importFilters
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const actions: Actions = {
	preview: async ({ request }) => {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const dataType = formData.get('data_type') as string;

		if (!file || file.size === 0) {
			return { error: 'Please select a CSV file' };
		}
		if (file.size > MAX_FILE_SIZE) {
			return { error: 'File exceeds 10MB limit' };
		}
		if (!IMPORTERS[dataType]) {
			return { error: 'Invalid data type selected' };
		}

		const text = await file.text();
		const { rows, headers } = parseCSV(text);

		if (rows.length === 0) {
			return { error: 'CSV file is empty or has no data rows' };
		}

		return {
			preview: true,
			dataType,
			headers,
			rows: rows.slice(0, 5),
			totalRows: rows.length,
			fileName: file.name
		};
	},

	import: async ({ request }) => {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const dataType = formData.get('data_type') as string;

		if (!file || file.size === 0) {
			return { error: 'Please select a CSV file' };
		}
		if (file.size > MAX_FILE_SIZE) {
			return { error: 'File exceeds 10MB limit' };
		}

		const importer = IMPORTERS[dataType];
		if (!importer) {
			return { error: 'Invalid data type selected' };
		}

		const text = await file.text();
		const { rows } = parseCSV(text);

		if (rows.length === 0) {
			return { error: 'CSV file is empty or has no data rows' };
		}

		try {
			const result = importer(rows);
			return {
				success: true,
				dataType,
				result
			};
		} catch (err) {
			return { error: `Import failed: ${err instanceof Error ? err.message : 'Unknown error'}` };
		}
	}
};
