/**
 * Dosya Yardımcısı (File Helper)
 * 
 * Clean Architecture - Utils Layer (Yardımcı Katman)
 * 
 * Bu sınıf, dosya işlemleri için yardımcı metodlar sağlar.
 * 
 * Amaç:
 * - Dosya ve klasör işlemlerini merkezi

ze al
 * - Güvenli dosya isimlendirme
 * - Dosya okuma/yazma/silme işlemleri
 * - Upload path yönetimi
 * - Dosya boyutu formatlama
 * 
 * Kapsam:
 * - Klasör oluşturma (recursive)
 * - Benzersiz dosya adı üretme (UUID + timestamp)
 * - Dosya extension (uzantı) alma
 * - Dosya boyutu hesaplama
 * - Dosya silme (güvenli)
 * - Dosya varlık kontrolü
 * - Dosya boyutu formatlama (human-readable)
 * - Upload path belirleme (analiz tipine göre)
 * - Buffer'dan dosya kaydetme
 * - Dosya okuma (buffer olarak)
 * 
 * Node.js fs modülünü wrapper olarak kullanır.
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * FileHelper Static Sınıfı
 * 
 * Tüm metodlar static'tir, instance oluşturmaya gerek yoktur.
 * Utility sınıfı olarak çalışır.
 */
export class FileHelper {
  /**
   * Klasör varlığını kontrol et, yoksa oluştur
   * 
   * Recursive olarak tüm parent klasörleri de oluşturur.
   * Klasör zaten varsa hata vermez.
   * 
   * @param dirPath - Oluşturulacak klasör path'i
   * 
   * @example
   * FileHelper.ensureDirectoryExists('./uploads/damage-analysis/2024');
   * // ./uploads, ./uploads/damage-analysis, ./uploads/damage-analysis/2024 oluşturulur
   */
  static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      // recursive: true ile parent klasörleri de oluştur
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Benzersiz dosya adı üret
   * 
   * Güvenli ve collision-free dosya adı oluşturur.
   * 
   * Format: {sanitizedName}_{timestamp}_{uuid}.{ext}
   * Örnek: araç_fotoğrafı_1699887600000_a1b2c3d4.jpg
   * 
   * Güvenlik:
   * - Özel karakterler temizlenir
   * - Collision riski minimize edilir (timestamp + UUID)
   * - Dosya uzantısı korunur
   * 
   * @param originalName - Orijinal dosya adı
   * @returns Benzersiz ve güvenli dosya adı
   * 
   * @example
   * FileHelper.generateUniqueFilename('araç fotoğrafı.jpg');
   * // 'ara_foto_raf_1699887600000_a1b2c3d4.jpg'
   */
  static generateUniqueFilename(originalName: string): string {
    // Dosya uzantısını al (.jpg, .png vb.)
    const ext = path.extname(originalName);
    
    // Uzantısız dosya adını al
    const baseName = path.basename(originalName, ext);
    
    // Özel karakterleri temizle (sadece harf, rakam ve _ kalır)
    const sanitized = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    
    // 8 karakterlik UUID (kısa versiyon)
    const uuid = uuidv4().slice(0, 8);
    
    // Unix timestamp (benzersizlik için)
    const timestamp = Date.now();
    
    // Format: {sanitized}_{timestamp}_{uuid}{ext}
    return `${sanitized}_${timestamp}_${uuid}${ext}`;
  }

  /**
   * Dosya uzantısını al
   * 
   * Dosya adından extension'ı çıkarır (küçük harfle).
   * 
   * @param filename - Dosya adı
   * @returns Dosya uzantısı (.jpg, .png vb.)
   * 
   * @example
   * FileHelper.getFileExtension('photo.JPG') // '.jpg'
   * FileHelper.getFileExtension('document.pdf') // '.pdf'
   */
  static getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  /**
   * Dosya boyutunu al (byte cinsinden)
   * 
   * Disk üzerindeki dosyanın boyutunu okur.
   * 
   * @param filePath - Dosya path'i
   * @returns Dosya boyutu (byte) veya 0 (hata durumunda)
   * 
   * @example
   * FileHelper.getFileSize('./uploads/photo.jpg') // 2548963 (yaklaşık 2.5MB)
   */
  static getFileSize(filePath: string): number {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      // Dosya bulunamadı veya erişim hatası
      return 0;
    }
  }

  /**
   * Dosyayı sil
   * 
   * Güvenli dosya silme işlemi.
   * Dosya yoksa hata vermez.
   * 
   * @param filePath - Silinecek dosya path'i
   * @returns true: silme başarılı, false: silme başarısız veya dosya yok
   * 
   * @example
   * FileHelper.deleteFile('./uploads/old-photo.jpg') // true/false
   */
  static deleteFile(filePath: string): boolean {
    try {
      // Dosya var mı kontrol et
      if (fs.existsSync(filePath)) {
        // Dosyayı sil
        fs.unlinkSync(filePath);
        return true;
      }
      // Dosya zaten yok
      return false;
    } catch (error) {
      // Silme hatası (permission vb.)
      console.error('File deletion error:', error);
      return false;
    }
  }

  /**
   * Dosya varlık kontrolü
   * 
   * Disk üzerinde dosyanın var olup olmadığını kontrol eder.
   * 
   * @param filePath - Kontrol edilecek dosya path'i
   * @returns true: dosya var, false: dosya yok
   * 
   * @example
   * FileHelper.fileExists('./uploads/photo.jpg') // true/false
   */
  static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Dosya boyutunu okunabilir formata çevir
   * 
   * Byte cinsinden boyutu human-readable formata dönüştürür.
   * 
   * @param bytes - Dosya boyutu (byte cinsinden)
   * @returns Formatlanmış boyut string'i (örn: '2.5 MB')
   * 
   * @example
   * FileHelper.formatFileSize(0) // '0 Bytes'
   * FileHelper.formatFileSize(1024) // '1 KB'
   * FileHelper.formatFileSize(2548963) // '2.43 MB'
   * FileHelper.formatFileSize(1073741824) // '1 GB'
   */
  static formatFileSize(bytes: number): string {
    // Sıfır kontrolü
    if (bytes === 0) return '0 Bytes';

    const k = 1024; // 1 KB = 1024 Bytes
    const sizes = ['Bytes', 'KB', 'MB', 'GB']; // Birimler
    
    // Hangi birim kullanılacak? (log hesabı)
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // Hesaplama ve yuvarlama (2 ondalık basamak)
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Analiz tipine göre upload path'i belirle
   * 
   * Her analiz türü için ayrı klasör oluşturur.
   * Klasör yoksa otomatik oluşturulur.
   * 
   * Klasör yapısı:
   * - ./uploads/paint-analysis/
   * - ./uploads/damage-analysis/
   * - ./uploads/engine-sound/
   * - ./uploads/comprehensive-expertise/
   * - ./uploads/general/ (diğer)
   * 
   * @param analysisType - Analiz türü ('paint', 'damage', 'engine', 'comprehensive')
   * @returns Upload klasörü path'i
   * 
   * @example
   * FileHelper.getUploadPath('damage') // './uploads/damage-analysis'
   * FileHelper.getUploadPath('paint') // './uploads/paint-analysis'
   */
  static getUploadPath(analysisType: string): string {
    // Temel upload klasörü (environment'tan al, yoksa default)
    const baseDir = process.env.FILE_UPLOAD_DIR || './uploads';
    
    // Analiz tipi → klasör adı mapping
    const typeMapping: Record<string, string> = {
      'paint': 'paint-analysis',
      'damage': 'damage-analysis',
      'engine': 'engine-sound',
      'comprehensive': 'comprehensive-expertise',
    };

    // Alt klasör adını belirle (mapping'de yoksa 'general')
    const subDir = typeMapping[analysisType] || 'general';
    
    // Tam path'i oluştur
    const fullPath = path.join(baseDir, subDir);

    // Klasör yoksa oluştur
    this.ensureDirectoryExists(fullPath);
    
    return fullPath;
  }

  /**
   * Buffer'dan dosya kaydet
   * 
   * Memory'deki buffer'ı disk üzerine yazar.
   * Genellikle multipart/form-data upload'larında kullanılır.
   * 
   * @param buffer - Dosya içeriği (Buffer)
   * @param filename - Dosya adı
   * @param dirPath - Kaydedilecek klasör path'i
   * @returns Kaydedilen dosyanın tam path'i
   * 
   * @example
   * const buffer = req.file.buffer;
   * const filename = 'photo_1234.jpg';
   * const dirPath = './uploads/damage-analysis';
   * const savedPath = FileHelper.saveFile(buffer, filename, dirPath);
   * // './uploads/damage-analysis/photo_1234.jpg'
   */
  static saveFile(buffer: Buffer, filename: string, dirPath: string): string {
    // Klasör yoksa oluştur
    this.ensureDirectoryExists(dirPath);
    
    // Tam dosya path'i
    const filePath = path.join(dirPath, filename);
    
    // Buffer'ı disk üzerine yaz (synchronous)
    fs.writeFileSync(filePath, buffer);
    
    return filePath;
  }

  /**
   * Dosyayı buffer olarak oku
   * 
   * Disk üzerindeki dosyayı memory'ye okur.
   * AI servislere gönderilecek dosyalar için kullanılır.
   * 
   * @param filePath - Okunacak dosya path'i
   * @returns Dosya içeriği (Buffer) veya null (hata durumunda)
   * 
   * @example
   * const buffer = FileHelper.readFile('./uploads/photo.jpg');
   * if (buffer) {
   *   // AI servisine gönder
   *   await openai.vision.analyze(buffer);
   * }
   */
  static readFile(filePath: string): Buffer | null {
    try {
      // Dosya var mı kontrol et
      if (!this.fileExists(filePath)) {
        return null;
      }
      
      // Dosyayı buffer olarak oku (synchronous)
      return fs.readFileSync(filePath);
    } catch (error) {
      // Okuma hatası (permission, corrupt file vb.)
      console.error('File read error:', error);
      return null;
    }
  }
}
