-- Örnek bildirimler ekle (mevcut kullanıcılar için)

-- Kullanıcı ID'lerini al ve örnek bildirimler ekle
INSERT INTO "notifications" ("user_id", "title", "message", "type", "is_read", "action_url", "created_at", "updated_at")
SELECT 
    u.id,
    'Hoş Geldiniz!',
    'Mivvo Expertiz''e hoş geldiniz! İlk raporunuzu oluşturmak için başlayın.',
    'SUCCESS',
    true,
    '/vehicle/new-report',
    u.created_at + INTERVAL '1 day',
    u.created_at + INTERVAL '1 day'
FROM "users" u
WHERE u.role = 'USER';

-- Kredi yükleme bildirimi örneği
INSERT INTO "notifications" ("user_id", "title", "message", "type", "is_read", "action_url", "created_at", "updated_at")
SELECT 
    u.id,
    'Kredi Yüklendi',
    'Hesabınıza 100₺ kredi yüklendi. Yeni bakiyeniz: ' || (uc.balance + 100) || '₺',
    'INFO',
    false,
    '/dashboard',
    u.created_at + INTERVAL '2 days',
    u.created_at + INTERVAL '2 days'
FROM "users" u
JOIN "user_credits" uc ON u.id = uc.user_id
WHERE u.role = 'USER'
LIMIT 5;

-- Rapor tamamlandı bildirimi örneği
INSERT INTO "notifications" ("user_id", "title", "message", "type", "is_read", "action_url", "created_at", "updated_at")
SELECT 
    u.id,
    'Rapor Tamamlandı',
    '34 ABC 123 plakalı Toyota Corolla için tam expertiz raporunuz hazır.',
    'SUCCESS',
    false,
    '/reports',
    u.created_at + INTERVAL '3 days',
    u.created_at + INTERVAL '3 days'
FROM "users" u
WHERE u.role = 'USER'
LIMIT 3;

-- Rapor işleniyor bildirimi örneği
INSERT INTO "notifications" ("user_id", "title", "message", "type", "is_read", "action_url", "created_at", "updated_at")
SELECT 
    u.id,
    'Rapor İşleniyor',
    '06 XYZ 789 plakalı Honda Civic için boya analizi devam ediyor.',
    'INFO',
    true,
    '/reports',
    u.created_at + INTERVAL '4 days',
    u.created_at + INTERVAL '4 days'
FROM "users" u
WHERE u.role = 'USER'
LIMIT 2;

-- Ödeme başarısız bildirimi örneği
INSERT INTO "notifications" ("user_id", "title", "message", "type", "is_read", "action_url", "created_at", "updated_at")
SELECT 
    u.id,
    'Ödeme Başarısız',
    'Son kredi yükleme işleminiz başarısız oldu. Lütfen tekrar deneyin.',
    'WARNING',
    true,
    '/payment/add-credits',
    u.created_at + INTERVAL '5 days',
    u.created_at + INTERVAL '5 days'
FROM "users" u
WHERE u.role = 'USER'
LIMIT 1;
