/**
 * JSON-LD Schema helpers for SEO
 * Use these functions to generate structured data for rich search results
 */

/**
 * Generate Product schema for product pages
 * https://schema.org/Product
 */
export function generateProductSchema(product: {
	name: string;
	description: string;
	image: string | string[];
	brand: string;
	sku?: string;
	price: number; // in kopecks
	currency?: string;
	availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
	url: string;
	reviewCount?: number;
	ratingValue?: number;
}): Record<string, unknown> {
	const priceInRubles = product.price / 100;

	return {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.name,
		description: product.description,
		image: product.image,
		brand: {
			'@type': 'Brand',
			name: product.brand
		},
		...(product.sku && { sku: product.sku }),
		offers: {
			'@type': 'Offer',
			price: priceInRubles.toFixed(2),
			priceCurrency: product.currency || 'RUB',
			availability: `https://schema.org/${product.availability || 'InStock'}`,
			url: product.url
		},
		...(product.reviewCount &&
			product.ratingValue && {
				aggregateRating: {
					'@type': 'AggregateRating',
					ratingValue: product.ratingValue,
					reviewCount: product.reviewCount,
					bestRating: 5,
					worstRating: 1
				}
			})
	};
}

/**
 * Generate Article schema for blog/journal pages
 * https://schema.org/Article
 */
export function generateArticleSchema(article: {
	headline: string;
	description: string;
	image: string | string[];
	datePublished: string; // ISO 8601 format
	dateModified?: string;
	author: string;
	publisherName?: string;
	publisherLogo?: string;
	url: string;
}): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: article.headline,
		description: article.description,
		image: article.image,
		datePublished: article.datePublished,
		dateModified: article.dateModified || article.datePublished,
		author: {
			'@type': 'Person',
			name: article.author
		},
		publisher: {
			'@type': 'Organization',
			name: article.publisherName || 'Moditimewatch',
			logo: {
				'@type': 'ImageObject',
				url: article.publisherLogo || '/logo.png'
			}
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': article.url
		}
	};
}

/**
 * Generate LocalBusiness schema for city/store pages
 * https://schema.org/LocalBusiness
 */
export function generateLocalBusinessSchema(business: {
	name: string;
	description: string;
	image?: string;
	address: {
		streetAddress: string;
		addressLocality: string; // city
		addressRegion?: string; // state/region
		postalCode?: string;
		addressCountry?: string;
	};
	telephone?: string;
	email?: string;
	url: string;
	priceRange?: string; // e.g., "₽₽₽₽"
	openingHours?: string[]; // e.g., ["Mo-Fr 10:00-20:00", "Sa 10:00-18:00"]
	geo?: {
		latitude: number;
		longitude: number;
	};
}): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		'@id': business.url,
		name: business.name,
		description: business.description,
		...(business.image && { image: business.image }),
		address: {
			'@type': 'PostalAddress',
			streetAddress: business.address.streetAddress,
			addressLocality: business.address.addressLocality,
			...(business.address.addressRegion && { addressRegion: business.address.addressRegion }),
			...(business.address.postalCode && { postalCode: business.address.postalCode }),
			addressCountry: business.address.addressCountry || 'RU'
		},
		...(business.telephone && { telephone: business.telephone }),
		...(business.email && { email: business.email }),
		url: business.url,
		...(business.priceRange && { priceRange: business.priceRange }),
		...(business.openingHours && { openingHoursSpecification: business.openingHours }),
		...(business.geo && {
			geo: {
				'@type': 'GeoCoordinates',
				latitude: business.geo.latitude,
				longitude: business.geo.longitude
			}
		})
	};
}

/**
 * Generate FAQ schema for FAQ pages or sections
 * https://schema.org/FAQPage
 */
export function generateFAQSchema(
	faqs: Array<{ question: string; answer: string }>
): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer
			}
		}))
	};
}

/**
 * Generate WebSite schema with search action
 * https://schema.org/WebSite
 */
export function generateWebSiteSchema(site: {
	name: string;
	url: string;
	searchUrl?: string; // e.g., /search?q={search_term_string}
}): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: site.name,
		url: site.url,
		...(site.searchUrl && {
			potentialAction: {
				'@type': 'SearchAction',
				target: {
					'@type': 'EntryPoint',
					urlTemplate: `${site.url}${site.searchUrl}`
				},
				'query-input': 'required name=search_term_string'
			}
		})
	};
}
