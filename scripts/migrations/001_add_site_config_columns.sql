-- Migration: 001_add_site_config_columns
-- Description: Add category and is_sensitive columns to site_config
-- Date: 2025-12-20

-- Add category column if not exists
ALTER TABLE site_config ADD COLUMN category TEXT DEFAULT 'general';

-- Add is_sensitive column if not exists
ALTER TABLE site_config ADD COLUMN is_sensitive INTEGER DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_site_config_category ON site_config(category);
CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(key);

-- Seed initial email settings
INSERT OR IGNORE INTO site_config (key, value, type, category, description, is_sensitive) VALUES
('email_provider', 'smtp', 'string', 'email', 'Провайдер email: smtp, sendgrid, mailgun', 0),
('smtp_host', '', 'string', 'email', 'SMTP сервер (например: smtp.gmail.com)', 0),
('smtp_port', '587', 'number', 'email', 'SMTP порт (587 для TLS, 465 для SSL)', 0),
('smtp_user', '', 'string', 'email', 'SMTP пользователь (email)', 0),
('smtp_password', '', 'string', 'email', 'SMTP пароль', 1),
('smtp_from_email', 'orders@moditimewatch.ru', 'string', 'email', 'Email отправителя', 0),
('smtp_from_name', 'Moditimewatch', 'string', 'email', 'Имя отправителя', 0),
('email_enabled', 'false', 'boolean', 'email', 'Включить email уведомления', 0);

-- Seed initial Telegram settings
INSERT OR IGNORE INTO site_config (key, value, type, category, description, is_sensitive) VALUES
('telegram_bot_token', '', 'string', 'telegram', 'Токен Telegram бота от @BotFather', 1),
('telegram_channel_id', '', 'string', 'telegram', 'ID канала для уведомлений (например: -1001234567890)', 0),
('telegram_enabled', 'false', 'boolean', 'telegram', 'Включить Telegram уведомления', 0);

-- Seed general settings
INSERT OR IGNORE INTO site_config (key, value, type, category, description, is_sensitive) VALUES
('site_name', 'Moditimewatch', 'string', 'general', 'Название сайта', 0),
('site_url', 'https://moditimewatch.ru', 'string', 'general', 'URL основного сайта', 0),
('admin_email', 'admin@moditimewatch.ru', 'string', 'general', 'Email администратора', 0);
