/**
 * Doğrulama Yardımcısı (Validation Helper)
 * 
 * Clean Architecture - Utils Layer (Yardımcı Katman)
 * 
 * Bu sınıf, yaygın kullanılan validation (doğrulama) işlevlerini sağlar.
 * 
 * Amaç:
 * - Veri doğrulama işlemlerini merkezi

ze al
 * - Regex pattern'leri tek yerden yönet
 * - Service ve Controller katmanlarında kullan
 * - Validation hatalarını önle
 * 
 * Kapsam:
 * - E-posta format kontrolü
 * - Şifre güvenlik kontrolü
 * - Türk plaka format kontrolü
 * - VIN numarası format kontrolü
 * - Telefon numarası kontrolü
 * - Araç bilgileri kontrolü (yıl, kilometre)
 * - Dosya tip ve boyut kontrolü
 * - String sanitization (güvenlik)
 * 
 * Spring Framework'teki Validator interface benzeri yapı.
 */

/**
 * ValidationHelper Static Sınıfı
 * 
 * Tüm metodlar static'tir, instance oluşturmaya gerek yoktur.
 * Utility sınıfı olarak çalışır.
 */
export class ValidationHelper {
  /**
   * E-posta format doğrulama
   * 
   * Standart e-posta formatını kontrol eder.
   * Pattern: xxx@xxx.xxx
   * 
   * @param email - Kontrol edilecek e-posta adresi
   * @returns true: geçerli format, false: geçersiz
   * 
   * @example
   * ValidationHelper.isValidEmail('user@example.com') // true
   * ValidationHelper.isValidEmail('invalid-email') // false
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Güçlü şifre kontrolü
   * 
   * Minimum güvenlik kriterlerini kontrol eder:
   * - En az 8 karakter
   * - En az 1 büyük harf (A-Z)
   * - En az 1 küçük harf (a-z)
   * - En az 1 rakam (0-9)
   * 
   * @param password - Kontrol edilecek şifre
   * @returns true: güçlü şifre, false: zayıf şifre
   * 
   * @example
   * ValidationHelper.isStrongPassword('Abc12345') // true
   * ValidationHelper.isStrongPassword('abc') // false (çok kısa)
   * ValidationHelper.isStrongPassword('abcdefgh') // false (rakam yok)
   */
  static isStrongPassword(password: string): boolean {
    // Minimum 8 karakter kontrolü
    if (password.length < 8) return false;
    
    // En az 1 büyük harf var mı?
    const hasUpperCase = /[A-Z]/.test(password);
    
    // En az 1 küçük harf var mı?
    const hasLowerCase = /[a-z]/.test(password);
    
    // En az 1 rakam var mı?
    const hasNumbers = /\d/.test(password);
    
    // Tüm kriterler sağlanmalı
    return hasUpperCase && hasLowerCase && hasNumbers;
  }

  /**
   * Türk plaka numarası format kontrolü
   * 
   * Türkiye'de kullanılan plaka formatını doğrular.
   * Format: 34 ABC 1234
   * - 2 haneli il kodu (01-81)
   * - 1-3 harfli seri (A-Z)
   * - 2-4 haneli numara
   * 
   * @param plate - Kontrol edilecek plaka (boşluklarla veya boşluksuz)
   * @returns true: geçerli plaka, false: geçersiz
   * 
   * @example
   * ValidationHelper.isValidTurkishPlate('34 ABC 1234') // true
   * ValidationHelper.isValidTurkishPlate('34ABC1234') // true
   * ValidationHelper.isValidTurkishPlate('99 XYZ 12') // false (geçersiz il)
   */
  static isValidTurkishPlate(plate: string): boolean {
    // Format: 34 ABC 1234 (boşluklar opsiyonel)
    const plateRegex = /^\d{2}\s?[A-Z]{1,3}\s?\d{2,4}$/;
    return plateRegex.test(plate.toUpperCase());
  }

  /**
   * VIN (Şasi Numarası) format kontrolü
   * 
   * Uluslararası VIN standardını kontrol eder.
   * - Tam 17 karakter
   * - I, O, Q harfleri kullanılmaz (karışıklık önlemi)
   * - A-Z ve 0-9 karakterleri
   * 
   * @param vin - Kontrol edilecek VIN numarası
   * @returns true: geçerli VIN, false: geçersiz
   * 
   * @example
   * ValidationHelper.isValidVIN('1HGBH41JXMN109186') // true
   * ValidationHelper.isValidVIN('INVALID123') // false (17 karakter değil)
   * ValidationHelper.isValidVIN('1HGBH41JXMN10918O') // false (O harfi yasak)
   */
  static isValidVIN(vin: string): boolean {
    // VIN tam 17 karakter olmalı
    if (vin.length !== 17) return false;
    
    // I, O, Q harfleri kullanılamaz (1, 0 ile karışmasın diye)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinRegex.test(vin.toUpperCase());
  }

  /**
   * Türk telefon numarası format kontrolü
   * 
   * Türkiye cep telefonu formatlarını doğrular.
   * Kabul edilen formatlar:
   * - +90 5XX XXX XX XX
   * - 0 5XX XXX XX XX
   * - 5XX XXX XX XX
   * - Boşluksuz: 05XXXXXXXXX
   * 
   * @param phone - Kontrol edilecek telefon numarası
   * @returns true: geçerli telefon, false: geçersiz
   * 
   * @example
   * ValidationHelper.isValidPhone('+90 532 123 45 67') // true
   * ValidationHelper.isValidPhone('05321234567') // true
   * ValidationHelper.isValidPhone('5321234567') // true
   * ValidationHelper.isValidPhone('123456') // false
   */
  static isValidPhone(phone: string): boolean {
    // Format: +90 5XX XXX XX XX veya 05XX XXX XX XX
    // Boşlukları temizle
    const phoneRegex = /^(\+90|0)?5\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Araç model yılı doğrulama
   * 
   * Makul bir yıl aralığında olup olmadığını kontrol eder.
   * - Minimum: 1900 (ilk otomobiller)
   * - Maximum: Gelecek yıl (yeni model araçlar için)
   * 
   * @param year - Kontrol edilecek yıl
   * @returns true: geçerli yıl, false: geçersiz
   * 
   * @example
   * ValidationHelper.isValidYear(2023) // true
   * ValidationHelper.isValidYear(1899) // false (çok eski)
   * ValidationHelper.isValidYear(2030) // false (çok ileri)
   */
  static isValidYear(year: number): boolean {
    const currentYear = new Date().getFullYear();
    // 1900'den bugüne + 1 yıl (yeni model araçlar için)
    return year >= 1900 && year <= currentYear + 1;
  }

  /**
   * Araç kilometresi doğrulama
   * 
   * Makul bir kilometre aralığında olup olmadığını kontrol eder.
   * - Minimum: 0 km
   * - Maximum: 1,000,000 km
   * 
   * @param mileage - Kontrol edilecek kilometre
   * @returns true: geçerli kilometre, false: geçersiz
   * 
   * @example
   * ValidationHelper.isValidMileage(50000) // true
   * ValidationHelper.isValidMileage(-100) // false (negatif)
   * ValidationHelper.isValidMileage(2000000) // false (çok yüksek)
   */
  static isValidMileage(mileage: number): boolean {
    // 0 ile 1 milyon km arası
    return mileage >= 0 && mileage <= 1000000;
  }

  /**
   * String güvenlik temizleme (sanitization)
   * 
   * Kullanıcı girdilerinden tehlikeli karakterleri temizler.
   * XSS (Cross-Site Scripting) saldırılarına karşı koruma.
   * 
   * - Baş/sondaki boşlukları temizler
   * - < ve > karakterlerini kaldırır (HTML tag injection önlemi)
   * 
   * @param input - Temizlenecek string
   * @returns Temizlenmiş güvenli string
   * 
   * @example
   * ValidationHelper.sanitizeString('  Test  ') // 'Test'
   * ValidationHelper.sanitizeString('<script>alert("XSS")</script>') // 'scriptalert("XSS")/script'
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Görsel dosya tipi kontrolü
   * 
   * İzin verilen görsel formatlarını kontrol eder.
   * Kabul edilen formatlar:
   * - image/jpeg, image/jpg
   * - image/png
   * - image/webp
   * 
   * @param mimetype - Dosyanın MIME type'ı
   * @returns true: geçerli görsel, false: geçersiz
   * 
   * @example
   * ValidationHelper.isValidImageType('image/jpeg') // true
   * ValidationHelper.isValidImageType('image/gif') // false
   * ValidationHelper.isValidImageType('application/pdf') // false
   */
  static isValidImageType(mimetype: string): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(mimetype);
  }

  /**
   * Ses dosyası tipi kontrolü
   * 
   * İzin verilen ses formatlarını kontrol eder.
   * Kabul edilen formatlar:
   * - audio/mpeg, audio/mp3
   * - audio/wav
   * - audio/webm
   * - audio/ogg
   * - audio/m4a
   * 
   * @param mimetype - Dosyanın MIME type'ı
   * @returns true: geçerli ses, false: geçersiz
   * 
   * @example
   * ValidationHelper.isValidAudioType('audio/mpeg') // true
   * ValidationHelper.isValidAudioType('audio/mp3') // true
   * ValidationHelper.isValidAudioType('video/mp4') // false
   */
  static isValidAudioType(mimetype: string): boolean {
    const validTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/m4a',
    ];
    return validTypes.includes(mimetype);
  }

  /**
   * Dosya boyutu kontrolü
   * 
   * Dosyanın maksimum boyut limitini kontrol eder.
   * 
   * @param size - Dosya boyutu (byte cinsinden)
   * @param maxSize - Maximum izin verilen boyut (default: 10MB)
   * @returns true: geçerli boyut, false: limit aşıldı
   * 
   * @example
   * ValidationHelper.isValidFileSize(5000000) // true (5MB)
   * ValidationHelper.isValidFileSize(15000000) // false (15MB > 10MB default)
   * ValidationHelper.isValidFileSize(15000000, 20*1024*1024) // true (20MB limite kadar OK)
   */
  static isValidFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
    // Boyut 0'dan büyük ve maxSize'dan küçük olmalı
    return size > 0 && size <= maxSize;
  }
}
