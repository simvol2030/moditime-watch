import AdmZip from 'adm-zip';
import { processImage } from '$lib/server/media/image-processor';
import { saveMedia, buildFilename, type EntityType } from '$lib/server/media/storage';

export interface ZipContents {
	/** CSV file content as string */
	csvText: string;
	/** Map of original filename → processed media URL */
	imageMap: Map<string, string>;
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
				saveMedia(entity, thumbFilename, result.thumbBuffer);

				// Map both the full entry name and just the basename
				imageMap.set(entry.entryName, url);
				imageMap.set(basename, url);
			} catch {
				// Skip images that fail to process
			}
		}
	}

	return { csvText, imageMap };
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
			if (value && imageMap.has(value)) {
				resolved[col] = imageMap.get(value)!;
			}
			// Handle pipe-separated values (gallery_images)
			if (value && value.includes('|')) {
				resolved[col] = value
					.split('|')
					.map(v => imageMap.get(v.trim()) || v.trim())
					.join('|');
			}
		}
		return resolved;
	});
}
