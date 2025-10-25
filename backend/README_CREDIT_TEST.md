# Kredi Yönetimi Test Senaryoları

## ✅ Yapılan İyileştirmeler

### 1. Atomik Transaction'lar ✅
- Tüm kredi işlemleri artık `prisma.$transaction` ile atomik
- Yarım kalan işlemler engellendi
- Rollback mekanizması aktif

### 2. Kredi Düşme Düzeltmeleri ✅
- ❌ Önceki: `amount: -amount` (negatif değer)
- ✅ Şimdi: `amount: amount` (pozitif değer)
- `totalUsed` artık doğru güncelleniyor

### 3. Kredi İadesi Güçlendirildi ✅
- İade işlemi atomik hale getirildi
- 3 işlem tek transaction'da:
  1. Kredi iade et
  2. Transaction kaydı oluştur
  3. Raporu FAILED olarak işaretle

## 📋 Test Senaryoları

### Senaryo 1: Normal Analiz Akışı
**Beklenen:** Kredi düşer, transaction kaydedilir, rapor tamamlanır

**Adımlar:**
1. Kredi yükle (örn: 1000 TL)
2. Analiz başlat
3. Kredinin düştüğünü kontrol et
4. Transaction geçmişini kontrol et

### Senaryo 2: Hatalı Analiz
**Beklenen:** Analiz başarısız olursa kredi iade edilir

**Adımlar:**
1. Kredi yükle
2. Analiz başlat
3. OpenAI API key'i yanlış yap (test için)
4. Analiz fail olsun
5. Kredinin iade edildiğini kontrol et
6. Transaction'da REFUND kaydını gör

### Senaryo 3: Kredi Geçmişi
**Beklenen:** Tüm işlemler doğru listelenir

**Adımlar:**
1. Dashboard'dan "Kredi Geçmişi"ne git
2. Tüm transaction'ları gör
3. Filtreleri dene (PURCHASE, USAGE, REFUND)
4. CSV export'u test et

### Senaryo 4: Destek Ticket
**Beklenen:** Hatalı rapor için destek talebi oluştur

**Adımlar:**
1. Hatalı bir analiz varsa
2. "Destek" butonuna tıkla
3. Yeni ticket oluştur
4. Rapor ID'yi ekle
5. Mesajlaşmayı test et

## 🧪 Manuel Test Komutları

### Backend Test
```bash
# 1. Backend başlat
cd backend
npm run dev

# 2. Health check
curl http://localhost:3001/api/health

# 3. Kredi kontrolü
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/user/credits

# 4. Kredi geçmişi
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/user/credits/history
```

### Frontend Test
```bash
# 1. Frontend başlat
cd frontend
npm run dev

# 2. Tarayıcıda test et
# - http://localhost:3000/dashboard
# - http://localhost:3000/dashboard/credit-history
# - http://localhost:3000/dashboard/support
```

## ⚠️ Dikkat Edilmesi Gerekenler

### 1. Kredi Tutarlılığı
- Her transaction sonrası bakiye doğru hesaplanmalı
- `balance + totalUsed` her zaman `totalPurchased`'e eşit olmalı (ama bazen iade olabilir)

### 2. Transaction Status
- ✅ COMPLETED: Başarılı işlem
- ⏳ PENDING: Beklemede (şu an kullanılmıyor ama reserve için hazır)
- ❌ FAILED: Başarısız (henüz kullanılmıyor)
- 🔄 REFUNDED: İade edildi

### 3. Test Verisi
```sql
-- Manuel kredi ekleme (Test kullanıcısı için)
UPDATE user_credits 
SET balance = 1000, total_purchased = 1000 
WHERE user_id = 1;

-- Transaction silme (Test için)
DELETE FROM credit_transactions WHERE user_id = 1;
```

## 🎯 Beklenen Sonuçlar

### Kredi İşlemi Akışı
```
1. Kullanıcı → Kredi düş → COMPLETED
   ├─ balance: 1000 → 701 (299 düşer)
   ├─ totalUsed: 0 → 299
   └─ Transaction: USAGE, status: COMPLETED

2. OpenAI Hata → Kredi iade → REFUNDED
   ├─ balance: 701 → 1000 (299 iade)
   ├─ totalUsed: 299 → 0
   ├─ Transaction: REFUND, status: COMPLETED
   └─ Report: status → FAILED
```

## 📊 Frontend Görüntüleme

### Dashboard
- ✅ Kredi bakiyesi gösterimi
- ✅ Son 5 transaction
- ✅ "Kredi Geçmişi" butonu
- ✅ "Destek" butonu

### Kredi Geçmişi
- ✅ Tüm transaction'lar listeleniyor
- ✅ Filtreleme çalışıyor (type, status)
- ✅ Pagination çalışıyor
- ✅ CSV export çalışıyor

### Destek
- ✅ Ticket listesi
- ✅ Yeni ticket oluşturma
- ✅ Mesajlaşma
- ✅ Durum takibi

## 🚨 Kritik Kontroller

1. **Kredi Bakiyesi Her Zaman Doğru mu?**
   ```sql
   -- Kontrol et
   SELECT 
     u.email,
     uc.balance,
     uc.total_purchased,
     uc.total_used,
     (uc.total_purchased - uc.total_used) as calculated_balance
   FROM user_credits uc
   JOIN users u ON uc.user_id = u.id;
   ```

2. **Transaction Toplamı Doğru mu?**
   ```sql
   -- Kontrol et
   SELECT 
     u.email,
     SUM(CASE WHEN ct.transaction_type = 'PURCHASE' THEN ct.amount ELSE 0 END) as total_purchased,
     SUM(CASE WHEN ct.transaction_type = 'USAGE' THEN ct.amount ELSE 0 END) as total_used,
     SUM(CASE WHEN ct.transaction_type = 'REFUND' THEN ct.amount ELSE 0 END) as total_refunded
   FROM credit_transactions ct
   JOIN users u ON ct.user_id = u.id
   GROUP BY u.email;
   ```

3. **Eksik veya Çift Düşme Var mı?**
   ```sql
   -- Aynı report_id için çift transaction var mı?
   SELECT reference_id, COUNT(*) 
   FROM credit_transactions 
   WHERE transaction_type = 'USAGE'
   GROUP BY reference_id 
   HAVING COUNT(*) > 1;
   ```

## ✅ Başarı Kriterleri

- [x] Kredi düşme atomik çalışıyor
- [x] Kredi iade atomik çalışıyor
- [x] Transaction'lar doğru kaydediliyor
- [x] Frontend sayfaları çalışıyor
- [x] Destek sistemi çalışıyor
- [ ] E2E test senaryoları tamamlandı
- [ ] Production deployment hazır

