# Hero Component Documentation

**Дата создания**: 2025-01-19
**Компонент**: HeroMain.svelte
**Источник**: yurgid/project-box-v3-orm/frontend-sveltekit-v2-reserv
**Svelte версия**: 5.x
**Статус**: ✅ Готов к переносу

---

## 📋 Описание

Hero секция - главный баннер сайта с заголовком, подзаголовком, описанием, кнопками CTA и опциональными features. Поддерживает фоновые изображения с overlay, различные варианты высоты, выравнивания и цветовых схем.

---

## 🎯 Функциональность

### Основные возможности:
- ✅ Фоновое изображение с настраиваемым overlay
- ✅ Три варианта высоты: full (100vh), medium (500px), small (300px)
- ✅ Три варианта выравнивания: left, center, right
- ✅ Две цветовые схемы: white text, dark text
- ✅ Динамические CTA кнопки (primary/secondary)
- ✅ Опциональные features с иконками
- ✅ Полностью responsive

---

## 📐 HTML Структура

```html
<section class="hero-main [модификаторы]" style="background-image: ...">
  <div class="hero-main__container">
    <div class="hero-main__content">
      <!-- Заголовок (обязательно) -->
      <h1 class="hero-main__title">{title}</h1>

      <!-- Подзаголовок (опционально) -->
      {#if subtitle}
        <p class="hero-main__subtitle">{subtitle}</p>
      {/if}

      <!-- Описание (опционально) -->
      {#if description}
        <p class="hero-main__description">{description}</p>
      {/if}

      <!-- CTA кнопки (опционально) -->
      {#if cta_buttons}
        <div class="hero-main__actions">
          {#each cta_buttons as button}
            <a href={button.href} class="hero-main__btn hero-main__btn--{style}">
              {button.text}
            </a>
          {/each}
        </div>
      {/if}

      <!-- Features (опционально) -->
      {#if features}
        <div class="hero-main__features">
          {#each features as feature}
            <div class="hero-main__feature">
              <span class="hero-main__feature-icon">✓</span>
              <span class="hero-main__feature-text">{feature.text}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</section>
```

---

## 🎨 CSS Классы

### Основные классы:
- `.hero-main` - корневой элемент секции
- `.hero-main__container` - контейнер с max-width
- `.hero-main__content` - контент область (max-width: 800px)
- `.hero-main__title` - заголовок h1
- `.hero-main__subtitle` - подзаголовок
- `.hero-main__description` - описание
- `.hero-main__actions` - контейнер кнопок CTA
- `.hero-main__btn` - базовый класс кнопки
- `.hero-main__btn--primary` - первичная кнопка
- `.hero-main__btn--secondary` - вторичная кнопка
- `.hero-main__features` - контейнер features
- `.hero-main__feature` - отдельный feature
- `.hero-main__feature-icon` - иконка feature
- `.hero-main__feature-text` - текст feature

### Модификаторы высоты:
- `.hero-main--full` - полная высота экрана (100vh - 50px)
- `.hero-main--medium` - средняя высота (500px)
- `.hero-main--small` - малая высота (300px)

### Модификаторы выравнивания:
- `.hero-main--align-left` - выравнивание влево
- `.hero-main--align-center` - выравнивание по центру (default)
- `.hero-main--align-right` - выравнивание вправо

### Модификаторы цвета:
- `.hero-main--text-white` - белый текст для темного фона
- (default) - темный текст для светлого фона

---

## 💾 TypeScript Интерфейсы

```typescript
export interface HeroBackground {
	type: 'image' | 'gradient' | 'solid';
	src?: string;
	alt?: string;
	overlay?: number; // 0-1, default 0.3
}

export interface HeroButton {
	text: string;
	href: string;
	style: 'primary' | 'secondary';
}

export interface HeroFeature {
	icon: string;
	text: string;
}

export interface HeroStyle {
	height: 'full' | 'medium' | 'small';
	alignment: 'left' | 'center' | 'right';
	text_color: 'white' | 'dark';
}

export interface HeroContent {
	title: string;
	subtitle?: string | null;
	description?: string;
	background?: HeroBackground;
	cta_buttons?: HeroButton[];
	features?: HeroFeature[];
	style: HeroStyle;
}
```

---

## ⚡ Svelte 5 Особенности

### $props()
```typescript
let { content }: { content: HeroContent } = $props();
```

### $derived()
```typescript
// Динамический background style
let backgroundStyle = $derived(
	content.background?.type === 'image' && content.background.src
		? `background-image: linear-gradient(...), url('${content.background.src}');`
		: ''
);

// Динамические классы
let heightClass = $derived(/* ... */);
let alignmentClass = $derived(/* ... */);
let textColorClass = $derived(/* ... */);
```

---

## 🎯 Адаптация под проект часов

### Текстовый контент для Moditimewatch:
```typescript
const heroContent: HeroContent = {
	title: 'Эксклюзивные часы премиум-класса',
	subtitle: 'Доставка роскошных часов по всему миру',
	description: 'Rolex, Patek Philippe, Omega и другие легендарные бренды',
	background: {
		type: 'image',
		src: '/images/hero-watches.jpg',
		overlay: 0.4
	},
	cta_buttons: [
		{ text: 'Смотреть каталог', href: '#catalog', style: 'primary' },
		{ text: 'Консультация', href: '#contact', style: 'secondary' }
	],
	features: [
		{ icon: '✓', text: 'Гарантия подлинности' },
		{ icon: '✓', text: 'Доставка по России и СНГ' },
		{ icon: '✓', text: 'Консьерж-сервис' }
	],
	style: {
		height: 'full',
		alignment: 'center',
		text_color: 'white'
	}
};
```

### Цветовая схема:
- Primary color: `var(--color-primary)` (gold/blue из дизайн-системы часов)
- Secondary color: `var(--color-secondary)`
- Text shadows: сохранить для читаемости на фоне

---

## 📱 Responsive Breakpoints

### Desktop (> 768px):
- Заголовок: 48px
- Подзаголовок: 24px
- Описание: 18px
- Кнопки: горизонтальный flex
- Features: горизонтальный flex

### Mobile (≤ 768px):
- Заголовок: 32px
- Подзаголовок: 18px
- Описание: 16px
- Кнопки: вертикальный stack
- Features: вертикальный stack
- Full height: auto (убрать 100vh)

---

## ✅ Чек-лист переноса

### Этап 1: Подготовка
- [x] Прочитан исходный компонент
- [x] Прочитаны типы
- [x] Создана документация
- [ ] Проверены глобальные CSS переменные в app.css

### Этап 2: Типы
- [ ] Создать `/src/lib/types/hero.ts`
- [ ] Скопировать все интерфейсы
- [ ] Адаптировать под проект (если нужно)

### Этап 3: Компонент
- [ ] Создать `/src/lib/components/sections/HeroMain.svelte`
- [ ] Скопировать HTML структуру
- [ ] Скопировать все CSS классы
- [ ] Скопировать логику Svelte 5
- [ ] Проверить использование $props(), $derived()
- [ ] Адаптировать цвета под дизайн-систему часов

### Этап 4: Интеграция
- [ ] Создать `/src/routes/+page.svelte`
- [ ] Импортировать HeroMain
- [ ] Создать тестовый heroContent
- [ ] Проверить отображение
- [ ] Проверить responsive

### Этап 5: Тестирование
- [ ] Проверить все варианты height
- [ ] Проверить все варианты alignment
- [ ] Проверить обе цветовые схемы
- [ ] Проверить работу кнопок
- [ ] Проверить мобильную версию
- [ ] Проверить text shadows на фоне

---

## 🚨 Критически важно

### НЕ ЗАБЫТЬ:
1. ✅ Использовать только Svelte 5 синтаксис ($props, $derived, НЕ $:)
2. ✅ Сохранить все CSS классы без изменений
3. ✅ Сохранить структуру HTML полностью
4. ✅ Адаптировать текст под тематику часов
5. ✅ Проверить наличие глобальных CSS переменных

### Потенциальные проблемы:
- ⚠️ Отсутствие фонового изображения → использовать placeholder
- ⚠️ CSS переменные не определены → добавить в app.css
- ⚠️ Цвета не соответствуют → адаптировать под дизайн-систему

---

**Статус**: 📝 Документация готова, готов к переносу
