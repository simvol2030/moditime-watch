# Testing Guide - UI Kit Components

## Локальная проверка

Запусти dev server:
```bash
cd C:\dev\watch\project-box-v2\frontend-sveltekit
npm run dev
```

Открой http://localhost:5173 - увидишь демо всех UI компонентов.

---

## Проверка в Svelte Playground

Для проверки в https://svelte.dev/playground/ скопируй компоненты по одному:

### 1. Button.svelte

Создай файл `Button.svelte` в playground и вставь содержимое из:
```
src/lib/components/ui/Button.svelte
```

Затем в `App.svelte`:

```svelte
<script>
	import Button from './Button.svelte';
</script>

<div style="padding: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
	<Button variant="primary">Primary</Button>
	<Button variant="ghost">Ghost</Button>
	<Button variant="light">Light</Button>
	<Button size="small">Small</Button>
	<Button size="large">Large</Button>
	<Button disabled>Disabled</Button>
	<Button href="#link">As Link</Button>
</div>
```

---

### 2. IconButton.svelte

Создай файл `IconButton.svelte` и вставь содержимое из:
```
src/lib/components/ui/IconButton.svelte
```

В `App.svelte` добавь SVG sprite в `<svelte:head>` (строки 15-28 из src/routes/+page.svelte)

Затем:
```svelte
<script>
	import IconButton from './IconButton.svelte';
</script>

<svelte:head>
	<svg style="display: none;">
		<symbol id="icon-search" viewBox="0 0 24 24">
			<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
		</symbol>
		<symbol id="icon-heart" viewBox="0 0 24 24">
			<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
		</symbol>
		<symbol id="icon-cart" viewBox="0 0 24 24">
			<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
		</symbol>
	</svg>
</svelte:head>

<div style="padding: 2rem; display: flex; gap: 1rem;">
	<IconButton icon="search" label="Search" />
	<IconButton icon="heart" label="Favorites" badge={5} />
	<IconButton icon="cart" label="Cart" badge={12} />
	<IconButton icon="cart" label="Cart" badge={150} />
</div>
```

---

### 3. Chip.svelte

Создай файл `Chip.svelte` и вставь содержимое из:
```
src/lib/components/ui/Chip.svelte
```

В `App.svelte`:
```svelte
<script>
	import Chip from './Chip.svelte';

	let selectedChip = $state('classic');
	let chips = $state(['classic', 'sport', 'dress', 'casual']);

	function removeChip(chip) {
		chips = chips.filter(c => c !== chip);
	}
</script>

<div style="padding: 2rem;">
	<div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
		<Chip>Default</Chip>
		<Chip variant="primary">Primary</Chip>
		<Chip selected>Selected</Chip>
	</div>

	<div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
		{#each ['classic', 'sport', 'dress', 'casual'] as style}
			<Chip
				selected={selectedChip === style}
				onclick={() => selectedChip = style}
			>
				{style}
			</Chip>
		{/each}
	</div>
	<p>Selected: <strong>{selectedChip}</strong></p>

	<div style="display: flex; gap: 1rem;">
		{#each chips as chip}
			<Chip removable onremove={() => removeChip(chip)}>
				{chip}
			</Chip>
		{/each}
	</div>
</div>
```

---

### 4. Container.svelte

Создай файл `Container.svelte` и вставь содержимое из:
```
src/lib/components/ui/Container.svelte
```

В `App.svelte`:
```svelte
<script>
	import Container from './Container.svelte';
</script>

<Container>
	<div style="padding: 2rem; background: #f5f5f5; border: 2px dashed #ccc;">
		<h1>Container Component</h1>
		<p>This content is centered with max-width and responsive padding.</p>
		<p>Resize the browser to see the responsive behavior.</p>
	</div>
</Container>
```

---

## Что проверять:

### Button
- ✅ Все варианты: primary, ghost, light
- ✅ Все размеры: small, medium, large
- ✅ Работает как ссылка (href)
- ✅ Disabled state
- ✅ Hover эффекты

### IconButton
- ✅ Иконки отображаются
- ✅ Badge показывается корректно
- ✅ Badge > 99 показывает "99+"
- ✅ Hover эффекты
- ✅ aria-label для доступности

### Chip
- ✅ Варианты: default, primary
- ✅ Selected state
- ✅ Интерактивность (клик меняет selected)
- ✅ Кнопка удаления работает
- ✅ Hover эффекты

### Container
- ✅ Max-width ограничение
- ✅ Центрирование контента
- ✅ Responsive padding
- ✅ Адаптивность на разных экранах

---

---

### 5. Rating.svelte

Создай файл `Rating.svelte` и вставь содержимое из:
```
src/lib/components/ui/Rating.svelte
```

В `App.svelte`:
```svelte
<script>
	import Rating from './Rating.svelte';
</script>

<div style="padding: 2rem;">
	<div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
		<Rating value={4.9} count={142} />
		<Rating value={3.5} count={28} />
		<Rating value={5} count={1} />
	</div>

	<div style="display: flex; gap: 2rem;">
		<Rating value={4.5} />
		<Rating value={2.7} showValue={false} />
	</div>
</div>
```

---

### 6. SectionIntro.svelte

Создай файл `SectionIntro.svelte` и вставь содержимое из:
```
src/lib/components/ui/SectionIntro.svelte
```

В `App.svelte`:
```svelte
<script>
	import SectionIntro from './SectionIntro.svelte';
</script>

<div style="padding: 2rem;">
	<SectionIntro
		eyebrow="Коллекции"
		title="Кураторские подборки"
		description="Тематические подборки премиальных часов от наших экспертов"
	/>

	<SectionIntro
		align="center"
		eyebrow="Бестселлеры"
		title="Топ недели"
		description="Самые популярные модели этой недели"
	/>
</div>
```

---

### 7. Stat.svelte

Создай файл `Stat.svelte` и вставь содержимое из:
```
src/lib/components/ui/Stat.svelte
```

В `App.svelte`:
```svelte
<script>
	import Stat from './Stat.svelte';
</script>

<div style="padding: 2rem; display: flex; gap: 3rem;">
	<Stat label="Моделей в наличии" value="1000+" />
	<Stat label="Довольных клиентов" value="5000+" />
	<Stat label="Лет на рынке" value="10+" />
</div>
```

---

### 8. ThemeToggle.svelte

Создай файл `ThemeToggle.svelte` и вставь содержимое из:
```
src/lib/components/ui/ThemeToggle.svelte
```

В `App.svelte`:
```svelte
<script>
	import ThemeToggle from './ThemeToggle.svelte';
</script>

<div style="padding: 2rem; display: flex; gap: 1rem;">
	<ThemeToggle />
	<ThemeToggle compact />
</div>
```

---

## Что проверять (новые компоненты):

### Rating
- ✅ Полные звезды отображаются
- ✅ Половинки звезд для дробных значений
- ✅ Счетчик отзывов
- ✅ Опция showValue работает
- ✅ aria-label для доступности

### SectionIntro
- ✅ Eyebrow (надзаголовок) отображается
- ✅ Заголовок и описание
- ✅ Выравнивание: left, center, right
- ✅ Опциональные поля работают
- ✅ Адаптивные шрифты

### Stat
- ✅ Значение и метка отображаются
- ✅ Типографика (разные шрифты)
- ✅ Адаптивность

### ThemeToggle
- ✅ Переключение светлая/темная тема
- ✅ Сохранение в localStorage
- ✅ Компактный режим
- ✅ Анимация иконок
- ✅ aria-pressed для доступности

---

## Обнаруженные проблемы

Если найдешь баги или хочешь изменения - дай фидбэк с указанием:
1. Компонент
2. Проблема
3. Ожидаемое поведение

Тогда исправим и пойдем дальше!
