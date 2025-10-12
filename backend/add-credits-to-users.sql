-- Kullanıcı Kredileri Güncelleme Script'i
-- Tarih: 12 Ekim 2025
-- Amaç: Belirli kullanıcılara kredi yüklemek

-- ===== KULLANICI 1: ercanerguler@gmail.com =====
-- Kredi: 1,040 TL

-- Önce kullanıcı ID'sini bul
DO $$
DECLARE
    v_user_id INT;
    v_credit_exists BOOLEAN;
BEGIN
    -- Kullanıcı ID'sini bul
    SELECT id INTO v_user_id FROM users WHERE email = 'ercanerguler@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Kullanıcı bulunamadı: ercanerguler@gmail.com';
    ELSE
        RAISE NOTICE 'Kullanıcı bulundu: ID = %', v_user_id;
        
        -- UserCredits kaydı var mı kontrol et
        SELECT EXISTS(SELECT 1 FROM user_credits WHERE user_id = v_user_id) INTO v_credit_exists;
        
        IF v_credit_exists THEN
            -- Mevcut kaydı güncelle
            UPDATE user_credits 
            SET 
                balance = balance + 1040,
                total_purchased = total_purchased + 1040,
                updated_at = NOW()
            WHERE user_id = v_user_id;
            
            RAISE NOTICE 'Kredi güncellendi: +1,040 TL';
        ELSE
            -- Yeni kayıt oluştur
            INSERT INTO user_credits (user_id, balance, total_purchased, total_used, created_at, updated_at)
            VALUES (v_user_id, 1040, 1040, 0, NOW(), NOW());
            
            RAISE NOTICE 'Yeni kredi kaydı oluşturuldu: 1,040 TL';
        END IF;
        
        -- Transaction kaydı oluştur
        INSERT INTO credit_transactions (user_id, transaction_type, amount, description, reference_id, created_at)
        VALUES (v_user_id, 'PURCHASE', 1040, 'Manuel kredi yükleme - SCE ŞİRKETİ', 'MANUAL_' || NOW()::TEXT, NOW());
        
        RAISE NOTICE 'Transaction kaydı oluşturuldu';
    END IF;
END $$;

-- ===== KULLANICI 2: sce@scegrup.com =====
-- Kredi: 5,620 TL

DO $$
DECLARE
    v_user_id INT;
    v_credit_exists BOOLEAN;
BEGIN
    -- Kullanıcı ID'sini bul
    SELECT id INTO v_user_id FROM users WHERE email = 'sce@scegrup.com';
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Kullanıcı bulunamadı: sce@scegrup.com';
    ELSE
        RAISE NOTICE 'Kullanıcı bulundu: ID = %', v_user_id;
        
        -- UserCredits kaydı var mı kontrol et
        SELECT EXISTS(SELECT 1 FROM user_credits WHERE user_id = v_user_id) INTO v_credit_exists;
        
        IF v_credit_exists THEN
            -- Mevcut kaydı güncelle
            UPDATE user_credits 
            SET 
                balance = balance + 5620,
                total_purchased = total_purchased + 5620,
                updated_at = NOW()
            WHERE user_id = v_user_id;
            
            RAISE NOTICE 'Kredi güncellendi: +5,620 TL';
        ELSE
            -- Yeni kayıt oluştur
            INSERT INTO user_credits (user_id, balance, total_purchased, total_used, created_at, updated_at)
            VALUES (v_user_id, 5620, 5620, 0, NOW(), NOW());
            
            RAISE NOTICE 'Yeni kredi kaydı oluşturuldu: 5,620 TL';
        END IF;
        
        -- Transaction kaydı oluştur
        INSERT INTO credit_transactions (user_id, transaction_type, amount, description, reference_id, created_at)
        VALUES (v_user_id, 'PURCHASE', 5620, 'Manuel kredi yükleme - SCE ŞİRKETİ', 'MANUAL_' || NOW()::TEXT, NOW());
        
        RAISE NOTICE 'Transaction kaydı oluşturuldu';
    END IF;
END $$;

-- ===== SONUÇ KONTROL =====
-- Güncellenmiş kredi bilgilerini göster

SELECT 
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    COALESCE(uc.balance, 0) as balance,
    COALESCE(uc.total_purchased, 0) as total_purchased,
    COALESCE(uc.total_used, 0) as total_used,
    uc.updated_at
FROM users u
LEFT JOIN user_credits uc ON u.id = uc.user_id
WHERE u.email IN ('ercanerguler@gmail.com', 'sce@scegrup.com')
ORDER BY u.email;

-- Son transaction'ları göster
SELECT 
    u.email,
    ct.transaction_type,
    ct.amount,
    ct.description,
    ct.created_at
FROM credit_transactions ct
JOIN users u ON ct.user_id = u.id
WHERE u.email IN ('ercanerguler@gmail.com', 'sce@scegrup.com')
ORDER BY ct.created_at DESC
LIMIT 10;

