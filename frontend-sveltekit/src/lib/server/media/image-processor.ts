import sharp from 'sharp';
import { createHash } from 'crypto';

export interface ProcessedImage {
	/** WebP buffer of the main image */
	buffer: Buffer;
	/** WebP buffer of the thumbnail */
	thumbBuffer: Buffer;
	/** Content hash (first 8 chars of sha256) */
	hash: string;
	/** Original width */
	width: number;
	/** Original height */
	height: number;
}

export interface ProcessOptions {
	/** Max width for main image (default: 1200) */
	maxWidth?: number;
	/** Max height for main image (default: 1200) */
	maxHeight?: number;
	/** Thumbnail width (default: 300) */
	thumbWidth?: number;
	/** Thumbnail height (default: 300) */
	thumbHeight?: number;
	/** WebP quality 1-100 (default: 82) */
	quality?: number;
}

const DEFAULTS: Required<ProcessOptions> = {
	maxWidth: 1200,
	maxHeight: 1200,
	thumbWidth: 300,
	thumbHeight: 300,
	quality: 82
};

/**
 * Process an image buffer: resize + convert to WebP + generate thumbnail.
 * Returns both main and thumbnail buffers.
 */
export async function processImage(
	input: Buffer,
	options: ProcessOptions = {}
): Promise<ProcessedImage> {
	const opts = { ...DEFAULTS, ...options };

	// Get metadata first
	const metadata = await sharp(input).metadata();
	const width = metadata.width ?? 0;
	const height = metadata.height ?? 0;

	// Main image: resize if larger than max, convert to WebP
	const mainBuffer = await sharp(input)
		.resize(opts.maxWidth, opts.maxHeight, {
			fit: 'inside',
			withoutEnlargement: true
		})
		.webp({ quality: opts.quality })
		.toBuffer();

	// Thumbnail: resize to cover, convert to WebP
	const thumbBuffer = await sharp(input)
		.resize(opts.thumbWidth, opts.thumbHeight, {
			fit: 'cover',
			position: 'centre'
		})
		.webp({ quality: Math.min(opts.quality, 75) })
		.toBuffer();

	// Content hash from original input
	const hash = createHash('sha256').update(input).digest('hex').slice(0, 8);

	return { buffer: mainBuffer, thumbBuffer, hash, width, height };
}

/** Supported MIME types for upload */
export const ALLOWED_MIME_TYPES = new Set([
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
	'image/avif'
]);

/** Max file size: 10 MB */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Validate an uploaded image file.
 * Returns null if valid, or an error message string.
 */
export function validateImage(file: File): string | null {
	if (!file || file.size === 0) {
		return 'No file provided';
	}
	if (file.size > MAX_IMAGE_SIZE) {
		return `File exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit`;
	}
	if (!ALLOWED_MIME_TYPES.has(file.type)) {
		return `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF, AVIF`;
	}
	return null;
}
