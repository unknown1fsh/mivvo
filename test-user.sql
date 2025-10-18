-- Test kullanıcısı oluşturma script'i
-- Railway PostgreSQL'de çalıştırın

INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified, created_at, updated_at)
VALUES (
  'test@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', -- 123456
  'Test',
  'User',
  'USER',
  true,
  true,
  NOW(),
  NOW()
);

-- Kullanıcı kredisi ekleme
INSERT INTO user_credits (user_id, balance, total_purchased, total_used, created_at, updated_at)
VALUES (
  (SELECT id FROM users WHERE email = 'test@example.com'),
  100.00,
  100.00,
  0.00,
  NOW(),
  NOW()
);
