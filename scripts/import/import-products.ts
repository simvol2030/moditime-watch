/**
 * Products CSV Import Script
 *
 * Usage:
 *   npx tsx scripts/import/import-products.ts <csv_file> [--dry-run] [--update]
 *
 * Options:
 *   --dry-run   Validate without writing to database
 *   --update    Update existing products (default: skip)
 *
 * CSV Format: See products_template.csv
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// Types
interface CsvRow {
	slug: string;
	brand_slug: string;
	category_slug: string;
	name: string;
	sku: string;
	price: string;
	availability_status: string;
	availability_text: string;
	description: string;
	is_active: string;
	is_featured: string;
	is_new: string;
	is_limited: string;
	image_urls: string;
	specs_json: string;
	material: string;
	movement: string;
	style: string;
}

interface ImportResult {
	success: boolean;
	created: number;
	updated: number;
	skipped: number;
	errors: string[];
}

interface BrandRow {
	id: number;
	slug: string;
}

interface CategoryRow {
	id: number;
	slug: string;
}

interface ProductRow {
	id: number;
	slug: string;
}

interface FilterValueRow {
	id: number;
	attribute_id: number;
	value: string;
}

// Parse CSV with proper handling of quoted fields
function parseCsv(content: string): CsvRow[] {
	const lines = content.split('\n');
	const rows: CsvRow[] = [];
	let headers: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Skip empty lines and comments
		if (!line || line.startsWith('#')) continue;

		const values = parseCsvLine(line);

		if (headers.length === 0) {
			headers = values;
			continue;
		}

		const row: Record<string, string> = {};
		headers.forEach((header, index) => {
			row[header] = values[index] || '';
		});

		rows.push(row as unknown as CsvRow);
	}

	return rows;
}

// Parse a single CSV line, handling quoted fields
function parseCsvLine(line: string): string[] {
	const values: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		const nextChar = line[i + 1];

		if (char === '"') {
			if (inQuotes && nextChar === '"') {
				// Escaped quote
				current += '"';
				i++;
			} else {
				// Toggle quote mode
				inQuotes = !inQuotes;
			}
		} else if (char === ',' && !inQuotes) {
			values.push(current.trim());
			current = '';
		} else {
			current += char;
		}
	}

	values.push(current.trim());
	return values;
}

// Validate a single row
function validateRow(row: CsvRow, rowIndex: number): string[] {
	const errors: string[] = [];
	const prefix = `Row ${rowIndex + 1}`;

	// Required fields
	if (!row.slug) errors.push(`${prefix}: slug is required`);
	if (!row.brand_slug) errors.push(`${prefix}: brand_slug is required`);
	if (!row.name) errors.push(`${prefix}: name is required`);
	if (!row.price) errors.push(`${prefix}: price is required`);

	// Slug format
	if (row.slug && !/^[a-z0-9-]+$/.test(row.slug)) {
		errors.push(`${prefix}: slug must be lowercase alphanumeric with dashes`);
	}

	// Price validation
	const price = parseFloat(row.price);
	if (isNaN(price) || price <= 0) {
		errors.push(`${prefix}: price must be a positive number`);
	}

	// Availability status
	const validStatuses = ['in-stock', 'pre-order', 'waitlist'];
	if (row.availability_status && !validStatuses.includes(row.availability_status)) {
		errors.push(`${prefix}: availability_status must be one of: ${validStatuses.join(', ')}`);
	}

	// JSON validation
	if (row.specs_json && row.specs_json !== '{}') {
		try {
			JSON.parse(row.specs_json);
		} catch {
			errors.push(`${prefix}: specs_json is not valid JSON`);
		}
	}

	return errors;
}

// Main import function
export async function importProducts(
	csvPath: string,
	dbPath: string,
	options: { dryRun?: boolean; update?: boolean } = {}
): Promise<ImportResult> {
	const result: ImportResult = {
		success: false,
		created: 0,
		updated: 0,
		skipped: 0,
		errors: []
	};

	// Check CSV file exists
	if (!fs.existsSync(csvPath)) {
		result.errors.push(`CSV file not found: ${csvPath}`);
		return result;
	}

	// Read and parse CSV
	const content = fs.readFileSync(csvPath, 'utf-8');
	// Remove BOM if present
	const cleanContent = content.replace(/^\uFEFF/, '');
	const rows = parseCsv(cleanContent);

	if (rows.length === 0) {
		result.errors.push('No data rows found in CSV');
		return result;
	}

	console.log(`[Import] Found ${rows.length} rows to process`);

	// Validate all rows first
	rows.forEach((row, index) => {
		const rowErrors = validateRow(row, index);
		result.errors.push(...rowErrors);
	});

	if (result.errors.length > 0) {
		console.log(`[Import] Validation failed with ${result.errors.length} errors`);
		return result;
	}

	if (options.dryRun) {
		console.log('[Import] Dry run - validation passed, no changes made');
		result.success = true;
		return result;
	}

	// Open database
	const db = new Database(dbPath);
	db.pragma('journal_mode = WAL');

	// Prepare statements
	const getBrandBySlug = db.prepare('SELECT id, slug FROM brands WHERE slug = ?');
	const getCategoryBySlug = db.prepare('SELECT id, slug FROM categories WHERE slug = ?');
	const getProductBySlug = db.prepare('SELECT id, slug FROM products WHERE slug = ?');
	const getFilterValue = db.prepare(`
		SELECT fv.id, fv.attribute_id, fv.value
		FROM filter_values fv
		JOIN filter_attributes fa ON fa.id = fv.attribute_id
		WHERE fa.slug = ? AND fv.value = ?
	`);

	const insertProduct = db.prepare(`
		INSERT INTO products (
			slug, brand_id, category_id, name, sku, price,
			availability_status, availability_text, description,
			is_active, is_featured, is_new, is_limited, specs_json,
			created_at, updated_at
		) VALUES (
			?, ?, ?, ?, ?, ?,
			?, ?, ?,
			?, ?, ?, ?, ?,
			datetime('now'), datetime('now')
		)
	`);

	const updateProduct = db.prepare(`
		UPDATE products SET
			brand_id = ?, category_id = ?, name = ?, sku = ?, price = ?,
			availability_status = ?, availability_text = ?, description = ?,
			is_active = ?, is_featured = ?, is_new = ?, is_limited = ?, specs_json = ?,
			updated_at = datetime('now')
		WHERE slug = ?
	`);

	const insertImage = db.prepare(`
		INSERT INTO product_images (product_id, url, position, is_main, created_at)
		VALUES (?, ?, ?, ?, datetime('now'))
	`);

	const deleteProductImages = db.prepare('DELETE FROM product_images WHERE product_id = ?');

	const insertProductFilter = db.prepare(`
		INSERT OR IGNORE INTO product_filters (product_id, filter_value_id)
		VALUES (?, ?)
	`);

	const deleteProductFilters = db.prepare('DELETE FROM product_filters WHERE product_id = ?');

	// Create brand if not exists
	const insertBrand = db.prepare(`
		INSERT OR IGNORE INTO brands (slug, name, is_active, created_at, updated_at)
		VALUES (?, ?, 1, datetime('now'), datetime('now'))
	`);

	// Process rows in a transaction
	const transaction = db.transaction(() => {
		for (const row of rows) {
			try {
				// Lookup or create brand
				let brandRow = getBrandBySlug.get(row.brand_slug) as BrandRow | undefined;
				if (!brandRow) {
					// Create brand with slug as name (can be updated in admin later)
					const brandName = row.brand_slug
						.split('-')
						.map(word => word.charAt(0).toUpperCase() + word.slice(1))
						.join(' ');
					insertBrand.run(row.brand_slug, brandName);
					brandRow = getBrandBySlug.get(row.brand_slug) as BrandRow;
					console.log(`[Import] Created brand: ${brandName}`);
				}

				// Lookup category (optional)
				let categoryId: number | null = null;
				if (row.category_slug) {
					const categoryRow = getCategoryBySlug.get(row.category_slug) as CategoryRow | undefined;
					if (categoryRow) {
						categoryId = categoryRow.id;
					}
				}

				// Check if product exists
				const existingProduct = getProductBySlug.get(row.slug) as ProductRow | undefined;

				// Convert price from rubles to kopecks
				const priceKopecks = Math.round(parseFloat(row.price) * 100);

				// Parse flags
				const isActive = row.is_active === '1' || row.is_active === 'true' ? 1 : 0;
				const isFeatured = row.is_featured === '1' || row.is_featured === 'true' ? 1 : 0;
				const isNew = row.is_new === '1' || row.is_new === 'true' ? 1 : 0;
				const isLimited = row.is_limited === '1' || row.is_limited === 'true' ? 1 : 0;

				let productId: number;

				if (existingProduct) {
					if (options.update) {
						// Update existing product
						updateProduct.run(
							brandRow.id,
							categoryId,
							row.name,
							row.sku || null,
							priceKopecks,
							row.availability_status || 'in-stock',
							row.availability_text || null,
							row.description || null,
							isActive,
							isFeatured,
							isNew,
							isLimited,
							row.specs_json || '{}',
							row.slug
						);
						productId = existingProduct.id;
						result.updated++;
						console.log(`[Import] Updated: ${row.slug}`);
					} else {
						result.skipped++;
						console.log(`[Import] Skipped (exists): ${row.slug}`);
						continue;
					}
				} else {
					// Insert new product
					const insertResult = insertProduct.run(
						row.slug,
						brandRow.id,
						categoryId,
						row.name,
						row.sku || null,
						priceKopecks,
						row.availability_status || 'in-stock',
						row.availability_text || null,
						row.description || null,
						isActive,
						isFeatured,
						isNew,
						isLimited,
						row.specs_json || '{}'
					);
					productId = Number(insertResult.lastInsertRowid);
					result.created++;
					console.log(`[Import] Created: ${row.slug}`);
				}

				// Process images (delete existing if updating)
				if (existingProduct && options.update) {
					deleteProductImages.run(productId);
				}

				if (row.image_urls) {
					const imageUrls = row.image_urls.split(',').map(url => url.trim()).filter(Boolean);
					imageUrls.forEach((url, index) => {
						insertImage.run(productId, url, index, index === 0 ? 1 : 0);
					});
				}

				// Process filters (delete existing if updating)
				if (existingProduct && options.update) {
					deleteProductFilters.run(productId);
				}

				// Link filter values
				const filterMappings: [string, string][] = [
					['material', row.material],
					['movement', row.movement],
					['style', row.style]
				];

				for (const [attrSlug, values] of filterMappings) {
					if (!values) continue;

					const valueList = values.split(',').map(v => v.trim()).filter(Boolean);
					for (const value of valueList) {
						const filterValueRow = getFilterValue.get(attrSlug, value) as FilterValueRow | undefined;
						if (filterValueRow) {
							insertProductFilter.run(productId, filterValueRow.id);
						} else {
							console.log(`[Import] Warning: filter value not found: ${attrSlug}:${value}`);
						}
					}
				}

			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				result.errors.push(`Error processing ${row.slug}: ${message}`);
				throw error; // Rollback transaction
			}
		}
	});

	try {
		transaction();
		result.success = true;
		console.log(`[Import] Complete: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		result.errors.push(`Transaction failed: ${message}`);
		console.error('[Import] Transaction rolled back:', message);
	} finally {
		db.close();
	}

	return result;
}

// CLI entry point
async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
		console.log(`
Products CSV Import

Usage:
  npx tsx scripts/import/import-products.ts <csv_file> [options]

Options:
  --dry-run   Validate without writing to database
  --update    Update existing products (default: skip)
  --help      Show this help

Example:
  npx tsx scripts/import/import-products.ts products.csv --dry-run
  npx tsx scripts/import/import-products.ts products.csv --update
		`);
		process.exit(0);
	}

	const csvPath = path.resolve(args[0]);
	const dryRun = args.includes('--dry-run');
	const update = args.includes('--update');

	// Determine database path
	const dbPath = path.resolve(__dirname, '../../data/db/sqlite/app.db');

	console.log(`[Import] CSV: ${csvPath}`);
	console.log(`[Import] DB: ${dbPath}`);
	console.log(`[Import] Mode: ${dryRun ? 'dry-run' : update ? 'create/update' : 'create only'}`);
	console.log('');

	const result = await importProducts(csvPath, dbPath, { dryRun, update });

	if (result.errors.length > 0) {
		console.log('\nErrors:');
		result.errors.forEach(err => console.error(`  - ${err}`));
	}

	process.exit(result.success ? 0 : 1);
}

// Run if executed directly
main().catch(console.error);
