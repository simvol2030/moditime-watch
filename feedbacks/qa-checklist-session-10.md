# Quick QA Checklist: Session-10 (Critical Admin pSEO Fixes)

> **Назначение:** Проверка исправлений Session-10 после deploy
> **Фокус:** Проверяем ТОЛЬКО то, что Developer изменил (добавление 99 городов)
> **Формат:** Quick QA — быстрая целевая проверка, НЕ полная validation

---

## Что проверяем

**Developer добавил:**
- 99 дополнительных городов в seed (итого 102 города)
- `seedAdditionalCities()` в `database.ts`

**Developer верифицировал (уже работает, но проверим на всякий случай):**
- CRIT-6: Admin dashboard загружается после выбора города
- CRIT-8: Категории отображаются в article cards
- MEDIUM-9: City selector присутствует

---

## Technical QA Checklist

### 1. MINOR-1: В админке 102 города (не 3)

**URL:** `https://moditime-watch.ru/admin/pseo`

**Действие:**
1. Login в админку
2. Перейти на `/admin/pseo`
3. Открыть city selector (поле поиска городов)
4. Посчитать количество городов в списке

**Ожидаемый результат:**
- ✅ ~102 города в списке (не 3)
- Проверить наличие нескольких городов:
  - Москва ✓
  - Санкт-Петербург ✓
  - Казань ✓
  - Екатеринбург ✓
  - Новосибирск ✓
  - Владивосток ✓
  - Калининград ✓

**Дополнительно:** Проверить `/admin/content/cities` — тоже должно быть ~102 города

---

### 2. MEDIUM-7: sitemap-cities.xml содержит 102 города

**URL:** `https://moditime-watch.ru/sitemap-cities.xml`

**Действие:**
1. Открыть sitemap в браузере
2. View Source
3. Посчитать количество `<url>` элементов

**Способ быстрой проверки:**
```javascript
// В browser console:
document.querySelectorAll('url').length
// Ожидаем: ~102
```

**Ожидаемый результат:**
- ✅ ~102 города в sitemap (не 3)
- Каждый город имеет: `<loc>`, `<lastmod>`, `<changefreq>`, `<priority>`
- Проверить наличие нескольких городов в sitemap:
  - /city/moscow ✓
  - /city/saint-petersburg ✓
  - /city/kazan ✓
  - /city/yekaterinburg ✓
  - /city/novosibirsk ✓

---

### 3. CRIT-6: Dashboard загружается после выбора города (verification)

**URL:** `https://moditime-watch.ru/admin/pseo`

**Действие:**
1. Login в админку
2. Перейти на `/admin/pseo`
3. Выбрать город "Москва" из selector
4. Проверить что UI обновился (показывает статьи)

**Ожидаемый результат:**
- ✅ Dashboard показывает список статей для выбранного города
- ✅ URL меняется на `/admin/pseo?city_id=1`
- ✅ Заголовок показывает выбранный город
- ❌ НЕ пустой экран

**Проверить на 2 городах:**
- Москва (city_id=1)
- Санкт-Петербург (city_id=2)

---

### 4. Database: проверка количества городов (опционально)

**Только если есть доступ к серверу:**

```bash
ssh server
sqlite3 /opt/websites/moditime-watch.ru/repo/data/db/sqlite/app.db
SELECT COUNT(*) FROM cities;
# Ожидаем: 102
```

---

## UX QA Checklist

### 1. City selector показывает 102 города

**URL:** `https://moditime-watch.ru/admin/pseo`
**Viewport:** Desktop 1920×1080

**Действие:**
1. Login в админку
2. Открыть city selector (поле поиска)
3. Scroll через список городов

**Ожидаемый результат:**
- ✅ Длинный список городов (~102)
- ✅ Поиск работает (например, ввести "Екатеринбург" → находит город)
- ✅ Клик на город → dashboard обновляется

---

### 2. CRIT-8: Категории отображаются в article cards (verification)

**URL:** `https://moditime-watch.ru/admin/pseo?city_id=1`
**Viewport:** Desktop 1920×1080

**Действие:**
1. Выбрать город "Москва"
2. Проверить article cards

**Ожидаемый результат:**
- ✅ Поле "Категория" заполнено (например, "Общее", "Trade-in", etc.)
- ❌ НЕ пустое поле

**Проверить на 3 статьях из разных категорий**

---

### 3. MEDIUM-9: City selector функционален (verification)

**URL:** `https://moditime-watch.ru/admin/pseo`
**Viewport:** Desktop 1920×1080

**Действие:**
1. Переключиться между городами через selector
2. Проверить что UI обновляется

**Ожидаемый результат:**
- ✅ Selector присутствует вверху страницы
- ✅ Можно переключаться между городами
- ✅ UI обновляется при переключении (список статей меняется)
- ✅ URL обновляется (`?city_id=X`)

---

## Формат отчёта для субагентов

```markdown
# Quick QA Report: Session-10 (Critical Admin pSEO)

## Summary
- ✅ FIXED / ❌ NOT FIXED / ⚠️ PARTIALLY FIXED

## Technical Validation

### MINOR-1: 102 города в админке
- Admin pSEO city selector: [✅/❌] ~102 города
- Cities list: [список найденных городов]

### MEDIUM-7: sitemap-cities.xml
- Количество городов: [число] (ожидаем ~102)
- Status: [✅/❌]

### CRIT-6: Dashboard загружается (verification)
- Москва: [✅/❌] Dashboard показывает статьи
- Санкт-Петербург: [✅/❌] Dashboard показывает статьи

### Database (опционально)
- SELECT COUNT(*) FROM cities: [число]

## UX Validation

### City selector работает
- Показывает ~102 города: [✅/❌]
- Поиск работает: [✅/❌]
- Переключение городов: [✅/❌]

### CRIT-8: Категории в article cards (verification)
- Категории заполнены: [✅/❌]
- Примеры: [список категорий]

## Conclusion
- Session-10 FIXED / NOT FIXED
- Feedback file required: YES / NO
```

**Сохранить отчёты в:**
- Technical QA: `feedbacks/qa-reports/session-10-v1/tech-check.md`
- UX QA: `feedbacks/qa-reports/session-10-v1/ux-check.md`

---

## Критерии успеха

**Session-10 считается FIXED если:**
- ✅ В админке ~102 города (не 3)
- ✅ В sitemap-cities.xml ~102 города (не 3)
- ✅ Dashboard загружается после выбора города
- ✅ Категории отображаются в article cards
- ✅ City selector функционален

**Если НЕ FIXED → создать feedback файл с описанием проблем**

---

**Версия:** 1.0
**Создано:** 2025-02-02
**Для:** QA subagents (qa-technical-validation + qa-ux-verification)
**Тип:** Quick QA — целевая проверка Session-10 изменений
