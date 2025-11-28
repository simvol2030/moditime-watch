-- Seed Products for MVP Testing
-- 17 more watches (total ~20 with existing 3)

-- Add more brands first
INSERT OR IGNORE INTO brands (slug, name, description, logo_url, position, is_active) VALUES
('audemars-piguet', 'Audemars Piguet', 'Швейцарская мануфактура высокого часового искусства', 'https://picsum.photos/seed/ap-logo/200/100', 4, 1),
('vacheron-constantin', 'Vacheron Constantin', 'Старейшая непрерывно работающая часовая мануфактура', 'https://picsum.photos/seed/vc-logo/200/100', 5, 1),
('iwc', 'IWC Schaffhausen', 'Швейцарские часы с инженерным совершенством', 'https://picsum.photos/seed/iwc-logo/200/100', 6, 1),
('breguet', 'Breguet', 'Изобретатели турбийона и основатели высокой часовой индустрии', 'https://picsum.photos/seed/breguet-logo/200/100', 7, 1);

-- Add more categories
INSERT OR IGNORE INTO categories (slug, name, description, parent_id, position, is_active) VALUES
('dress', 'Дресс', 'Элегантные часы для особых случаев', NULL, 3, 1),
('diving', 'Дайверские', 'Профессиональные часы для погружений', NULL, 4, 1),
('pilots', 'Пилотские', 'Авиационные часы', NULL, 5, 1);

-- New Rolex products
INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'rolex-daytona-gold',
    'Daytona',
    'ROL-DAY-001',
    (SELECT id FROM brands WHERE slug = 'rolex'),
    (SELECT id FROM categories WHERE slug = 'sport'),
    495000000,
    'in-stock',
    'В наличии в Москве',
    1,
    0,
    1,
    1,
    4,
    '{"Корпус": [{"label": "Материал", "value": "Золото 18К"}, {"label": "Диаметр", "value": "40 мм"}], "Механизм": [{"label": "Калибр", "value": "4130"}, {"label": "Запас хода", "value": "72 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'rolex-daytona-gold');

INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'rolex-gmt-master-pepsi',
    'GMT-Master II Pepsi',
    'ROL-GMT-001',
    (SELECT id FROM brands WHERE slug = 'rolex'),
    (SELECT id FROM categories WHERE slug = 'sport'),
    285000000,
    'pre-order',
    'Под заказ 14-21 день',
    0,
    0,
    1,
    1,
    5,
    '{"Корпус": [{"label": "Материал", "value": "Oystersteel"}, {"label": "Диаметр", "value": "40 мм"}], "Механизм": [{"label": "Калибр", "value": "3285"}, {"label": "Запас хода", "value": "70 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'rolex-gmt-master-pepsi');

INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'rolex-datejust-36',
    'Datejust 36',
    'ROL-DJ-001',
    (SELECT id FROM brands WHERE slug = 'rolex'),
    (SELECT id FROM categories WHERE slug = 'mens'),
    95000000,
    'in-stock',
    'В наличии',
    0,
    0,
    0,
    1,
    6,
    '{"Корпус": [{"label": "Материал", "value": "Oystersteel"}, {"label": "Диаметр", "value": "36 мм"}], "Механизм": [{"label": "Калибр", "value": "3235"}, {"label": "Запас хода", "value": "70 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'rolex-datejust-36');

-- Patek Philippe products
INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'patek-philippe-aquanaut',
    'Aquanaut',
    'PP-AQ-001',
    (SELECT id FROM brands WHERE slug = 'patek-philippe'),
    (SELECT id FROM categories WHERE slug = 'sport'),
    450000000,
    'waitlist',
    'Лист ожидания',
    0,
    0,
    1,
    1,
    7,
    '{"Корпус": [{"label": "Материал", "value": "Сталь"}, {"label": "Диаметр", "value": "40 мм"}], "Механизм": [{"label": "Калибр", "value": "324 S C"}, {"label": "Запас хода", "value": "45 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'patek-philippe-aquanaut');

INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'patek-philippe-calatrava',
    'Calatrava',
    'PP-CAL-001',
    (SELECT id FROM brands WHERE slug = 'patek-philippe'),
    (SELECT id FROM categories WHERE slug = 'dress'),
    380000000,
    'in-stock',
    'В наличии',
    0,
    0,
    0,
    1,
    8,
    '{"Корпус": [{"label": "Материал", "value": "Белое золото 18К"}, {"label": "Диаметр", "value": "39 мм"}], "Механизм": [{"label": "Калибр", "value": "324 SC"}, {"label": "Запас хода", "value": "45 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'patek-philippe-calatrava');

INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'patek-philippe-perpetual',
    'Perpetual Calendar',
    'PP-PC-001',
    (SELECT id FROM brands WHERE slug = 'patek-philippe'),
    (SELECT id FROM categories WHERE slug = 'mens'),
    1250000000,
    'pre-order',
    'Под заказ 30-60 дней',
    1,
    1,
    1,
    1,
    9,
    '{"Корпус": [{"label": "Материал", "value": "Белое золото 18К"}, {"label": "Диаметр", "value": "39 мм"}], "Механизм": [{"label": "Калибр", "value": "240 Q"}, {"label": "Запас хода", "value": "48 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'patek-philippe-perpetual');

-- Omega products
INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'omega-seamaster-300',
    'Seamaster Diver 300M',
    'OMG-SM-001',
    (SELECT id FROM brands WHERE slug = 'omega'),
    (SELECT id FROM categories WHERE slug = 'diving'),
    72000000,
    'in-stock',
    'В наличии',
    0,
    0,
    1,
    1,
    10,
    '{"Корпус": [{"label": "Материал", "value": "Сталь"}, {"label": "Диаметр", "value": "42 мм"}, {"label": "Водозащита", "value": "300 м"}], "Механизм": [{"label": "Калибр", "value": "8800"}, {"label": "Запас хода", "value": "55 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'omega-seamaster-300');

INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'omega-constellation',
    'Constellation',
    'OMG-CON-001',
    (SELECT id FROM brands WHERE slug = 'omega'),
    (SELECT id FROM categories WHERE slug = 'dress'),
    58000000,
    'in-stock',
    'В наличии',
    0,
    0,
    0,
    1,
    11,
    '{"Корпус": [{"label": "Материал", "value": "Сталь"}, {"label": "Диаметр", "value": "39 мм"}], "Механизм": [{"label": "Калибр", "value": "8800"}, {"label": "Запас хода", "value": "55 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'omega-constellation');

INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'omega-moonwatch',
    'Speedmaster Moonwatch',
    'OMG-MOON-001',
    (SELECT id FROM brands WHERE slug = 'omega'),
    (SELECT id FROM categories WHERE slug = 'sport'),
    115000000,
    'pre-order',
    'Под заказ 7-14 дней',
    1,
    0,
    1,
    1,
    12,
    '{"Корпус": [{"label": "Материал", "value": "Сталь"}, {"label": "Диаметр", "value": "42 мм"}], "Механизм": [{"label": "Калибр", "value": "3861"}, {"label": "Запас хода", "value": "50 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'omega-moonwatch');

-- Audemars Piguet products
INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'ap-royal-oak',
    'Royal Oak',
    'AP-RO-001',
    (SELECT id FROM brands WHERE slug = 'audemars-piguet'),
    (SELECT id FROM categories WHERE slug = 'sport'),
    420000000,
    'waitlist',
    'Лист ожидания 6-12 мес',
    0,
    0,
    1,
    1,
    13,
    '{"Корпус": [{"label": "Материал", "value": "Сталь"}, {"label": "Диаметр", "value": "41 мм"}], "Механизм": [{"label": "Калибр", "value": "4302"}, {"label": "Запас хода", "value": "70 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'ap-royal-oak');

INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'ap-royal-oak-offshore',
    'Royal Oak Offshore',
    'AP-ROO-001',
    (SELECT id FROM brands WHERE slug = 'audemars-piguet'),
    (SELECT id FROM categories WHERE slug = 'sport'),
    550000000,
    'in-stock',
    'В наличии',
    1,
    0,
    1,
    1,
    14,
    '{"Корпус": [{"label": "Материал", "value": "Сталь"}, {"label": "Диаметр", "value": "42 мм"}], "Механизм": [{"label": "Калибр", "value": "3126/3840"}, {"label": "Запас хода", "value": "50 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'ap-royal-oak-offshore');

INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'ap-code-1159',
    'CODE 11.59',
    'AP-CODE-001',
    (SELECT id FROM brands WHERE slug = 'audemars-piguet'),
    (SELECT id FROM categories WHERE slug = 'dress'),
    320000000,
    'in-stock',
    'В наличии',
    0,
    0,
    0,
    1,
    15,
    '{"Корпус": [{"label": "Материал", "value": "Розовое золото 18К"}, {"label": "Диаметр", "value": "41 мм"}], "Механизм": [{"label": "Калибр", "value": "4302"}, {"label": "Запас хода", "value": "70 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'ap-code-1159');

-- IWC products
INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'iwc-portugieser',
    'Portugieser Chronograph',
    'IWC-PORT-001',
    (SELECT id FROM brands WHERE slug = 'iwc'),
    (SELECT id FROM categories WHERE slug = 'dress'),
    125000000,
    'in-stock',
    'В наличии',
    1,
    0,
    1,
    1,
    16,
    '{"Корпус": [{"label": "Материал", "value": "Сталь"}, {"label": "Диаметр", "value": "41 мм"}], "Механизм": [{"label": "Калибр", "value": "69355"}, {"label": "Запас хода", "value": "46 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'iwc-portugieser');

INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'iwc-pilot-mark-xx',
    'Pilot Mark XX',
    'IWC-PILOT-001',
    (SELECT id FROM brands WHERE slug = 'iwc'),
    (SELECT id FROM categories WHERE slug = 'pilots'),
    68000000,
    'in-stock',
    'В наличии',
    0,
    0,
    0,
    1,
    17,
    '{"Корпус": [{"label": "Материал", "value": "Сталь"}, {"label": "Диаметр", "value": "40 мм"}], "Механизм": [{"label": "Калибр", "value": "32111"}, {"label": "Запас хода", "value": "120 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'iwc-pilot-mark-xx');

INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'iwc-big-pilot',
    'Big Pilot Watch 43',
    'IWC-BP-001',
    (SELECT id FROM brands WHERE slug = 'iwc'),
    (SELECT id FROM categories WHERE slug = 'pilots'),
    158000000,
    'pre-order',
    'Под заказ 14-21 день',
    1,
    0,
    1,
    1,
    18,
    '{"Корпус": [{"label": "Материал", "value": "Сталь"}, {"label": "Диаметр", "value": "43 мм"}], "Механизм": [{"label": "Калибр", "value": "82100"}, {"label": "Запас хода", "value": "168 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'iwc-big-pilot');

-- Breguet products
INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'breguet-classique',
    'Classique 7137',
    'BRG-CL-001',
    (SELECT id FROM brands WHERE slug = 'breguet'),
    (SELECT id FROM categories WHERE slug = 'dress'),
    295000000,
    'in-stock',
    'В наличии',
    0,
    0,
    0,
    1,
    19,
    '{"Корпус": [{"label": "Материал", "value": "Белое золото 18К"}, {"label": "Диаметр", "value": "39 мм"}], "Механизм": [{"label": "Калибр", "value": "502.3SD"}, {"label": "Запас хода", "value": "45 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'breguet-classique');

INSERT INTO products (slug, name, sku, brand_id, category_id, price, availability_status, availability_text, is_new, is_limited, is_featured, is_active, position, specs_json)
SELECT
    'breguet-marine',
    'Marine 5517',
    'BRG-MAR-001',
    (SELECT id FROM brands WHERE slug = 'breguet'),
    (SELECT id FROM categories WHERE slug = 'sport'),
    245000000,
    'pre-order',
    'Под заказ 21-30 дней',
    1,
    0,
    1,
    1,
    20,
    '{"Корпус": [{"label": "Материал", "value": "Титан"}, {"label": "Диаметр", "value": "40 мм"}, {"label": "Водозащита", "value": "100 м"}], "Механизм": [{"label": "Калибр", "value": "777A"}, {"label": "Запас хода", "value": "55 ч"}]}'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'breguet-marine');

-- Add product images for ALL products (including existing ones that may have fewer images)
INSERT OR IGNORE INTO product_images (product_id, url, alt, is_main, position)
SELECT p.id, 'https://picsum.photos/seed/watch-' || p.id || '/800/1000', p.name || ' - главное фото', 1, 1
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.position = 1
);

INSERT OR IGNORE INTO product_images (product_id, url, alt, is_main, position)
SELECT p.id, 'https://picsum.photos/seed/watch-' || p.id || '-2/800/1000', p.name || ' - боковой вид', 0, 2
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.position = 2
);

INSERT OR IGNORE INTO product_images (product_id, url, alt, is_main, position)
SELECT p.id, 'https://picsum.photos/seed/watch-' || p.id || '-3/800/1000', p.name || ' - задняя крышка', 0, 3
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.position = 3
);

-- Add highlights for ALL products
INSERT OR IGNORE INTO product_highlights (product_id, icon, title, description, position)
SELECT p.id, '🛡️', 'Официальная гарантия', 'Гарантия от авторизованного дилера', 1
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_highlights ph WHERE ph.product_id = p.id AND ph.position = 1
);

INSERT OR IGNORE INTO product_highlights (product_id, icon, title, description, position)
SELECT p.id, '📦', 'Полный комплект', 'Коробка, документы, сертификат', 2
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_highlights ph WHERE ph.product_id = p.id AND ph.position = 2
);

INSERT OR IGNORE INTO product_highlights (product_id, icon, title, description, position)
SELECT p.id, '🚚', 'Бесплатная доставка', 'По всей России', 3
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_highlights ph WHERE ph.product_id = p.id AND ph.position = 3
);
