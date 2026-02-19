# Сборки Layout

> Layout = Header + Footer. Каждый шаблон страницы указывает свой layout.
> Если header или footer не нужен — указать "нет".

| Название | Header | Footer | Используется в шаблонах |
|----------|--------|--------|------------------------|
| public   | main   | main   | homepage, catalog, product, cart, checkout, journal, search, order |
| city     | city   | city   | city-catalog, city-article, city-landing |
| admin    | (нет)  | (нет)  | dashboard, products, brands, categories, import, settings, homepage-mgmt |

Примечания:
- **admin** layout использует боковую панель (sidebar) вместо header/footer
- **city** layout — упрощённый вариант для pSEO страниц городов
- **public** — основной layout для всех публичных страниц
