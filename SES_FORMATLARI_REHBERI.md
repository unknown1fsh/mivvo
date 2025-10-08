# 🎙️ Motor Ses Kaydı Format Rehberi

## ✅ Desteklenen Ses Formatları

Mivvo Expertiz motor ses analizi sistemi, **tüm popüler cep telefonu ve bilgisayar ses formatlarını** desteklemektedir.

---

## 📱 **Cep Telefonu Formatları** (ÖNERİLEN)

### iPhone / iOS
- **M4A** (`.m4a`) - ⭐ En yaygın iPhone formatı
- **AAC** (`.aac`) - Yüksek kalite, düşük boyut
- **CAF** (`.caf`) - iOS Core Audio Format

### Android
- **M4A** (`.m4a`) - ⭐ En yaygın Android formatı
- **AAC** (`.aac`) - Yüksek kalite
- **3GP** (`.3gp`, `.3gp2`) - Eski Android cihazlar
- **AMR** (`.amr`) - Çok düşük boyut (önerilmez)

---

## 💻 **Bilgisayar Formatları**

### Standart Formatlar
- **MP3** (`.mp3`) - Evrensel format, orta kalite
- **WAV** (`.wav`) - ⭐ En yüksek kalite (kayıpsız)
- **OGG** (`.ogg`) - Açık kaynak format
- **WebM** (`.webm`) - Web tarayıcı kayıtları

### Yüksek Kalite Formatlar
- **FLAC** (`.flac`) - ⭐ Kayıpsız sıkıştırma, yüksek kalite
- **Opus** (`.opus`) - Modern, düşük gecikme

---

## 📊 **Format Karşılaştırması**

| Format | Kalite | Dosya Boyutu | Cihaz | Önerilen |
|--------|---------|--------------|-------|----------|
| **WAV** | ⭐⭐⭐⭐⭐ | Çok Büyük | Bilgisayar | ✅ Analiz için en iyi |
| **FLAC** | ⭐⭐⭐⭐⭐ | Büyük | Bilgisayar | ✅ Analiz için en iyi |
| **M4A** | ⭐⭐⭐⭐ | Orta | iPhone/Android | ✅ Cep telefonu için en iyi |
| **AAC** | ⭐⭐⭐⭐ | Küçük | iPhone/Android | ✅ Cep telefonu için en iyi |
| **MP3** | ⭐⭐⭐ | Küçük | Tümü | ✅ Evrensel |
| **3GP** | ⭐⭐ | Çok Küçük | Eski Android | ⚠️ Kalitesi düşük |
| **AMR** | ⭐ | Çok Küçük | Eski Android | ❌ Önerilmez |

---

## 🎯 **Önerilen Kayıt Ayarları**

### Cep Telefonu Kayıtları (iPhone/Android)
```
Format: M4A veya AAC
Kalite: Yüksek (High Quality)
Örnek Hızı: 44.100 Hz (44.1 kHz)
Bit Hızı: 256 kbps veya daha yüksek
Süre: 5-30 saniye
Maksimum Dosya Boyutu: 50 MB
```

### Bilgisayar Kayıtları
```
Format: WAV veya FLAC (en yüksek kalite için)
Örnek Hızı: 44.100 Hz (44.1 kHz)
Bit Derinliği: 16-bit veya 24-bit
Kanal: Mono (Tek kanal) veya Stereo
Süre: 5-30 saniye
Maksimum Dosya Boyutu: 50 MB
```

---

## 📲 **Cep Telefonuyla Nasıl Kayıt Yapılır?**

### iPhone
1. **Ses Kaydedici** (Voice Memos) uygulamasını açın
2. Kırmızı kayıt butonuna basın
3. Motor sesini kaydedin (5-30 saniye)
4. Dur butonuna basın
5. Dosya otomatik olarak **M4A** formatında kaydedilir ✅

### Android
1. **Ses Kaydedici** uygulamasını açın
2. Kayıt butonuna basın
3. Motor sesini kaydedin (5-30 saniye)
4. Dur butonuna basın
5. Dosya genellikle **M4A** veya **AAC** formatında kaydedilir ✅

---

## 🔧 **Teknik Detaylar**

### Backend (Sunucu Tarafı)
```typescript
// Multer konfigürasyonu
const allowedTypes = [
  // Standart formatlar
  'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm',
  
  // iPhone formatları
  'audio/m4a', 'audio/x-m4a', 'audio/mp4', 'audio/aac', 'audio/x-caf',
  
  // Android formatları
  'audio/3gpp', 'audio/3gpp2', 'audio/amr', 'audio/x-amr',
  
  // Web formatları
  'audio/opus', 'audio/flac', 'audio/x-flac'
]
```

### Frontend (İstemci Tarafı)
```html
<input type="file" accept="audio/wav,audio/mp3,audio/m4a,audio/aac,..." />
```

---

## ⚠️ **Önemli Notlar**

### ✅ Yapılması Gerekenler
- ✅ **Motor çalışır durumdayken** kayıt yapın
- ✅ **Sessiz bir ortamda** kayıt yapın (rüzgar, trafik gürültüsü olmadan)
- ✅ **5-30 saniye** arası kayıt yapın
- ✅ **Cep telefonunu motora yakın tutun** (30-50 cm mesafe ideal)
- ✅ **Farklı RPM'lerde** kayıt yapın (rölanti, orta devir, yüksek devir)
- ✅ **Yüksek kalite** ayarını seçin

### ❌ Yapılmaması Gerekenler
- ❌ **Çok kısa** kayıtlar yapmayın (minimum 5 saniye)
- ❌ **Çok uzun** kayıtlar yapmayın (maksimum 30 saniye yeterli)
- ❌ **Gürültülü ortamda** kayıt yapmayın
- ❌ **Telefonla konuşurken** kayıt yapmayın
- ❌ **50 MB'dan büyük** dosya yüklemeyin

---

## 🚀 **Hızlı Başlangıç**

1. **Cep telefonunuzla motor sesini kaydedin**
   - iPhone: Ses Kaydedici → Kayıt → M4A formatında kaydet
   - Android: Ses Kaydedici → Kayıt → M4A/AAC formatında kaydet

2. **Mivvo Expertiz'e gidin**
   - Motor Ses Analizi sayfasını açın
   - "Dosya Yükle" butonuna tıklayın
   - Kaydettiğiniz ses dosyasını seçin

3. **Analizi başlatın**
   - Sistem otomatik olarak formatı algılar
   - AI analizi 30-60 saniye içinde tamamlanır
   - Detaylı raporu görüntüleyin

---

## 🆘 **Sorun Giderme**

### "Desteklenmeyen ses formatı" Hatası
**Sebep:** Ses dosyası formatı desteklenmiyor olabilir.

**Çözüm:**
1. Ses kaydedici ayarlarından formatı değiştirin (M4A veya AAC seçin)
2. Veya dosyayı MP3/WAV formatına dönüştürün
3. Çevrimiçi dönüştürücü kullanabilirsiniz: [cloudconvert.com](https://cloudconvert.com/)

### "Dosya boyutu çok büyük" Hatası
**Sebep:** Ses dosyası 50 MB'dan büyük.

**Çözüm:**
1. Daha kısa kayıt yapın (5-30 saniye yeterli)
2. Kalite ayarını düşürün (256 kbps veya 128 kbps)
3. Veya dosyayı sıkıştırın

### "Ses kalitesi düşük" Uyarısı
**Sebep:** Ses kalitesi motor analizi için yeterli değil.

**Çözüm:**
1. Daha yüksek kalite ayarında kayıt yapın
2. Sessiz ortamda kayıt yapın
3. Telefonu motora daha yakın tutun
4. Gürültü engelleme özelliğini KAPATIN

---

## 📞 **Destek**

Ses kayıt veya yükleme konusunda sorun yaşıyorsanız:
- 📧 Email: destek@mivvo.com
- 📱 WhatsApp: +90 XXX XXX XX XX
- 💬 Canlı Destek: [mivvo.com/destek](https://mivvo.com/destek)

---

**Son Güncelleme:** Ekim 2025  
**Versiyon:** 2.0  
**Desteklenen Format Sayısı:** 15+

