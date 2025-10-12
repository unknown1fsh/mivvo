-- ====================================
-- NEON DATABASE KONTROL SORULARI
-- ====================================
-- Tarih: 12 Ekim 2025
-- Amaç: Kullanıcı kredi sorununu tespit etmek

-- ====================================
-- ADIM 1: KULLANICILARI KONTROL ET
-- ====================================

-- Bu iki kullanıcının database'de olduğunu doğrula
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_at
FROM users 
WHERE email IN ('ercanerguler@gmail.com', 'sce@scegrup.com')
ORDER BY email;

-- ====================================
-- ADIM 2: KREDİ KAYITLARINI KONTROL ET
-- ====================================

-- Bu kullanıcıların user_credits tablosunda kayıtları var mı?
SELECT 
    uc.id as credit_id,
    uc.user_id,
    u.email,
    uc.balance,
    uc.total_purchased,
    uc.total_used,
    uc.created_at,
    uc.updated_at
FROM user_credits uc
JOIN users u ON uc.user_id = u.id
WHERE u.email IN ('ercanerguler@gmail.com', 'sce@scegrup.com')
ORDER BY u.email;

-- ====================================
-- ADIM 3: KREDİ TRANSACTION GEÇMİŞİ
-- ====================================

-- Admin tarafından yapılan kredi yüklemelerini göster
SELECT 
    ct.id,
    u.email,
    ct.transaction_type,
    ct.amount,
    ct.description,
    ct.reference_id,
    ct.created_at
FROM credit_transactions ct
JOIN users u ON ct.user_id = u.id
WHERE u.email IN ('ercanerguler@gmail.com', 'sce@scegrup.com')
ORDER BY ct.created_at DESC;

-- ====================================
-- ADIM 4: TÜM KULLANICILARIN KREDİLERİ (KARŞILAŞTIRMA İÇİN)
-- ====================================

-- Diğer kullanıcıların kredileri düzgün çalışıyor mu kontrol et
SELECT 
    u.id,
    u.email,
    u.first_name,
    COALESCE(uc.balance, 0) as balance,
    COALESCE(uc.total_purchased, 0) as total_purchased,
    COALESCE(uc.total_used, 0) as total_used,
    CASE 
        WHEN uc.id IS NULL THEN 'YOK ❌'
        ELSE 'VAR ✅'
    END as kredi_kaydi_durumu
FROM users u
LEFT JOIN user_credits uc ON u.id = uc.user_id
WHERE u.role = 'USER'
ORDER BY u.created_at DESC
LIMIT 10;

-- ====================================
-- ADIM 5: DETAYLI SORUN TESPİTİ
-- ====================================

-- Problemi tam olarak anlamak için detaylı analiz
SELECT 
    u.id as user_id,
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    
    -- User Credits durumu
    CASE 
        WHEN uc.id IS NULL THEN '❌ UserCredits kaydı YOK'
        ELSE '✅ UserCredits kaydı VAR'
    END as credit_record_status,
    
    -- Bakiye bilgileri
    COALESCE(uc.balance, 0) as current_balance,
    COALESCE(uc.total_purchased, 0) as total_purchased,
    COALESCE(uc.total_used, 0) as total_used,
    
    -- Transaction sayısı
    (SELECT COUNT(*) FROM credit_transactions WHERE user_id = u.id) as transaction_count,
    (SELECT COUNT(*) FROM credit_transactions WHERE user_id = u.id AND transaction_type = 'PURCHASE') as purchase_count,
    (SELECT COUNT(*) FROM credit_transactions WHERE user_id = u.id AND transaction_type = 'USAGE') as usage_count,
    
    -- Son işlem tarihi
    (SELECT MAX(created_at) FROM credit_transactions WHERE user_id = u.id) as last_transaction_date,
    
    -- Rapor sayısı
    (SELECT COUNT(*) FROM vehicle_reports WHERE user_id = u.id) as report_count,
    
    -- Timestamps
    u.created_at as user_created_at,
    uc.updated_at as credits_updated_at
    
FROM users u
LEFT JOIN user_credits uc ON u.id = uc.user_id
WHERE u.email IN ('ercanerguler@gmail.com', 'sce@scegrup.com')
ORDER BY u.email;

-- ====================================
-- ADIM 6: TRANSACTION ve BALANCE UYUMSUZLUĞU
-- ====================================

-- Transaction toplamı ile balance uyumlu mu?
SELECT 
    u.email,
    uc.balance as current_balance,
    
    -- Tüm PURCHASE transaction'ların toplamı
    (SELECT COALESCE(SUM(amount), 0) 
     FROM credit_transactions 
     WHERE user_id = u.id AND transaction_type = 'PURCHASE') as total_purchased_from_transactions,
    
    -- Tüm USAGE transaction'ların toplamı
    (SELECT COALESCE(SUM(amount), 0) 
     FROM credit_transactions 
     WHERE user_id = u.id AND transaction_type = 'USAGE') as total_used_from_transactions,
    
    -- Hesaplanan bakiye (PURCHASE - USAGE)
    (SELECT COALESCE(SUM(CASE 
        WHEN transaction_type = 'PURCHASE' THEN amount
        WHEN transaction_type = 'USAGE' THEN -amount
        WHEN transaction_type = 'REFUND' THEN amount
        ELSE 0
    END), 0) FROM credit_transactions WHERE user_id = u.id) as calculated_balance,
    
    -- Fark var mı?
    uc.balance - (SELECT COALESCE(SUM(CASE 
        WHEN transaction_type = 'PURCHASE' THEN amount
        WHEN transaction_type = 'USAGE' THEN -amount
        WHEN transaction_type = 'REFUND' THEN amount
        ELSE 0
    END), 0) FROM credit_transactions WHERE user_id = u.id) as balance_difference,
    
    CASE 
        WHEN ABS(uc.balance - (SELECT COALESCE(SUM(CASE 
            WHEN transaction_type = 'PURCHASE' THEN amount
            WHEN transaction_type = 'USAGE' THEN -amount
            WHEN transaction_type = 'REFUND' THEN amount
            ELSE 0
        END), 0) FROM credit_transactions WHERE user_id = u.id)) > 0.01 
        THEN '⚠️ UYUMSUZLUK VAR'
        ELSE '✅ UYUMLU'
    END as balance_check

FROM users u
JOIN user_credits uc ON u.id = uc.user_id
WHERE u.email IN ('ercanerguler@gmail.com', 'sce@scegrup.com')
ORDER BY u.email;

-- ====================================
-- ADIM 7: RAPORLARI KONTROL ET
-- ====================================

-- Bu kullanıcıların raporları var mı?
SELECT 
    u.email,
    vr.id as report_id,
    vr.report_type,
    vr.status,
    vr.total_cost,
    vr.vehicle_plate,
    vr.vehicle_brand,
    vr.vehicle_model,
    vr.created_at
FROM vehicle_reports vr
JOIN users u ON vr.user_id = u.id
WHERE u.email IN ('ercanerguler@gmail.com', 'sce@scegrup.com')
ORDER BY vr.created_at DESC
LIMIT 20;

-- ====================================
-- ADIM 8: ADMIN PANEL TRANSACTION KONTROLÜ
-- ====================================

-- Admin tarafından en son yapılan işlemler
SELECT 
    ct.id,
    u.email,
    ct.transaction_type,
    ct.amount,
    ct.description,
    ct.reference_id,
    ct.created_at,
    -- Transaction'dan sonra balance güncellenmiş mi?
    (SELECT uc.balance FROM user_credits uc WHERE uc.user_id = ct.user_id) as current_balance_in_table
FROM credit_transactions ct
JOIN users u ON ct.user_id = u.id
WHERE u.email IN ('ercanerguler@gmail.com', 'sce@scegrup.com')
  AND ct.created_at > NOW() - INTERVAL '7 days'  -- Son 7 günün işlemleri
ORDER BY ct.created_at DESC;

-- ====================================
-- SONUÇ ÖZET TABLOSU
-- ====================================

SELECT 
    '================================' as "ÖZET RAPOR",
    '' as " "
UNION ALL
SELECT 
    'Kullanıcı Email' as col1,
    u.email as col2
FROM users u
WHERE u.email IN ('ercanerguler@gmail.com', 'sce@scegrup.com')
UNION ALL
SELECT 
    'UserCredits Var mı?' as col1,
    CASE WHEN uc.id IS NOT NULL THEN '✅ Evet' ELSE '❌ Hayır' END as col2
FROM users u
LEFT JOIN user_credits uc ON u.id = uc.user_id
WHERE u.email IN ('ercanerguler@gmail.com', 'sce@scegrup.com')
UNION ALL
SELECT 
    'Mevcut Bakiye' as col1,
    COALESCE(uc.balance::TEXT, '0') || ' TL' as col2
FROM users u
LEFT JOIN user_credits uc ON u.id = uc.user_id
WHERE u.email IN ('ercanerguler@gmail.com', 'sce@scegrup.com')
UNION ALL
SELECT 
    'Transaction Sayısı' as col1,
    COUNT(ct.id)::TEXT as col2
FROM users u
LEFT JOIN credit_transactions ct ON u.id = ct.user_id
WHERE u.email IN ('ercanerguler@gmail.com', 'sce@scegrup.com')
GROUP BY u.email;

