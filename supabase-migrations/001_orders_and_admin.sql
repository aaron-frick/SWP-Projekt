-- ============================================================
-- Migration 001: Orders table + Admin users
-- Führe dieses Script im Supabase SQL Editor aus:
-- https://supabase.com/dashboard/project/lqplmdvwmlmoisoecqzp/sql
-- ============================================================

-- ------------------------------------------------------------
-- 1. orders Tabelle (T-US-ADMIN-02-01: Herkunft/Referrer)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
  items       JSONB         NOT NULL DEFAULT '[]',
  total       DECIMAL(10,2) NOT NULL DEFAULT 0,
  source      TEXT          NOT NULL DEFAULT 'direct',  -- google | instagram | facebook | newsletter | direct
  referrer    TEXT,                                      -- volle Referrer-URL
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Service-Role darf alles (Admin-Dashboard)
CREATE POLICY "service_role_all" ON orders
  FOR ALL USING (true);

-- User darf nur eigene Bestellungen sehen
CREATE POLICY "users_own_orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 2. Beispieldaten (letzte 30 Tage, verschiedene Quellen)
-- ------------------------------------------------------------
INSERT INTO orders (items, total, source, referrer, created_at) VALUES

-- Woche 1 (vor 25-30 Tagen)
('[{"product_slug":"vitamin-c-1000","product_name":"Vitamin C 1000mg","price":12.99,"quantity":2}]',
 25.98, 'google', 'https://google.com/search?q=vitamin+c', NOW() - INTERVAL '29 days'),

('[{"product_slug":"omega-3-kapseln","product_name":"Omega-3 Kapseln","price":19.99,"quantity":1},{"product_slug":"vitamin-d3","product_name":"Vitamin D3 2000 IE","price":8.99,"quantity":1}]',
 28.98, 'direct', NULL, NOW() - INTERVAL '28 days'),

('[{"product_slug":"magnesium-citrat","product_name":"Magnesium Citrat","price":14.99,"quantity":3}]',
 44.97, 'instagram', 'https://instagram.com/healthshop_at', NOW() - INTERVAL '27 days'),

('[{"product_slug":"probiotika-komplex","product_name":"Probiotika Komplex","price":24.99,"quantity":1}]',
 24.99, 'facebook', 'https://facebook.com/healthshop', NOW() - INTERVAL '26 days'),

('[{"product_slug":"vitamin-c-1000","product_name":"Vitamin C 1000mg","price":12.99,"quantity":1},{"product_slug":"zink-plus","product_name":"Zink Plus","price":9.99,"quantity":2}]',
 32.97, 'newsletter', 'https://mail.healthshop.at', NOW() - INTERVAL '25 days'),

-- Woche 2 (vor 18-24 Tagen)
('[{"product_slug":"omega-3-kapseln","product_name":"Omega-3 Kapseln","price":19.99,"quantity":2}]',
 39.98, 'google', 'https://google.com/search?q=omega+3', NOW() - INTERVAL '24 days'),

('[{"product_slug":"vitamin-d3","product_name":"Vitamin D3 2000 IE","price":8.99,"quantity":4}]',
 35.96, 'direct', NULL, NOW() - INTERVAL '23 days'),

('[{"product_slug":"magnesium-citrat","product_name":"Magnesium Citrat","price":14.99,"quantity":1},{"product_slug":"probiotika-komplex","product_name":"Probiotika Komplex","price":24.99,"quantity":1}]',
 39.98, 'instagram', 'https://instagram.com/healthshop_at', NOW() - INTERVAL '22 days'),

('[{"product_slug":"vitamin-c-1000","product_name":"Vitamin C 1000mg","price":12.99,"quantity":3}]',
 38.97, 'google', 'https://google.com', NOW() - INTERVAL '21 days'),

('[{"product_slug":"zink-plus","product_name":"Zink Plus","price":9.99,"quantity":1},{"product_slug":"omega-3-kapseln","product_name":"Omega-3 Kapseln","price":19.99,"quantity":1}]',
 29.98, 'newsletter', 'https://mail.healthshop.at', NOW() - INTERVAL '20 days'),

('[{"product_slug":"kurkuma-extrakt","product_name":"Kurkuma Extrakt","price":16.99,"quantity":2}]',
 33.98, 'facebook', 'https://facebook.com/healthshop', NOW() - INTERVAL '19 days'),

('[{"product_slug":"vitamin-d3","product_name":"Vitamin D3 2000 IE","price":8.99,"quantity":2},{"product_slug":"vitamin-c-1000","product_name":"Vitamin C 1000mg","price":12.99,"quantity":1}]',
 30.97, 'direct', NULL, NOW() - INTERVAL '18 days'),

-- Woche 3 (vor 11-17 Tagen)
('[{"product_slug":"omega-3-kapseln","product_name":"Omega-3 Kapseln","price":19.99,"quantity":3}]',
 59.97, 'google', 'https://google.com/search?q=fischöl+kapseln', NOW() - INTERVAL '17 days'),

('[{"product_slug":"probiotika-komplex","product_name":"Probiotika Komplex","price":24.99,"quantity":2}]',
 49.98, 'instagram', 'https://instagram.com/healthshop_at', NOW() - INTERVAL '16 days'),

('[{"product_slug":"magnesium-citrat","product_name":"Magnesium Citrat","price":14.99,"quantity":2},{"product_slug":"zink-plus","product_name":"Zink Plus","price":9.99,"quantity":2}]',
 49.96, 'direct', NULL, NOW() - INTERVAL '15 days'),

('[{"product_slug":"vitamin-c-1000","product_name":"Vitamin C 1000mg","price":12.99,"quantity":4}]',
 51.96, 'newsletter', 'https://mail.healthshop.at', NOW() - INTERVAL '14 days'),

('[{"product_slug":"kurkuma-extrakt","product_name":"Kurkuma Extrakt","price":16.99,"quantity":1},{"product_slug":"omega-3-kapseln","product_name":"Omega-3 Kapseln","price":19.99,"quantity":1}]',
 36.98, 'google', 'https://google.com', NOW() - INTERVAL '13 days'),

('[{"product_slug":"vitamin-d3","product_name":"Vitamin D3 2000 IE","price":8.99,"quantity":6}]',
 53.94, 'facebook', 'https://facebook.com/healthshop', NOW() - INTERVAL '12 days'),

('[{"product_slug":"zink-plus","product_name":"Zink Plus","price":9.99,"quantity":3},{"product_slug":"vitamin-c-1000","product_name":"Vitamin C 1000mg","price":12.99,"quantity":2}]',
 55.95, 'instagram', 'https://instagram.com/healthshop_at', NOW() - INTERVAL '11 days'),

-- Woche 4 (letzte 10 Tage)
('[{"product_slug":"omega-3-kapseln","product_name":"Omega-3 Kapseln","price":19.99,"quantity":2},{"product_slug":"probiotika-komplex","product_name":"Probiotika Komplex","price":24.99,"quantity":1}]',
 64.97, 'google', 'https://google.com', NOW() - INTERVAL '10 days'),

('[{"product_slug":"vitamin-c-1000","product_name":"Vitamin C 1000mg","price":12.99,"quantity":5}]',
 64.95, 'direct', NULL, NOW() - INTERVAL '9 days'),

('[{"product_slug":"magnesium-citrat","product_name":"Magnesium Citrat","price":14.99,"quantity":2},{"product_slug":"kurkuma-extrakt","product_name":"Kurkuma Extrakt","price":16.99,"quantity":2}]',
 63.96, 'instagram', 'https://instagram.com/healthshop_at', NOW() - INTERVAL '7 days'),

('[{"product_slug":"zink-plus","product_name":"Zink Plus","price":9.99,"quantity":2}]',
 19.98, 'newsletter', 'https://mail.healthshop.at', NOW() - INTERVAL '6 days'),

('[{"product_slug":"omega-3-kapseln","product_name":"Omega-3 Kapseln","price":19.99,"quantity":4}]',
 79.96, 'google', 'https://google.com/search?q=omega+3+kapseln+kaufen', NOW() - INTERVAL '5 days'),

('[{"product_slug":"probiotika-komplex","product_name":"Probiotika Komplex","price":24.99,"quantity":1},{"product_slug":"vitamin-d3","product_name":"Vitamin D3 2000 IE","price":8.99,"quantity":3}]',
 51.96, 'facebook', 'https://facebook.com/healthshop', NOW() - INTERVAL '4 days'),

('[{"product_slug":"vitamin-c-1000","product_name":"Vitamin C 1000mg","price":12.99,"quantity":2},{"product_slug":"magnesium-citrat","product_name":"Magnesium Citrat","price":14.99,"quantity":1}]',
 40.97, 'direct', NULL, NOW() - INTERVAL '3 days'),

('[{"product_slug":"kurkuma-extrakt","product_name":"Kurkuma Extrakt","price":16.99,"quantity":3}]',
 50.97, 'google', 'https://google.com', NOW() - INTERVAL '2 days'),

('[{"product_slug":"omega-3-kapseln","product_name":"Omega-3 Kapseln","price":19.99,"quantity":1},{"product_slug":"zink-plus","product_name":"Zink Plus","price":9.99,"quantity":4}]',
 59.95, 'instagram', 'https://instagram.com/healthshop_at', NOW() - INTERVAL '1 day'),

('[{"product_slug":"probiotika-komplex","product_name":"Probiotika Komplex","price":24.99,"quantity":2},{"product_slug":"vitamin-c-1000","product_name":"Vitamin C 1000mg","price":12.99,"quantity":1}]',
 62.97, 'newsletter', 'https://mail.healthshop.at', NOW());
