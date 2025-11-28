import type { SeoProps } from './seo';

export interface ArticlePageData {
    article: {
        id: string;
        title: string;
        subtitle: string;
        date: string;
        author: {
            name: string;
            role: string;
            avatar: string;
        };
        image: string;
        content: string; // HTML content
        tags: string[];
    };
    seo: SeoProps;
    relatedProducts: RelatedProduct[];
}

export interface RelatedProduct {
    id: string;
    brand: string;
    name: string;
    price: string;
    image: string;
}
