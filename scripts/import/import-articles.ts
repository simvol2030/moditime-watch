/**
 * City Articles Markdown Import Script
 *
 * Usage:
 *   npx tsx scripts/import/import-articles.ts <directory> [--dry-run] [--update]
 *
 * Options:
 *   --dry-run   Validate without writing to database
 *   --update    Update existing articles (default: skip)
 *
 * Article format:
 *   - YAML frontmatter (---)
 *   - Markdown content
 *
 * See articles/article_template.md for example format.
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// Types
interface ArticleFrontmatter {
	slug: string;
	title: string;
	city: string;
	excerpt?: string;
	image_url?: string;
	template_type?: 'standard' | 'unique' | 'variant_A' | 'variant_B';
	is_published?: boolean;
	published_at?: string;
	products?: string[];
}

interface ImportResult {
	success: boolean;
	created: number;
	updated: number;
	skipped: number;
	errors: string[];
}

interface CityRow {
	id: number;
	slug: string;
}

interface ArticleRow {
	id: number;
	slug: string;
}

interface ProductRow {
	id: number;
	slug: string;
}

// Parse YAML frontmatter from Markdown file
function parseFrontmatter(content: string): { frontmatter: ArticleFrontmatter | null; body: string } {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		return { frontmatter: null, body: content };
	}

	const yamlContent = match[1];
	const body = content.slice(match[0].length);

	// Simple YAML parser (handles basic key-value pairs and arrays)
	const frontmatter: Record<string, unknown> = {};
	let currentKey = '';
	let inArray = false;
	const arrayItems: string[] = [];

	for (const line of yamlContent.split('\n')) {
		const trimmed = line.trim();

		// Skip empty lines and comments
		if (!trimmed || trimmed.startsWith('#')) continue;

		// Check for array item
		if (trimmed.startsWith('- ') && inArray) {
			arrayItems.push(trimmed.slice(2).replace(/^["']|["']$/g, ''));
			continue;
		}

		// If we were in an array, save it
		if (inArray) {
			frontmatter[currentKey] = [...arrayItems];
			arrayItems.length = 0;
			inArray = false;
		}

		// Parse key-value pair
		const colonIndex = trimmed.indexOf(':');
		if (colonIndex === -1) continue;

		const key = trimmed.slice(0, colonIndex).trim();
		let value = trimmed.slice(colonIndex + 1).trim();

		// Check if value is empty (array follows)
		if (!value) {
			currentKey = key;
			inArray = true;
			continue;
		}

		// Remove quotes
		value = value.replace(/^["']|["']$/g, '');

		// Type conversions
		if (value === 'true') {
			frontmatter[key] = true;
		} else if (value === 'false') {
			frontmatter[key] = false;
		} else if (!isNaN(Number(value)) && value !== '') {
			frontmatter[key] = Number(value);
		} else {
			frontmatter[key] = value;
		}
	}

	// Handle trailing array
	if (inArray) {
		frontmatter[currentKey] = arrayItems;
	}

	return {
		frontmatter: frontmatter as unknown as ArticleFrontmatter,
		body
	};
}

// Convert Markdown to HTML (basic implementation)
function markdownToHtml(markdown: string): string {
	let html = markdown;

	// Headers
	html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
	html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
	html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

	// Bold and italic
	html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
	html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

	// Links
	html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

	// Blockquotes
	html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

	// Unordered lists
	html = html.replace(/^\s*[-*] (.*$)/gm, '<li>$1</li>');
	html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

	// Paragraphs
	html = html.replace(/\n\n+/g, '</p>\n\n<p>');
	if (!html.startsWith('<')) {
		html = '<p>' + html;
	}
	if (!html.endsWith('>')) {
		html = html + '</p>';
	}

	// Clean up empty paragraphs
	html = html.replace(/<p>\s*<\/p>/g, '');
	html = html.replace(/<p>\s*<(h[1-6]|ul|ol|blockquote)/g, '<$1');
	html = html.replace(/<\/(h[1-6]|ul|ol|blockquote)>\s*<\/p>/g, '</$1>');

	return html.trim();
}

// Validate frontmatter
function validateFrontmatter(fm: ArticleFrontmatter | null, filename: string): string[] {
	const errors: string[] = [];

	if (!fm) {
		errors.push(`${filename}: Missing YAML frontmatter`);
		return errors;
	}

	if (!fm.slug) errors.push(`${filename}: slug is required`);
	if (!fm.title) errors.push(`${filename}: title is required`);
	if (!fm.city) errors.push(`${filename}: city is required`);

	if (fm.slug && !/^[a-z0-9-]+$/.test(fm.slug)) {
		errors.push(`${filename}: slug must be lowercase alphanumeric with dashes`);
	}

	if (fm.template_type && !['standard', 'unique', 'variant_A', 'variant_B'].includes(fm.template_type)) {
		errors.push(`${filename}: template_type must be one of: standard, unique, variant_A, variant_B`);
	}

	return errors;
}

// Main import function
export async function importArticles(
	directory: string,
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

	// Check directory exists
	if (!fs.existsSync(directory)) {
		result.errors.push(`Directory not found: ${directory}`);
		return result;
	}

	// Find all .md files
	const files = fs.readdirSync(directory)
		.filter(f => f.endsWith('.md') && !f.startsWith('_'))
		.map(f => path.join(directory, f));

	if (files.length === 0) {
		result.errors.push('No Markdown files found in directory');
		return result;
	}

	console.log(`[Import] Found ${files.length} Markdown files`);

	// Parse all files first
	const articles: { file: string; frontmatter: ArticleFrontmatter; html: string }[] = [];

	for (const file of files) {
		const content = fs.readFileSync(file, 'utf-8');
		const { frontmatter, body } = parseFrontmatter(content);

		const validationErrors = validateFrontmatter(frontmatter, path.basename(file));
		if (validationErrors.length > 0) {
			result.errors.push(...validationErrors);
			continue;
		}

		const html = markdownToHtml(body);
		articles.push({ file, frontmatter: frontmatter!, html });
	}

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
	const getCityBySlug = db.prepare('SELECT id, slug FROM cities WHERE slug = ? AND is_active = 1');
	const getArticleBySlug = db.prepare('SELECT id, slug FROM city_articles WHERE city_id = ? AND slug = ?');
	const getProductBySlug = db.prepare('SELECT id, slug FROM products WHERE slug = ? AND is_active = 1');

	const insertArticle = db.prepare(`
		INSERT INTO city_articles (
			city_id, slug, title, excerpt, content, image_url,
			template_type, is_published, published_at, source_file, imported_at,
			created_at, updated_at
		) VALUES (
			?, ?, ?, ?, ?, ?,
			?, ?, ?, ?, datetime('now'),
			datetime('now'), datetime('now')
		)
	`);

	const updateArticle = db.prepare(`
		UPDATE city_articles SET
			title = ?, excerpt = ?, content = ?, image_url = ?,
			template_type = ?, is_published = ?, published_at = ?,
			source_file = ?, imported_at = datetime('now'),
			updated_at = datetime('now')
		WHERE id = ?
	`);

	const insertArticleProduct = db.prepare(`
		INSERT OR IGNORE INTO city_article_products (article_id, product_id, position)
		VALUES (?, ?, ?)
	`);

	const deleteArticleProducts = db.prepare('DELETE FROM city_article_products WHERE article_id = ?');

	// Process in transaction
	const transaction = db.transaction(() => {
		for (const { file, frontmatter: fm, html } of articles) {
			try {
				// Lookup city
				const city = getCityBySlug.get(fm.city) as CityRow | undefined;
				if (!city) {
					result.errors.push(`${path.basename(file)}: city "${fm.city}" not found`);
					continue;
				}

				// Check if article exists
				const existingArticle = getArticleBySlug.get(city.id, fm.slug) as ArticleRow | undefined;

				// Prepare values
				const isPublished = fm.is_published !== false ? 1 : 0;
				const publishedAt = fm.published_at || null;
				const templateType = fm.template_type || 'standard';

				let articleId: number;

				if (existingArticle) {
					if (options.update) {
						updateArticle.run(
							fm.title,
							fm.excerpt || null,
							html,
							fm.image_url || null,
							templateType,
							isPublished,
							publishedAt,
							file,
							existingArticle.id
						);
						articleId = existingArticle.id;
						result.updated++;
						console.log(`[Import] Updated: ${fm.slug}`);
					} else {
						result.skipped++;
						console.log(`[Import] Skipped (exists): ${fm.slug}`);
						continue;
					}
				} else {
					const insertResult = insertArticle.run(
						city.id,
						fm.slug,
						fm.title,
						fm.excerpt || null,
						html,
						fm.image_url || null,
						templateType,
						isPublished,
						publishedAt,
						file
					);
					articleId = Number(insertResult.lastInsertRowid);
					result.created++;
					console.log(`[Import] Created: ${fm.slug}`);
				}

				// Link products
				if (fm.products && fm.products.length > 0) {
					if (existingArticle && options.update) {
						deleteArticleProducts.run(articleId);
					}

					fm.products.forEach((productSlug, index) => {
						const product = getProductBySlug.get(productSlug) as ProductRow | undefined;
						if (product) {
							insertArticleProduct.run(articleId, product.id, index);
						} else {
							console.log(`[Import] Warning: product "${productSlug}" not found`);
						}
					});
				}

			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				result.errors.push(`Error processing ${path.basename(file)}: ${message}`);
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
City Articles Markdown Import

Usage:
  npx tsx scripts/import/import-articles.ts <directory> [options]

Options:
  --dry-run   Validate without writing to database
  --update    Update existing articles (default: skip)
  --help      Show this help

Example:
  npx tsx scripts/import/import-articles.ts ./articles/moscow --dry-run
  npx tsx scripts/import/import-articles.ts ./articles --update
		`);
		process.exit(0);
	}

	const directory = path.resolve(args[0]);
	const dryRun = args.includes('--dry-run');
	const update = args.includes('--update');

	// Determine database path
	const dbPath = path.resolve(__dirname, '../../data/db/sqlite/app.db');

	console.log(`[Import] Directory: ${directory}`);
	console.log(`[Import] DB: ${dbPath}`);
	console.log(`[Import] Mode: ${dryRun ? 'dry-run' : update ? 'create/update' : 'create only'}`);
	console.log('');

	const result = await importArticles(directory, dbPath, { dryRun, update });

	if (result.errors.length > 0) {
		console.log('\nErrors:');
		result.errors.forEach(err => console.error(`  - ${err}`));
	}

	process.exit(result.success ? 0 : 1);
}

// Run if executed directly
main().catch(console.error);
