# Session-16: Smart Import — Roadmap

**Spec:** `spec-final.md`
**Приоритет:** HIGH
**Estimated tasks:** 6

---

## Задачи

### Task 1: CSV Format Detector + Supplier Row Converter
**Score:** 9 (логика×3 + 2-3 файла×2 + API×2 + >10мин×1)
**Файлы:** создать `csv-format-detector.ts`

- Функция `detectCsvFormat(headers)` → `'native' | 'supplier' | 'unknown'`
- Функция `convertSupplierRows(rows)` → конвертация всех колонок
- Маппинг `Бренд` → `brand_slug` (trim, lowercase, replace spaces with `-`)
- Маппинг `Пол` → `category_slug` (Мужские→mens, Женские→womens, Унисекс→unisex)
- Сборка `specs_json` из 8 колонок (Размер, Толщина, Механизм, Калибр, Запас хода, Водозащита, Корпус, Ремешок, Циферблат)
- Группировка спеков: Корпус (материал, диаметр, толщина, водозащита), Механизм (тип, калибр, запас хода), Внешний вид (циферблат, ремешок)
- Пропуск спеков со значением `-`
- Маппинг `Фото` → `main_image` (числовой ID → `"{id}.jpg"`)
- Маппинг `Коллекция` → в `description` (`"Коллекция: {value}"`)
- Unit tests / manual тест с реальным CSV (170 строк)

**Тестовые данные:** файл `/home/claude-user/dev/watch-site/К загрузке  - Лист1.csv`

### Task 2: Интеграция detect/convert в import pipeline
**Score:** 6 (логика + 1-2 файла + API)
**Файлы:** изменить `+page.server.ts`

- В action `preview`: после parseCSV → detectCsvFormat → convertSupplierRows если supplier → вернуть detectedFormat
- В action `import`: аналогично detect → convert → auto-cascade для supplier формата
- При supplier формате auto-create brands и categories (использовать существующий cascade код)
- Вернуть detectedFormat и конвертированные headers в response

### Task 3: Расширенный поиск файлов в ZIP (fuzzy filename)
**Score:** 5 (логика + 1 файл + компоненты)
**Файлы:** изменить `zip-handler.ts`

- Если imageMap.get(value) не найден и value — число, пробовать: `{value}.jpg`, `{value}.jpeg`, `{value}.png`, `{value}.webp`
- Также с prefix `images/`
- Case-insensitive fallback при поиске
- Поддержка: TIFF, BMP в списке расширений
- Корректная обработка unicode в именах файлов (не ломать кириллицу, иероглифы)
- trim имён файлов

### Task 4: UX — Export кнопки + свёрнутая инструкция
**Score:** 4 (CSS/простая логика + 1 файл + компоненты)
**Файлы:** изменить `+page.svelte`

- Export блок перенести ВВЕРХ (после заголовка, до инструкции)
- Кнопки Export сделать крупными, с иконкой ⬇, как action buttons
- Инструкцию "Как пользоваться" обернуть в `<details>` (свёрнута по умолчанию)
- Добавить кнопку "Download Supplier Template" рядом с "Download Products Template"

### Task 5: Preview — показать обнаруженный формат
**Score:** 4 (CSS/простая логика + 1 файл + компоненты)
**Файлы:** изменить `+page.svelte`

- При preview показывать badge: "Формат: Стандартный" (зелёный) или "Формат: Поставщик (автоконвертация)" (синий)
- При формате поставщика показать список конвертаций:
  - Сколько брендов будет создано (и какие)
  - Какие категории будут созданы
  - "Характеристики собраны из 8 колонок"
- Preview таблицу показывать УЖЕ в конвертированном виде (наши заголовки)

### Task 6: Supplier Template endpoint
**Score:** 3 (конфиги + 1 файл + контент)
**Файлы:** создать `+server.ts` для supplier template

- GET `/admin/import/templates/supplier` → CSV с заголовками формата поставщика + 1 пример строки
- Заголовки: `id товара,Имя,Бренд,Артикул (Ref),Цена,Фото,Коллекция,Пол,Размер (мм),Толщ. (мм),Мех-м,Калибр,Запас хода,Водозащита,Корпус,Ремешок/Браслет,Циферблат`

---

## Порядок выполнения

```
Task 1 (detector + converter)  ─── самое важное, ядро логики
    ↓
Task 2 (integration)           ─── подключить к pipeline
    ↓
Task 3 (ZIP fuzzy match)       ─── параллельно с Task 4-6
Task 4 (UX export buttons)     ─── параллельно
Task 5 (preview format badge)  ─── после Task 2
Task 6 (supplier template)     ─── параллельно
```

---

## Финальный тест (обязательный)

1. Загрузить `К загрузке - Лист1.csv` → Preview → "Формат: Поставщик", 170 строк
2. Import → Added: ~170, Created brands: 2, Created categories: 3
3. Открыть /admin/products → все 170 товаров с характеристиками
4. Открыть любой товар → specs_json отображается (Корпус/Механизм/Внешний вид)
5. Export Products → скачать CSV
6. Re-import экспортированного CSV → "Формат: Стандартный", Updated: 170

---

*Создано: 2026-02-19*
