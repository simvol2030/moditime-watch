import AdmZip from 'adm-zip';
import { processImage } from '$lib/server/media/image-processor';
import { saveMedia, buildFilename, type EntityType } from '$lib/server/media/storage';

export interface ZipContents {
	/** CSV file content as string */
	csvText: string;
	/** Map of original filename → processed media URL */
	imageMap: Map<string, string>;
	/** Map of original filename → thumbnail URL */
	thumbMap: Map<string, string>;
	/** Actual number of unique images successfully processed */
	imageCount: number;
	/** Errors encountered during image processing */
	imageErrors: string[];
}

/**
 * Extract a ZIP file containing a CSV and optional images.
 * Expected ZIP structure:
 *   data.csv (or any .csv file)
 *   images/
 *     image1.jpg
 *     image2.png
 *     ...
 *
 * Images are processed through sharp (WebP conversion) and saved to media storage.
 * Returns CSV text + a map from original image filenames to their new media URLs.
 */
export async function extractZipImport(
	zipBuffer: Buffer,
	entity: EntityType,
	options?: { requireCsv?: boolean }
): Promise<ZipContents> {
	const zip = new AdmZip(zipBuffer);
	const entries = zip.getEntries();

	let csvText = '';
	const imageMap = new Map<string, string>();
	const thumbMap = new Map<string, string>();
	let imageCount = 0;
	const imageErrors: string[] = [];

	// Find CSV file (first .csv file found)
	for (const entry of entries) {
		if (entry.isDirectory) continue;
		const name = entry.entryName.toLowerCase();
		if (name.endsWith('.csv') && !csvText) {
			csvText = entry.getData().toString('utf-8');
		}
	}

	if (!csvText && options?.requireCsv !== false) {
		throw new Error('No CSV file found in ZIP archive');
	}

	// Process image files
	for (const entry of entries) {
		if (entry.isDirectory) continue;
		const name = entry.entryName.toLowerCase();
		const basename = entry.entryName.split('/').pop() || '';

		// Check if this is an image file
		if (/\.(jpg|jpeg|png|webp|gif|avif|tiff|tif|bmp|svg)$/i.test(name)) {
			try {
				const imageBuffer = entry.getData();
				const result = await processImage(imageBuffer);

				// Use original filename (without extension) as slug
				const slug = basename.replace(/\.[^.]+$/, '');
				const mainFilename = buildFilename(slug, result.hash);
				const thumbFilename = buildFilename(slug, result.hash, '-thumb');

				const url = saveMedia(entity, mainFilename, result.buffer);
				const thumbUrl = saveMedia(entity, thumbFilename, result.thumbBuffer);

				// Map by: full entry name, basename, and basename without extension
				// This allows matching by numeric ID (e.g., "17156" → "17156.jpg")
				imageMap.set(entry.entryName, url);
				imageMap.set(basename, url);
				imageMap.set(slug, url);
				thumbMap.set(entry.entryName, thumbUrl);
				thumbMap.set(basename, thumbUrl);
				thumbMap.set(slug, thumbUrl);
				imageCount++;
			} catch (err) {
				const msg = `Failed to process image "${basename}": ${err instanceof Error ? err.message : 'Unknown error'}`;
				imageErrors.push(msg);
				console.error('[ZIP Import]', msg);
			}
		}
	}

	return { csvText, imageMap, thumbMap, imageCount, imageErrors };
}

/**
 * Extract only images from a ZIP (no CSV extraction).
 * Used when images ZIP is uploaded separately from CSV.
 * Returns image count only (for preview stats). Full processing uses extractZipImport.
 */
export async function extractZipImages(
	zipBuffer: Buffer
): Promise<{ imageCount: number; filenames: string[] }> {
	const zip = new AdmZip(zipBuffer);
	const entries = zip.getEntries();
	const filenames: string[] = [];

	for (const entry of entries) {
		if (entry.isDirectory) continue;
		const name = entry.entryName.toLowerCase();
		if (/\.(jpg|jpeg|png|webp|gif|avif|tiff|tif|bmp|svg)$/i.test(name)) {
			const basename = entry.entryName.split('/').pop() || '';
			filenames.push(basename);
		}
	}

	return { imageCount: filenames.length, filenames };
}

/**
 * Find gallery images in imageMap by base ID with suffixes _2, _3, _02, _03, etc.
 * Example: baseId="17503" → finds "17503_2.jpg", "17503_3.jpg" → returns their URLs
 */
export function resolveGalleryFromZip(
	baseId: string,
	imageMap: Map<string, string>
): string[] {
	const base = baseId.replace(/\.[^.]+$/, ''); // strip extension if present
	if (!base) return [];

	const gallery: string[] = [];

	// Check suffixes _2.._20 and _02.._09
	for (let i = 2; i <= 20; i++) {
		const suffixes = [`${base}_${i}`, `${base}_${String(i).padStart(2, '0')}`];

		for (const suffix of suffixes) {
			// Try with various extensions in imageMap
			if (imageMap.has(suffix)) {
				gallery.push(imageMap.get(suffix)!);
				break;
			}
			// Try with extensions
			for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
				const key = `${suffix}.${ext}`;
				if (imageMap.has(key)) {
					gallery.push(imageMap.get(key)!);
					break;
				}
			}
		}
	}

	return gallery;
}

/** Image extensions for fuzzy matching */
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'tiff', 'tif', 'bmp', 'svg'];

/**
 * Fuzzy-match a value against imageMap.
 * Tries: exact match, trimmed, case-insensitive, numeric ID with extensions, with images/ prefix.
 */
function fuzzyImageMatch(value: string, imageMap: Map<string, string>): string | undefined {
	const trimmed = value.trim();
	if (!trimmed) return undefined;

	// 1. Exact match
	if (imageMap.has(trimmed)) return imageMap.get(trimmed);

	// 2. Case-insensitive fallback
	const lower = trimmed.toLowerCase();
	for (const [key, url] of imageMap) {
		if (key.toLowerCase() === lower) return url;
	}

	// 3. If value looks like a numeric ID, try with extensions
	if (/^\d+$/.test(trimmed)) {
		for (const ext of IMAGE_EXTENSIONS) {
			const withExt = `${trimmed}.${ext}`;
			if (imageMap.has(withExt)) return imageMap.get(withExt);
			// Try with images/ prefix
			const withPrefix = `images/${withExt}`;
			if (imageMap.has(withPrefix)) return imageMap.get(withPrefix);
		}
	}

	// 4. Try without extension (matches the slug key we added above)
	const withoutExt = trimmed.replace(/\.[^.]+$/, '');
	if (withoutExt !== trimmed && imageMap.has(withoutExt)) {
		return imageMap.get(withoutExt);
	}

	return undefined;
}

/**
 * Replace image references in CSV rows with processed media URLs.
 * Supports fuzzy matching: numeric IDs, case-insensitive, extension variants.
 * Auto-discovers gallery images with _2, _3 suffixes in ZIP.
 */
export function resolveImageReferences(
	rows: Record<string, string>[],
	imageMap: Map<string, string>,
	imageColumns: string[]
): Record<string, string>[] {
	return rows.map(row => {
		const resolved = { ...row };
		for (const col of imageColumns) {
			const value = resolved[col];
			if (!value) continue;

			// Skip values that are already resolved URLs (start with /media/)
			if (value.startsWith('/media/')) continue;

			// Handle pipe-separated values (gallery_images)
			if (value.includes('|')) {
				resolved[col] = value
					.split('|')
					.map(v => {
						const trimmed = v.trim();
						if (trimmed.startsWith('/media/')) return trimmed;
						return fuzzyImageMatch(trimmed, imageMap) || trimmed;
					})
					.join('|');
			} else {
				// Single value — fuzzy match
				const matched = fuzzyImageMatch(value, imageMap);
				if (matched) {
					resolved[col] = matched;
				}
			}
		}

		// Auto-discover gallery images from ZIP using _2, _3 suffixes
		// Only if main_image was resolved and gallery_images is empty or not present
		if (resolved.main_image && !resolved.gallery_images) {
			// Get the base ID from the original main_image value (before resolution)
			const originalMainImage = row.main_image || '';
			const baseId = originalMainImage.replace(/\.[^.]+$/, ''); // strip extension
			if (baseId) {
				const galleryUrls = resolveGalleryFromZip(baseId, imageMap);
				if (galleryUrls.length > 0) {
					resolved.gallery_images = galleryUrls.join('|');
				}
			}
		}

		return resolved;
	});
}
