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
	entity: EntityType
): Promise<ZipContents> {
	const zip = new AdmZip(zipBuffer);
	const entries = zip.getEntries();

	let csvText = '';
	const imageMap = new Map<string, string>();
	const thumbMap = new Map<string, string>();
	const imageErrors: string[] = [];

	// Find CSV file (first .csv file found)
	for (const entry of entries) {
		if (entry.isDirectory) continue;
		const name = entry.entryName.toLowerCase();
		if (name.endsWith('.csv') && !csvText) {
			csvText = entry.getData().toString('utf-8');
		}
	}

	if (!csvText) {
		throw new Error('No CSV file found in ZIP archive');
	}

	// Process image files
	for (const entry of entries) {
		if (entry.isDirectory) continue;
		const name = entry.entryName.toLowerCase();
		const basename = entry.entryName.split('/').pop() || '';

		// Check if this is an image file
		if (/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(name)) {
			try {
				const imageBuffer = entry.getData();
				const result = await processImage(imageBuffer);

				// Use original filename (without extension) as slug
				const slug = basename.replace(/\.[^.]+$/, '');
				const mainFilename = buildFilename(slug, result.hash);
				const thumbFilename = buildFilename(slug, result.hash, '-thumb');

				const url = saveMedia(entity, mainFilename, result.buffer);
				const thumbUrl = saveMedia(entity, thumbFilename, result.thumbBuffer);

				// Map both the full entry name and just the basename
				imageMap.set(entry.entryName, url);
				imageMap.set(basename, url);
				thumbMap.set(entry.entryName, thumbUrl);
				thumbMap.set(basename, thumbUrl);
			} catch (err) {
				const msg = `Failed to process image "${basename}": ${err instanceof Error ? err.message : 'Unknown error'}`;
				imageErrors.push(msg);
				console.error('[ZIP Import]', msg);
			}
		}
	}

	return { csvText, imageMap, thumbMap, imageErrors };
}

/**
 * Replace image references in CSV rows with processed media URLs.
 * Checks columns that typically contain image URLs (ending with _url, _image, image_url, etc.)
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
						return imageMap.get(trimmed) || trimmed;
					})
					.join('|');
			} else {
				// Single value
				if (imageMap.has(value)) {
					resolved[col] = imageMap.get(value)!;
				}
			}
		}
		return resolved;
	});
}
