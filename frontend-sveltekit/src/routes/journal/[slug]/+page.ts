import type { PageLoad } from './$types';
import type { ArticlePageData } from '$lib/types/article';

export const load: PageLoad = async ({ params }) => {
    const slug = params.slug;

    // Mock data - in real app this would come from DB/API based on slug
    const articleData: ArticlePageData = {
        article: {
            id: '1',
            title: 'Наследие Rolex Submariner: от дайверов до коллекционеров',
            subtitle:
                'Разбираем ключевые референсы, которые формируют коллекционную ценность модели, и рассказываем, на что смотреть при покупке.',
            date: '20.11.2024',
            author: {
                name: 'Александр Волков',
                role: 'Часовой эксперт',
                avatar: 'https://picsum.photos/seed/author/64/64'
            },
            image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080',
            tags: ['Rolex', 'История', 'Инвестиции'],
            content: `
				<p>Rolex Submariner — это не просто часы, это икона. С момента своего появления в 1953 году они стали эталоном дайверских часов и объектом желания коллекционеров по всему миру.</p>
				
				<h3>Эволюция дизайна</h3>
				<p>Первые модели Submariner были утилитарными инструментами. Отсутствие защиты заводной головки, плексигласовое стекло и алюминиевая вставка безеля — эти черты сегодня ценятся коллекционерами винтажа.</p>
				
				<p>С переходом на керамические безели Cerachrom и корпуса Maxi Case, Rolex сделал Submariner более роскошным, сохранив при этом его ДНК.</p>

				<h3>Инвестиционный потенциал</h3>
				<p>Модели "Hulk" (ref. 116610LV) и "Kermit" (ref. 16610LV) показали феноменальный рост стоимости за последние 5 лет. Редкость и цвет делают их желанными лотами на аукционах.</p>
			`
        },
        seo: {
            title: 'Наследие Rolex Submariner — Журнал Moditimewatch',
            description:
                'Полный гид по истории Rolex Submariner. Инвестиционные модели, редкие референсы и советы экспертов.',
            canonical: `https://moditimewatch.com/journal/${slug}`,
            openGraph: {
                type: 'article',
                image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080'
            }
        },
        relatedProducts: [
            {
                id: 'rolex-submariner',
                brand: 'Rolex',
                name: 'Submariner Date',
                price: '1 450 000 ₽',
                image: 'https://picsum.photos/seed/watch-sub/360/440'
            },
            {
                id: 'rolex-gmt',
                brand: 'Rolex',
                name: 'GMT-Master II "Pepsi"',
                price: '2 100 000 ₽',
                image: 'https://picsum.photos/seed/watch-gmt/360/440'
            }
        ]
    };

    return {
        ...articleData
    };
};
