# Research: Change-2 — Image fallback для 404

## Текущее состояние
- ProductGallery.svelte: img без onerror → 404 ошибки в консоли
- ProductCard.svelte: img без onerror → 404 ошибки в консоли
- Seed использует `/images/products/product-N-M.jpg` — файлов нет

## Решение
- Добавить onerror handler на все img теги
- При ошибке заменять src на inline SVG data URI (gradient + watch icon)
- Стиль placeholder: gradient из проектных цветов

## Файлы
- `ProductGallery.svelte` — main image + thumbnails
- `ProductCard.svelte` — card image
