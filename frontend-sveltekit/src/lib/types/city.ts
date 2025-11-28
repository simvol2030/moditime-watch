import type { SeoProps } from './seo';

export interface CityPageData {
    city: {
        slug: string;
        name: string; // e.g. "Москва"
        nameGenitive: string; // e.g. "Москвы"
        namePrepositional: string; // e.g. "Москве"
    };
    seo: SeoProps;
    hero: {
        title: string;
        subtitle: string;
        image: string;
    };
    delivery: {
        days: number;
        price: string;
    };
    articles: CityArticle[];
}

export interface CityArticle {
    id: string;
    title: string;
    excerpt: string;
    image: string;
    slug: string;
    date: string;
}
