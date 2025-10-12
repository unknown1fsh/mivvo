# 🔧 KULLANICI KREDİ SORUNU ÇÖZÜM RAPORU

**Tarih:** 12 Ekim 2025  
**Sorun:** Kullanıcılar giriş yaptıktan sonra kredileri ve raporları göremiyor  
**Hata:** 304 hatası ve "Veriler yüklenirken hata oluştu" mesajı

---

## 🔍 SORUNUN TEŞHİSİ

### Tespit Edilen Problemler:

1. **UserCredits Kaydı Eksikliği**
   - İki kullanıcı için (`ercanerguler@gmail.com` ve `sce@scegrup.com`) database'de `user_credits` tablosunda kayıt yok
   - Backend'de `getUserCredits` endpoint'i `null` dönüyor
   - Frontend bu durumu handle edemiyor ve hata veriyor

2. **Rapor Maliyet Alanı Uyumsuzluğu**
   - Dashboard'da `report.creditCost` alanı kullanılıyor
   - Database schema'sında sadece `report.totalCost` var
   - Bu yüzden rapor maliyetleri gösterilemiyor

3. **Eski Fiyatlar**
   - Dashboard'da eski fiyatlar kullanılıyordu (25 TL, 35 TL vs.)
   - Yeni fiyatlandırma ile güncellenmeliydi (49 TL, 69 TL, 179 TL)

---

## ✅ YAPILAN DÜZELTMELER

### 1. Backend - UserController.ts Güncellendi

**Değişiklik:** `getUserCredits` fonksiyonuna auto-create özelliği eklendi

```typescript
// Eğer kredi kaydı yoksa otomatik oluştur
if (!userCredits) {
  userCredits = await prisma.userCredits.create({
    data: {
      userId: req.user!.id,
      balance: 0,
      totalPurchased: 0,
      totalUsed: 0,
    },
  });
}
```

**Avantajları:**
- Backward compatibility (eski kullanıcılar için)
- Otomatik kredi kaydı oluşturma
- Hata önleme

**Dosya:** `backend/src/controllers/UserController.ts`

### 2. Frontend - Dashboard.tsx Güncellendi

**Değişiklikler:**

**a) Rapor maliyetleri güncellendi (Yeni fiyatlar):**
```typescript
const reportCosts: Record<string, number> = {
  'PAINT_ANALYSIS': 49,           // Eski: 25
  'DAMAGE_ANALYSIS': 69,           // Eski: 35
  'ENGINE_SOUND_ANALYSIS': 79,     // Eski: 30
  'VALUE_ESTIMATION': 49,          // Eski: 20
  'COMPREHENSIVE_EXPERTISE': 179,  // Eski: 85
}
```

**b) totalCost kullanımı eklendi:**
```typescript
totalCost: Number(report.totalCost || report.creditCost || reportCosts[report.reportType] || 0)
```

**Dosya:** `frontend/app/dashboard/page.tsx`

### 3. SQL Script Oluşturuldu

**Amaç:** Mevcut kullanıcılara kredi yüklemek

**Script Özellikleri:**
- Kullanıcı email'ine göre ID bulma
- Mevcut kredi kaydı varsa güncelleme, yoksa oluşturma
- Transaction kaydı oluşturma
- Sonuç kontrol query'leri

**Dosya:** `backend/add-credits-to-users.sql`

---

## 🚀 DEPLOYMENT ADIMLARı

### Adım 1: Backend Deploy Et

```bash
cd backend
npm run build
```

✅ **Build başarılı!** Hata yok.

### Adım 2: Vercel'e Deploy Et

**Otomatik Deploy:**
- Git commit ve push yap
- Vercel otomatik deploy edecek

**Manuel Deploy:**
```bash
vercel --prod
```

### Adım 3: Database'i Güncelle

**Yöntem 1: Vercel Postgres Dashboard (ÖNERİLEN)**

1. Vercel Dashboard'a git: https://vercel.com/dashboard
2. Projeyi seç: `mivvo`
3. Storage > Postgres seç
4. "Query" sekmesine git
5. `backend/add-credits-to-users.sql` dosyasının içeriğini yapıştır
6. "Run Query" butonuna tıkla

**Yöntem 2: Prisma Studio**

```bash
cd backend
npx prisma studio --browser none
```

Tarayıcıda açılan Prisma Studio'da:
1. `user_credits` tablosuna git
2. Manuel olarak kayıtları oluştur/güncelle:
   - ercanerguler@gmail.com için user_id bul → balance: 1040, totalPurchased: 1040
   - sce@scegrup.com için user_id bul → balance: 5620, totalPurchased: 5620

**Yöntem 3: SQL Client (psql, TablePlus, etc.)**

```bash
# DATABASE_URL'yi .env dosyasından kopyala
psql "YOUR_DATABASE_URL_HERE"

# SQL script'i çalıştır
\i backend/add-credits-to-users.sql
```

---

## 🧪 TEST ETME

### Test Adımları:

1. **Kullanıcı Girişi Testi**
   ```
   Email: ercanerguler@gmail.com
   Beklenen: Başarılı giriş
   ```

2. **Kredi Kontrolü**
   ```
   Dashboard > Kredi Bakiyesi
   Beklenen: 1,040 TL (ercanerguler@gmail.com)
   Beklenen: 5,620 TL (sce@scegrup.com)
   ```

3. **Rapor Listeleme**
   ```
   Dashboard > Son Raporlar
   Beklenen: Raporlar listelensin
   Beklenen: Rapor maliyetleri gösterilsin (49 TL, 69 TL, 179 TL)
   ```

4. **Console Log Kontrolü**
   ```
   Tarayıcı console'da:
   ✅ "📊 Dashboard - Backend response: ..."
   ✅ "📊 Dashboard - User reports: ..."
   ❌ "Veriler yüklenirken hata oluştu" (bu olmamalı)
   ```

---

## 📊 KREDİ DURUMLARI

### Güncellenecek Kullanıcılar:

| Email | İsim | Kredi | User ID | Durum |
|-------|------|-------|---------|--------|
| ercanerguler@gmail.com | SCE ŞİRKETİ | 1,040 TL | ? | USER, Aktif |
| sce@scegrup.com | SCE ŞİRKETİ | 5,620 TL | ? | USER, Aktif |

**Not:** User ID'leri database'den alınacak (SQL script otomatik bulacak)

---

## 🛠️ BACKEND API ENDPOINTLERİ

### Kredi Yükleme API'si (Alternatif Yöntem)

Eğer SQL script yerine API kullanmak isterseniz:

```bash
# 1. Admin olarak giriş yap (veya JWT token al)
# 2. purchaseCredits endpoint'ini kullan

# Kullanıcı 1 için
curl -X POST https://mivvo-expertiz.vercel.app/api/user/credits/purchase \
  -H "Authorization: Bearer USER_1_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1040, "paymentMethod": "MANUAL"}'

# Kullanıcı 2 için
curl -X POST https://mivvo-expertiz.vercel.app/api/user/credits/purchase \
  -H "Authorization: Bearer USER_2_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5620, "paymentMethod": "MANUAL"}'
```

**Not:** Bu yöntem için kullanıcıların JWT token'larına ihtiyacınız var.

---

## 📝 GEÇİCİ ÇÖZÜM (Acil Durum)

Eğer hemen çözüm gerekiyorsa ve deploy bekleyemiyorsanız:

### Frontend'de Geçici Fix:

`frontend/app/dashboard/page.tsx` dosyasında:

```typescript
// Hata durumunda boş veri göster
} catch (error) {
  console.error('Dashboard veri çekme hatası:', error)
  
  // Hata mesajı yerine varsayılan değerler
  setStats({
    totalReports: 0,
    completedReports: 0,
    totalSpent: 0,
    creditBalance: 0
  })
  setReports([])
  
  // toast.error('Veriler yüklenirken hata oluştu') // Kapat
}
```

**Uyarı:** Bu sadece geçici bir çözüm. Asıl sorun backend'de çözülmeli.

---

## 🔒 GÜVENLİK ÖNLEMLERİ

### Database Güvenliği:

1. ✅ SQL injection'a karşı korumalı (parametreli sorgular)
2. ✅ Transaction kayıtları tutulmakta
3. ✅ Audit trail mevcut (created_at, updated_at)
4. ✅ Cascade delete aktif (kullanıcı silinirse kredileri de silinir)

### API Güvenliği:

1. ✅ JWT authentication zorunlu
2. ✅ Kullanıcı sadece kendi verilerine erişebilir
3. ✅ Rate limiting aktif (15 dk'da 100 istek)
4. ✅ CORS policy ayarlanmış

---

## 📈 İZLEME VE LOGLama

### Backend Logları:

Deploy sonrası Vercel'de logları kontrol edin:

```bash
vercel logs --follow
```

Beklenilen loglar:
```
⚠️ UserCredits not found for user 123, creating...
✅ UserCredits created for user 123
```

### Frontend Logları:

Tarayıcı console'da:
```javascript
console.log('📊 Dashboard - Backend response:', reportsResponse.data)
console.log('📊 Dashboard - User reports:', userReports)
```

---

## 🎯 SONUÇ VE TAVSİYELER

### Yapılması Gerekenler:

- [x] Backend kodu güncellendi
- [x] Frontend kodu güncellendi
- [x] SQL script hazırlandı
- [x] Build başarılı
- [ ] **Vercel'e deploy et**
- [ ] **Database'i güncelle (SQL script çalıştır)**
- [ ] **Test et**

### Uzun Vadeli İyileştirmeler:

1. **Migration Script Oluştur:**
   ```bash
   npx prisma migrate dev --name add-user-credits-for-existing-users
   ```

2. **Admin Panel Ekle:**
   - Kullanıcı kredi yönetimi
   - Manuel kredi ekleme/çıkarma
   - Transaction geçmişi görüntüleme

3. **Monitoring Ekle:**
   - Sentry/LogRocket entegrasyonu
   - Error tracking
   - Performance monitoring

4. **Webhook Oluştur:**
   - Ödeme servisi entegrasyonu (Stripe/Iyzico)
   - Otomatik kredi yükleme
   - Email bildirimleri

5. **Cache Mekanizması:**
   - Redis entegrasyonu
   - API response caching
   - 304 hatası çözümü

---

## 🆘 YARDIM VE DESTEK

### Sorun Devam Ederse:

1. **Backend Loglarını Kontrol Et:**
   ```bash
   vercel logs --follow
   ```

2. **Frontend Network Tab:**
   - Tarayıcı DevTools > Network
   - `/api/user/credits` isteğini kontrol et
   - Response body'yi incele

3. **Database Kontrol:**
   ```sql
   SELECT * FROM users WHERE email IN ('ercanerguler@gmail.com', 'sce@scegrup.com');
   SELECT * FROM user_credits WHERE user_id IN (SELECT id FROM users WHERE email IN ('ercanerguler@gmail.com', 'sce@scegrup.com'));
   ```

4. **Environment Variables:**
   - Vercel'de `DATABASE_URL` doğru mu?
   - JWT_SECRET ayarlanmış mı?

---

**Hazırlayan:** AI Assistant  
**Tarih:** 12 Ekim 2025  
**Durum:** ✅ Hazır - Deploy ve Test Bekliyor

