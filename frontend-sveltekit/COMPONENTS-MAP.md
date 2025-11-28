# Карта компонентов Moditimewatch

> Структурированная карта компонентов для миграции HTML → Svelte 5
> Дата создания: 2025-11-18

---

## 📋 Содержание

1. [Layout компоненты](#1-layout-компоненты)
2. [Виджеты (повторяющиеся блоки)](#2-виджеты-повторяющиеся-блоки)
3. [Уникальные компоненты страниц](#3-уникальные-компоненты-страниц)
4. [SEO компоненты](#4-seo-компоненты)
5. [Структура страниц](#5-структура-страниц)
6. [UI Kit компоненты](#6-ui-kit-компоненты)

---

## 1. Layout компоненты

Компоненты, которые присутствуют на всех или большинстве страниц.

### 1.1 Header (SiteHeader.svelte)

**Файл:** `src/lib/components/layout/SiteHeader.svelte`

**Структура:**
```
SiteHeader
├── Topbar (компонент)
│   ├── TopbarInfo
│   └── TopbarContacts
│       └── ThemeToggle
├── NavShell (компонент)
│   ├── SiteLogo
│   ├── SiteMenu
│   │   └── MegaPanel (для каждого пункта меню)
│   └── NavActions
│       ├── SearchButton
│       ├── FavoriteButton
│       └── CartButton
```

**Функциональность:**
- Sticky позиционирование (data-sticky)
- Mega menu при hover/focus
- Адаптивное скрытие на мобильных
- Изменение состояния при скролле

**Зависимости:**
- ThemeToggle.svelte
- MegaMenu.svelte
- IconButton.svelte

---

### 1.2 Mobile Drawer (MobileDrawer.svelte)

**Файл:** `src/lib/components/layout/MobileDrawer.svelte`

**Структура:**
```
MobileDrawer
├── MobileDrawerHeader
│   ├── Logo
│   └── CloseButton
├── MobileDrawerBody
│   ├── MobileSearch
│   ├── MobileNav
│   │   └── MobileNavGroup[] (с details/summary)
│   └── MobileServices
└── MobileDrawerFooter
    ├── Contacts
    └── Schedule
```

**Функциональность:**
- Открытие/закрытие через data-attributes
- Блокировка скролла body
- Backdrop overlay
- aria-hidden управление

**Зависимости:**
- DrawerBackdrop.svelte
- MobileNav.svelte

---

### 1.3 Search Overlay (SearchOverlay.svelte)

**Файл:** `src/lib/components/layout/SearchOverlay.svelte`

**Структура:**
```
SearchOverlay
├── SearchPanel
│   ├── SearchField
│   ├── SearchButton
│   └── CloseButton
└── SearchSuggestions
    └── Chip[] (популярные запросы)
```

**Функциональность:**
- Открытие/закрытие
- Фокус на input при открытии
- ESC для закрытия
- Популярные запросы

---

### 1.4 Footer (SiteFooter.svelte)

**Файл:** `src/lib/components/layout/SiteFooter.svelte`

**Структура:**
```
SiteFooter
├── FooterBrand
│   ├── Logo
│   └── Description
├── FooterCol[] (4 колонки)
│   ├── FooterColTitle
│   └── FooterLinks[]
└── FooterBottom
    ├── Copyright
    └── LegalLinks[]
```

**Функциональность:**
- Статическая информация
- Ссылки на разделы
- Юридическая информация

---

### 1.5 Chat Bot (ChatBot.svelte)

**Файл:** `src/lib/components/layout/ChatBot.svelte`

**Структура:**
```
ChatBot
├── ChatToggle (плавающая кнопка)
└── ChatWindow
    ├── ChatHeader
    ├── ChatMessages
    │   └── ChatMessage[]
    └── ChatInput
        ├── TextField
        └── SendButton
```

**Функциональность:**
- Открытие/закрытие окна
- Отправка сообщений
- История чата
- role="dialog", aria-modal="true"

**State:**
- `isOpen` - состояние окна
- `messages[]` - массив сообщений

---

## 2. Виджеты (повторяющиеся блоки)

Компоненты, которые используются на нескольких страницах, но не на всех.

### 2.1 Product Card (ProductCard.svelte)

**Файл:** `src/lib/components/widgets/ProductCard.svelte`

**Где используется:** index.html, catalog.html, product.html (рекомендации)

**Props:**
```typescript
interface ProductCardProps {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: number;
  badge?: {
    text: string;
    variant?: 'gold' | 'default';
  };
  inStock?: boolean;
}
```

**Структура:**
```
ProductCard
├── ProductMedia
│   ├── Image
│   └── Badge (опционально)
├── ProductMeta
│   ├── Brand
│   ├── Name
│   └── Price
└── ProductCTA
    └── Button[]
```

---

### 2.2 Collection Card (CollectionCard.svelte)

**Файл:** `src/lib/components/widgets/CollectionCard.svelte`

**Где используется:** index.html (Collections section)

**Props:**
```typescript
interface CollectionCardProps {
  image: string;
  title: string;
  description: string;
  tag: string;
  link: string;
}
```

**Структура:**
```
CollectionCard
├── Image
└── Content
    ├── Head
    │   ├── Chip (tag)
    │   └── Title
    ├── Description
    └── Link
```

---

### 2.3 Testimonial Card (TestimonialCard.svelte)

**Файл:** `src/lib/components/widgets/TestimonialCard.svelte`

**Где используется:** index.html (Testimonials section)

**Props:**
```typescript
interface TestimonialProps {
  avatar: string;
  name: string;
  position: string;
  text: string;
  watchModel?: string;
}
```

**Структура:**
```
TestimonialCard
├── Header
│   ├── Avatar
│   ├── Name
│   └── Position
├── Text
└── Footer
    └── WatchModel (опционально)
```

---

### 2.4 Editorial Card (EditorialCard.svelte)

**Файл:** `src/lib/components/widgets/EditorialCard.svelte`

**Где используется:** index.html (Editorial section), catalog.html (Insights)

**Props:**
```typescript
interface EditorialCardProps {
  image: string;
  tag: string;
  title: string;
  description: string;
  link: string;
}
```

**Структура:**
```
EditorialCard
├── Media
│   ├── Image
│   └── Tag
└── Body
    ├── Title
    ├── Description
    └── Link
```

---

### 2.5 Service Card (ServiceCard.svelte)

**Файл:** `src/lib/components/widgets/ServiceCard.svelte`

**Где используется:** index.html (Experience section), product.html (Services)

**Props:**
```typescript
interface ServiceCardProps {
  icon: string; // SVG icon name
  title: string;
  description: string;
  link?: string;
}
```

**Структура:**
```
ServiceCard
├── Icon (SVG)
├── Title
├── Description
└── Link (опционально)
```

---

### 2.6 Scroll Row (ScrollRow.svelte)

**Файл:** `src/lib/components/widgets/ScrollRow.svelte`

**Где используется:** index.html (Collections, Showcase), product.html (Recommendations)

**Props:**
```typescript
interface ScrollRowProps {
  wide?: boolean; // для широких карточек
  children: Snippet;
}
```

**Структура:**
```
ScrollRow
├── Controls
│   ├── PrevButton
│   └── NextButton
└── Inner (scrollable)
    └── {children}
```

**Функциональность:**
- Горизонтальная прокрутка
- Кнопки навигации
- Автоматическое скрытие кнопок при достижении края

---

### 2.7 Review Card (ReviewCard.svelte)

**Файл:** `src/lib/components/widgets/ReviewCard.svelte`

**Где используется:** product.html (Reviews section)

**Props:**
```typescript
interface ReviewCardProps {
  author: string;
  rating: number;
  text: string;
  deliveryInfo?: string;
  date: string;
}
```

**Структура:**
```
ReviewCard
├── Header
│   ├── Author
│   └── Rating
├── Text
└── Footer
    ├── Date
    └── DeliveryInfo (опционально)
```

---

### 2.8 Telegram CTA (TelegramCTA.svelte)

**Файл:** `src/lib/components/widgets/TelegramCTA.svelte`

**Где используется:** index.html, catalog.html, product.html

**Props:**
```typescript
interface TelegramCTAProps {
  title: string;
  description: string;
  channelLink: string;
}
```

**Структура:**
```
TelegramCTA
├── Icon (Telegram)
├── Content
│   ├── Title
│   └── Description
└── Button
```

---

## 3. Уникальные компоненты страниц

Компоненты, специфичные для конкретных страниц.

### 3.1 Главная страница (index.html)

#### 3.1.1 Hero Section (HomeHero.svelte)

**Файл:** `src/lib/components/home/HomeHero.svelte`

**Структура:**
```
HomeHero
├── HeroContent
│   ├── Title
│   ├── Description
│   ├── HeroCard
│   │   ├── Title
│   │   ├── Description
│   │   └── Button
│   └── HeroStats
│       └── Stat[] (3 статистики)
├── HeroMedia
│   └── Image
└── HeroBrands
    └── BrandLogo[] (логотипы брендов)
```

**Props:**
```typescript
interface HeroStats {
  label: string;
  value: string;
}
```

---

#### 3.1.2 Collections Section (HomeCollections.svelte)

**Файл:** `src/lib/components/home/HomeCollections.svelte`

**Структура:**
```
HomeCollections
├── SectionIntro
└── CollectionsCarousel
    └── CollectionCard[] (5 карточек)
```

**Data:**
- Массив из 5 кураторских подборок

---

#### 3.1.3 Showcase Section (HomeShowcase.svelte)

**Файл:** `src/lib/components/home/HomeShowcase.svelte`

**Структура:**
```
HomeShowcase
├── SectionIntro
└── ScrollRow
    └── ProductCard[] (8 товаров)
```

**Data:**
- Массив бестселлеров

---

#### 3.1.4 Experience Section (HomeExperience.svelte)

**Файл:** `src/lib/components/home/HomeExperience.svelte`

**Структура:**
```
HomeExperience
├── ExperienceHighlight
│   ├── SectionIntro
│   └── HighlightFeatures[]
└── ExperienceServices
    └── ServiceCard[] (3 карточки)
```

---

#### 3.1.5 Testimonials Section (HomeTestimonials.svelte)

**Файл:** `src/lib/components/home/HomeTestimonials.svelte`

**Структура:**
```
HomeTestimonials
├── SectionIntro
└── TestimonialGrid
    └── TestimonialCard[] (6 отзывов)
```

---

#### 3.1.6 Editorial Section (HomeEditorial.svelte)

**Файл:** `src/lib/components/home/HomeEditorial.svelte`

**Структура:**
```
HomeEditorial
├── SectionIntro
└── EditorialGrid
    └── EditorialCard[] (6 статей)
```

---

### 3.2 Страница каталога (catalog.html)

#### 3.2.1 Catalog Hero (CatalogHero.svelte)

**Файл:** `src/lib/components/catalog/CatalogHero.svelte`

**Структура:**
```
CatalogHero
├── Title
├── Description
└── ConsiergeForm
    ├── TextField (описание запроса)
    └── Button
```

---

#### 3.2.2 Catalog Controls (CatalogControls.svelte)

**Файл:** `src/lib/components/catalog/CatalogControls.svelte`

**Структура:**
```
CatalogControls
├── FiltersToggle (мобильная кнопка)
├── SortSelect
│   └── Select (популярность, цена, новизна)
└── ViewToggle
    ├── GridButton
    └── ListButton
```

**State:**
```typescript
let sortBy = $state('popular');
let viewMode = $state<'grid' | 'list'>('grid');
```

---

#### 3.2.3 Catalog Filters (CatalogFilters.svelte)

**Файл:** `src/lib/components/catalog/CatalogFilters.svelte`

**Структура:**
```
CatalogFilters
├── FiltersForm
│   ├── AvailabilityFilter (3 опции)
│   ├── BrandFilter (чекбоксы)
│   ├── BudgetFilter (range slider)
│   ├── MaterialFilter (чекбоксы)
│   ├── MechanismFilter (чекбоксы)
│   └── ScenariosFilter (теги)
└── FiltersActions
    ├── ResetButton
    └── ApplyButton
```

**Props для фильтров:**
```typescript
interface FilterGroup {
  title: string;
  options: FilterOption[];
}

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}
```

**State:**
```typescript
let filters = $state({
  availability: [],
  brands: [],
  budget: { min: 0, max: 1000000 },
  materials: [],
  mechanisms: [],
  scenarios: []
});
```

---

#### 3.2.4 Catalog Results (CatalogResults.svelte)

**Файл:** `src/lib/components/catalog/CatalogResults.svelte`

**Структура:**
```
CatalogResults
├── ResultsMeta
│   └── ResultsCount
├── ActiveFilters
│   └── FilterTag[] (с кнопкой удаления)
├── ResultsGrid (или List)
│   └── CatalogCard[] (карточки товаров)
└── Pagination
    └── LoadMoreButton
```

**CatalogCard расширяет ProductCard:**
```typescript
interface CatalogCardProps extends ProductCardProps {
  material?: string;
  availability?: string;
  additionalInfo?: string;
}
```

---

#### 3.2.5 Catalog Insights (CatalogInsights.svelte)

**Файл:** `src/lib/components/catalog/CatalogInsights.svelte`

**Структура:**
```
CatalogInsights
├── SectionIntro
└── InsightGrid
    └── InsightCard[] (3 статьи)
```

---

### 3.3 Страница товара (product.html)

#### 3.3.1 Product Breadcrumbs (ProductBreadcrumbs.svelte)

**Файл:** `src/lib/components/product/ProductBreadcrumbs.svelte`

**Props:**
```typescript
interface Breadcrumb {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
}
```

**Структура:**
```
Breadcrumbs
└── BreadcrumbList
    └── BreadcrumbItem[]
        ├── Link (если не current)
        └── Separator
```

---

#### 3.3.2 Product Hero (ProductHero.svelte)

**Файл:** `src/lib/components/product/ProductHero.svelte`

**Структура:**
```
ProductHero
├── ProductGallery
│   ├── GalleryStage
│   │   ├── MainImage
│   │   └── Badge
│   └── GalleryThumbs
│       └── Thumb[]
└── ProductSummary
    ├── Header
    │   ├── Title
    │   └── Rating
    ├── ProductPrice
    │   ├── Value
    │   └── InstallmentNote
    ├── ProductOptions
    │   ├── SizeOption
    │   └── PackageOption
    ├── ProductCTA
    │   ├── CheckoutButton
    │   └── ConsultButton
    ├── ProductBenefits
    │   └── Benefit[]
    └── ProductTags
        └── Chip[]
```

**ProductGallery State:**
```typescript
let currentImage = $state(0);
let images = $state<string[]>([]);
```

**ProductSummary State:**
```typescript
let selectedSize = $state('');
let selectedPackage = $state('');
```

---

#### 3.3.3 Product Highlights (ProductHighlights.svelte)

**Файл:** `src/lib/components/product/ProductHighlights.svelte`

**Структура:**
```
ProductHighlights
├── WhyChooseCard
├── WhatsIncludedCard
└── ScenariosCard
```

**Каждая карточка - отдельный компонент:**
- `HighlightCard.svelte` (базовый)

---

#### 3.3.4 Product Specs (ProductSpecs.svelte)

**Файл:** `src/lib/components/product/ProductSpecs.svelte`

**Структура:**
```
ProductSpecs
├── SectionIntro
└── SpecsGrid (4 карточки)
    ├── CaseSpecCard
    ├── MechanismSpecCard
    ├── PackageSpecCard
    └── ServiceSpecCard
```

**SpecCard Props:**
```typescript
interface SpecItem {
  label: string;
  value: string;
}

interface SpecCardProps {
  title: string;
  icon: string;
  specs: SpecItem[];
}
```

---

#### 3.3.5 Product Tabs (ProductTabs.svelte)

**Файл:** `src/lib/components/product/ProductTabs.svelte`

**Структура:**
```
ProductTabs
├── TabsList
│   ├── DescriptionTab
│   ├── DeliveryTab
│   └── DocumentsTab
└── TabsContent
    ├── DescriptionPanel
    ├── DeliveryPanel
    └── DocumentsPanel
```

**State:**
```typescript
let activeTab = $state('description');
```

---

#### 3.3.6 Product Reviews (ProductReviews.svelte)

**Файл:** `src/lib/components/product/ProductReviews.svelte`

**Структура:**
```
ProductReviews
├── SectionIntro
│   ├── Title
│   └── AverageRating
└── ReviewsGrid
    └── ReviewCard[] (3 отзыва)
```

---

#### 3.3.7 Product Recommendations (ProductRecommendations.svelte)

**Файл:** `src/lib/components/product/ProductRecommendations.svelte`

**Структура:**
```
ProductRecommendations
├── SectionIntro
└── ScrollRow
    └── ProductCard[] (5 товаров)
```

---

#### 3.3.8 Product Services (ProductServices.svelte)

**Файл:** `src/lib/components/product/ProductServices.svelte`

**Структура:**
```
ProductServices
├── ServicesGrid
│   └── ServiceCard[]
└── FAQ
    └── FAQItem[]
        ├── Question
        └── Answer
```

---

### 3.4 Виджет (widget-demo.html)

#### 3.4.1 Watch Widget (WatchWidget.svelte)

**Файл:** `src/lib/components/widget/WatchWidget.svelte`

**Props:**
```typescript
interface WatchWidgetProps {
  city: string;
  limit?: number;
  variant?: 'full' | 'compact' | 'embedded';
  showFilters?: boolean;
  showPagination?: boolean;
}
```

**Структура:**
```
WatchWidget
├── WidgetHeader
│   ├── Title
│   └── CitySelector
├── WidgetFilters (опционально)
│   ├── BrandFilter
│   ├── PriceFilter
│   └── StyleFilter
├── WidgetResults
│   └── WidgetCard[]
└── WidgetPagination (опционально)
```

**Variants:**
- **full** - полная версия с фильтрами и пагинацией
- **compact** - компактная версия без фильтров
- **embedded** - встраиваемая версия (минимальные стили)

**State:**
```typescript
let city = $state('moscow');
let products = $state([]);
let page = $state(1);
```

---

#### 3.4.2 Widget Demo Page (WidgetDemo.svelte)

**Файл:** `src/routes/widget-demo/+page.svelte`

**Структура:**
```
WidgetDemoPage
├── DemoTabs
│   ├── CityTab[] (Москва, СПб, Екатеринбург)
│   ├── VariantsTab
│   └── CodeTab
└── DemoContent
    ├── WatchWidget (с разными пропсами)
    └── CodeExamples
```

---

## 4. SEO компоненты

Компоненты для оптимизации поисковых систем.

### 4.1 SEO Head (SEOHead.svelte)

**Файл:** `src/lib/components/seo/SEOHead.svelte`

**Props:**
```typescript
interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
}
```

**Содержит:**
```svelte
<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />

  <!-- Open Graph -->
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:type" content={ogType} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />

  <!-- Canonical -->
  {#if canonical}
    <link rel="canonical" href={canonical} />
  {/if}

  <!-- Robots -->
  {#if noindex}
    <meta name="robots" content="noindex, nofollow" />
  {/if}
</svelte:head>
```

---

### 4.2 Structured Data (StructuredData.svelte)

**Файл:** `src/lib/components/seo/StructuredData.svelte`

**Типы схем:**

#### 4.2.1 Organization Schema

```typescript
interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  contactPoint: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
  };
  sameAs: string[]; // социальные сети
}
```

#### 4.2.2 Product Schema

```typescript
interface ProductSchema {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  image: string[];
  description: string;
  brand: {
    '@type': 'Brand';
    name: string;
  };
  offers: {
    '@type': 'Offer';
    url: string;
    priceCurrency: string;
    price: number;
    availability: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
}
```

#### 4.2.3 Breadcrumb Schema

```typescript
interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}
```

**Использование:**
```svelte
<StructuredData schema={productSchema} />
```

Генерирует:
```svelte
<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>
```

---

### 4.3 Analytics (Analytics.svelte)

**Файл:** `src/lib/components/seo/Analytics.svelte`

**Props:**
```typescript
interface AnalyticsProps {
  yandexMetrikaId?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
}
```

**Содержит:**

#### 4.3.1 Yandex Metrika

```svelte
{#if yandexMetrikaId}
  <svelte:head>
    <script>
      (function(m,e,t,r,i,k,a){
        // Yandex Metrika код
      })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

      ym({yandexMetrikaId}, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true
      });
    </script>
  </svelte:head>
{/if}
```

#### 4.3.2 Google Analytics (GA4)

```svelte
{#if googleAnalyticsId}
  <svelte:head>
    <script async src="https://www.googletagmanager.com/gtag/js?id={googleAnalyticsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '{googleAnalyticsId}');
    </script>
  </svelte:head>
{/if}
```

#### 4.3.3 Google Tag Manager

```svelte
{#if googleTagManagerId}
  <svelte:head>
    <script>
      (function(w,d,s,l,i){
        // GTM код
      })(window,document,'script','dataLayer','{googleTagManagerId}');
    </script>
  </svelte:head>

  <noscript>
    <iframe src="https://www.googletagmanager.com/ns.html?id={googleTagManagerId}" ...></iframe>
  </noscript>
{/if}
```

---

### 4.4 Sitemap Generator (utils)

**Файл:** `src/lib/utils/sitemap.ts`

Функция для генерации sitemap.xml:

```typescript
interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function generateSitemap(entries: SitemapEntry[]): string {
  // Генерация XML
}
```

**Эндпоинт:** `src/routes/sitemap.xml/+server.ts`

---

### 4.5 Robots.txt (endpoint)

**Файл:** `src/routes/robots.txt/+server.ts`

```typescript
export function GET() {
  const robots = `
User-agent: *
Allow: /

Sitemap: ${PUBLIC_SITE_URL}/sitemap.xml
  `.trim();

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}
```

---

## 5. Структура страниц

### 5.1 Главная страница

**Файл:** `src/routes/+page.svelte`

```svelte
<script>
  import SEOHead from '$lib/components/seo/SEOHead.svelte';
  import StructuredData from '$lib/components/seo/StructuredData.svelte';
  import HomeHero from '$lib/components/home/HomeHero.svelte';
  import HomeCollections from '$lib/components/home/HomeCollections.svelte';
  import HomeShowcase from '$lib/components/home/HomeShowcase.svelte';
  import HomeExperience from '$lib/components/home/HomeExperience.svelte';
  import HomeTestimonials from '$lib/components/home/HomeTestimonials.svelte';
  import HomeEditorial from '$lib/components/home/HomeEditorial.svelte';
  import TelegramCTA from '$lib/components/widgets/TelegramCTA.svelte';
</script>

<SEOHead
  title="Moditimewatch - Премиальные часы с доставкой"
  description="..."
/>

<StructuredData schema={organizationSchema} />

<HomeHero />
<HomeCollections />
<HomeShowcase />
<HomeExperience />
<HomeTestimonials />
<HomeEditorial />
<TelegramCTA />
```

---

### 5.2 Каталог

**Файл:** `src/routes/catalog/+page.svelte`

```svelte
<script>
  import SEOHead from '$lib/components/seo/SEOHead.svelte';
  import CatalogHero from '$lib/components/catalog/CatalogHero.svelte';
  import CatalogControls from '$lib/components/catalog/CatalogControls.svelte';
  import CatalogFilters from '$lib/components/catalog/CatalogFilters.svelte';
  import CatalogResults from '$lib/components/catalog/CatalogResults.svelte';
  import CatalogInsights from '$lib/components/catalog/CatalogInsights.svelte';
  import TelegramCTA from '$lib/components/widgets/TelegramCTA.svelte';
</script>

<SEOHead
  title="Каталог премиальных часов"
  description="..."
/>

<CatalogHero />
<div class="catalog-layout">
  <CatalogFilters />
  <div>
    <CatalogControls />
    <CatalogResults />
  </div>
</div>
<CatalogInsights />
<TelegramCTA />
```

---

### 5.3 Товар

**Файл:** `src/routes/product/[slug]/+page.svelte`

```svelte
<script>
  import { page } from '$app/stores';
  import SEOHead from '$lib/components/seo/SEOHead.svelte';
  import StructuredData from '$lib/components/seo/StructuredData.svelte';
  import ProductBreadcrumbs from '$lib/components/product/ProductBreadcrumbs.svelte';
  import ProductHero from '$lib/components/product/ProductHero.svelte';
  import ProductHighlights from '$lib/components/product/ProductHighlights.svelte';
  import ProductSpecs from '$lib/components/product/ProductSpecs.svelte';
  import ProductTabs from '$lib/components/product/ProductTabs.svelte';
  import ProductReviews from '$lib/components/product/ProductReviews.svelte';
  import ProductRecommendations from '$lib/components/product/ProductRecommendations.svelte';
  import ProductServices from '$lib/components/product/ProductServices.svelte';
  import TelegramCTA from '$lib/components/widgets/TelegramCTA.svelte';

  let { data } = $props();
</script>

<SEOHead
  title={data.product.name}
  description={data.product.description}
/>

<StructuredData schema={productSchema} />
<StructuredData schema={breadcrumbSchema} />

<ProductBreadcrumbs items={data.breadcrumbs} />
<ProductHero product={data.product} />
<ProductHighlights />
<ProductSpecs specs={data.product.specs} />
<ProductTabs content={data.product.content} />
<ProductReviews reviews={data.product.reviews} />
<ProductRecommendations products={data.recommendations} />
<ProductServices />
<TelegramCTA />
```

---

### 5.4 Виджет

**Файл:** `src/routes/widget-demo/+page.svelte`

```svelte
<script>
  import SEOHead from '$lib/components/seo/SEOHead.svelte';
  import WatchWidget from '$lib/components/widget/WatchWidget.svelte';

  let activeTab = $state('moscow');
  let variant = $state<'full' | 'compact' | 'embedded'>('full');
</script>

<SEOHead
  title="Watch Widget - Demo"
  description="..."
  noindex={true}
/>

<div class="demo-section">
  <!-- Табы и демо -->
</div>
```

---

## 6. UI Kit компоненты

Базовые переиспользуемые компоненты интерфейса.

### 6.1 Button (Button.svelte)

**Файл:** `src/lib/components/ui/Button.svelte`

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'light';
  size?: 'small' | 'medium' | 'large';
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children: Snippet;
  onclick?: (e: MouseEvent) => void;
}
```

**Использование:**
```svelte
<Button variant="primary" size="large">Заказать</Button>
<Button variant="ghost" href="/catalog">Каталог</Button>
```

---

### 6.2 Icon Button (IconButton.svelte)

**Файл:** `src/lib/components/ui/IconButton.svelte`

**Props:**
```typescript
interface IconButtonProps {
  icon: string;
  label: string; // для aria-label
  badge?: number;
  onclick?: (e: MouseEvent) => void;
}
```

**Использование:**
```svelte
<IconButton icon="search" label="Поиск" />
<IconButton icon="cart" label="Корзина" badge={3} />
```

---

### 6.3 Chip (Chip.svelte)

**Файл:** `src/lib/components/ui/Chip.svelte`

**Props:**
```typescript
interface ChipProps {
  variant?: 'default' | 'primary';
  selected?: boolean;
  removable?: boolean;
  onclick?: (e: MouseEvent) => void;
  onremove?: (e: MouseEvent) => void;
  children: Snippet;
}
```

**Использование:**
```svelte
<Chip>Премиум</Chip>
<Chip variant="primary" selected={true}>Выбрано</Chip>
<Chip removable onremove={handleRemove}>Rolex</Chip>
```

---

### 6.4 Input Field (InputField.svelte)

**Файл:** `src/lib/components/ui/InputField.svelte`

**Props:**
```typescript
interface InputFieldProps {
  type?: 'text' | 'email' | 'tel' | 'password' | 'search';
  placeholder?: string;
  value: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}
```

**Использование:**
```svelte
<InputField
  bind:value={email}
  type="email"
  label="Email"
  placeholder="Ваш email"
/>
```

---

### 6.5 Rating (Rating.svelte)

**Файл:** `src/lib/components/ui/Rating.svelte`

**Props:**
```typescript
interface RatingProps {
  value: number; // 0-5
  count?: number; // количество отзывов
  showValue?: boolean;
}
```

**Использование:**
```svelte
<Rating value={4.9} count={142} showValue={true} />
```

**Вывод:**
★★★★★ 4.9 (142 отзыва)

---

### 6.6 Section Intro (SectionIntro.svelte)

**Файл:** `src/lib/components/ui/SectionIntro.svelte`

**Props:**
```typescript
interface SectionIntroProps {
  eyebrow?: string; // надзаголовок
  title: string;
  description?: string;
}
```

**Использование:**
```svelte
<SectionIntro
  eyebrow="Коллекции"
  title="Кураторские подборки"
  description="Тематические подборки от экспертов"
/>
```

---

### 6.7 Container (Container.svelte)

**Файл:** `src/lib/components/ui/Container.svelte`

**Props:**
```typescript
interface ContainerProps {
  children: Snippet;
}
```

**Использование:**
```svelte
<Container>
  <h1>Content</h1>
</Container>
```

Генерирует `.container` с max-width и padding.

---

### 6.8 Stat (Stat.svelte)

**Файл:** `src/lib/components/ui/Stat.svelte`

**Props:**
```typescript
interface StatProps {
  label: string;
  value: string;
}
```

**Использование:**
```svelte
<Stat label="Моделей в наличии" value="1000+" />
```

---

### 6.9 Theme Toggle (ThemeToggle.svelte)

**Файл:** `src/lib/components/ui/ThemeToggle.svelte`

**Props:**
```typescript
interface ThemeToggleProps {
  compact?: boolean;
}
```

**State:**
```typescript
let theme = $state<'light' | 'dark'>('light');
```

**Функциональность:**
- Переключение темы
- Сохранение в localStorage
- Применение data-theme к body

**Использование:**
```svelte
<ThemeToggle />
<ThemeToggle compact={true} />
```

---

## 📊 Статистика компонентов

### По категориям:

1. **Layout компоненты:** 5
   - SiteHeader, MobileDrawer, SearchOverlay, SiteFooter, ChatBot

2. **Виджеты:** 8
   - ProductCard, CollectionCard, TestimonialCard, EditorialCard, ServiceCard, ScrollRow, ReviewCard, TelegramCTA

3. **Уникальные компоненты страниц:** 24
   - Главная: 6
   - Каталог: 5
   - Товар: 8
   - Виджет: 2
   - Демо: 3

4. **SEO компоненты:** 5
   - SEOHead, StructuredData, Analytics, Sitemap, Robots

5. **UI Kit:** 9
   - Button, IconButton, Chip, InputField, Rating, SectionIntro, Container, Stat, ThemeToggle

**Всего компонентов:** 51

---

## 🎨 CSS архитектура

### Структура стилей:

```
src/lib/styles/
├── variables.css         - CSS переменные
├── normalize.css         - Сброс стилей
├── global.css           - Глобальные стили
├── components/
│   ├── button.css
│   ├── chip.css
│   ├── input.css
│   └── ...
├── layout/
│   ├── header.css
│   ├── footer.css
│   └── ...
└── pages/
    ├── home.css
    ├── catalog.css
    └── product.css
```

### Использование в компонентах:

```svelte
<style>
  /* Scoped стили для компонента */
</style>

<style global>
  /* Глобальные стили если нужно */
</style>
```

---

## 📦 Структура данных (моки)

### Продукт (Product)

```typescript
interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  badge?: {
    text: string;
    variant: 'gold' | 'default';
  };
  inStock: boolean;
  availability?: string;
  description: string;
  shortDescription: string;

  // Спецификации
  specs: {
    case: SpecItem[];
    mechanism: SpecItem[];
    package: SpecItem[];
    service: SpecItem[];
  };

  // Опции
  sizes?: string[];
  packages?: string[];

  // Рейтинг и отзывы
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];

  // Дополнительно
  tags?: string[];
  scenarios?: string[];
  material?: string;
  mechanism?: string;
}
```

### Отзыв (Review)

```typescript
interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  deliveryInfo?: string;
}
```

### Коллекция (Collection)

```typescript
interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  tag: string;
  image: string;
  products: Product[];
}
```

### Статья (Article)

```typescript
interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  tag: string;
  image: string;
  content?: string;
}
```

---

## 🚀 План миграции

### Фаза 1: Layout компоненты (День 1-2)
1. ✅ Отключить SSR
2. ⬜ Создать базовую структуру routes
3. ⬜ Мигрировать Header + Navigation
4. ⬜ Мигрировать Footer
5. ⬜ Мигрировать Mobile Drawer
6. ⬜ Мигрировать Search Overlay
7. ⬜ Мигрировать Chat Bot

### Фаза 2: UI Kit (День 2-3)
1. ⬜ Button, IconButton
2. ⬜ Chip, InputField
3. ⬜ Rating, SectionIntro
4. ⬜ Container, Stat
5. ⬜ ThemeToggle

### Фаза 3: Виджеты (День 3-4)
1. ⬜ ProductCard, CollectionCard
2. ⬜ TestimonialCard, EditorialCard
3. ⬜ ServiceCard, ReviewCard
4. ⬜ ScrollRow, TelegramCTA

### Фаза 4: Главная страница (День 4-5)
1. ⬜ HomeHero
2. ⬜ HomeCollections
3. ⬜ HomeShowcase
4. ⬜ HomeExperience
5. ⬜ HomeTestimonials
6. ⬜ HomeEditorial

### Фаза 5: Каталог (День 5-6)
1. ⬜ CatalogHero
2. ⬜ CatalogControls
3. ⬜ CatalogFilters
4. ⬜ CatalogResults
5. ⬜ CatalogInsights

### Фаза 6: Товар (День 6-7)
1. ⬜ ProductBreadcrumbs
2. ⬜ ProductGallery
3. ⬜ ProductSummary
4. ⬜ ProductHighlights
5. ⬜ ProductSpecs
6. ⬜ ProductTabs
7. ⬜ ProductReviews
8. ⬜ ProductRecommendations
9. ⬜ ProductServices

### Фаза 7: Виджет (День 7)
1. ⬜ WatchWidget
2. ⬜ WidgetDemo

### Фаза 8: SEO (День 8)
1. ⬜ SEOHead
2. ⬜ StructuredData
3. ⬜ Analytics
4. ⬜ Sitemap
5. ⬜ Robots.txt

### Фаза 9: Интеграция данных (День 9-10)
1. ⬜ Создать API endpoints
2. ⬜ Подключить БД
3. ⬜ Мигрировать с моков на реальные данные

### Фаза 10: Финализация (День 10-11)
1. ⬜ Включить SSR
2. ⬜ Тестирование
3. ⬜ Оптимизация
4. ⬜ Деплой

---

## 📝 Заметки

### CSS переменные
Все CSS переменные из `variables.css` должны быть перенесены в `src/lib/styles/variables.css` и доступны глобально.

### Типы данных
Все TypeScript интерфейсы должны быть в `src/lib/types/`:
- `product.ts`
- `review.ts`
- `collection.ts`
- `article.ts`
- и т.д.

### Utilities
Вспомогательные функции в `src/lib/utils/`:
- `lockScroll.ts`
- `formatPrice.ts`
- `sitemap.ts`
- и т.д.

### Stores
Svelte 5 runes вместо stores где возможно, но для глобального состояния можно использовать:
- `src/lib/stores/cart.svelte.ts`
- `src/lib/stores/favorites.svelte.ts`
- `src/lib/stores/theme.svelte.ts`

---

**Готово к миграции!** 🎉
