/**
 * VIN Sorgulama Servisi (VIN Lookup Service)
 * 
 * Clean Architecture - Service Layer (İş Mantığı Katmanı)
 * 
 * Bu servis, VIN (Vehicle Identification Number - Şasi Numarası) sorgulama işlemlerini yönetir.
 * 
 * Amaç:
 * - VIN numarasından araç bilgilerini sorgulama
 * - NHTSA (National Highway Traffic Safety Administration) API entegrasyonu
 * - İngilizce API yanıtlarını Türkçe'ye çevirme
 * - VIN format validasyonu
 * - Temel VIN bilgilerini decode etme (yıl, ülke)
 * 
 * API Sağlayıcı:
 * - NHTSA vpic.nhtsa.dot.gov/api (ücretsiz, public API)
 * - 17 haneli VIN numarasını decode eder
 * - Marka, model, üretim yılı, motor bilgileri vb. döndürür
 * 
 * Kullanım Senaryosu:
 * 1. Kullanıcı VIN numarasını girer
 * 2. NHTSA API'ye istek atılır
 * 3. Dönen veriler Türkçe'ye çevrilir
 * 4. Araç bilgileri kullanıcıya gösterilir
 * 5. Kullanıcı bu bilgilerle araç ekleyebilir
 */

import axios from 'axios';

/**
 * VIN Verisi Interface
 * 
 * NHTSA API'den dönen araç bilgilerini temsil eder.
 */
export interface VINData {
  vin: string;                    // VIN numarası (17 haneli)
  make: string;                   // Marka (örn: Toyota, BMW)
  model: string;                  // Model (örn: Corolla, 3 Series)
  modelYear: string;              // Model yılı
  manufacturer: string;           // Üretici firma adı
  plantCountry: string;           // Üretim ülkesi (Türkçe)
  vehicleType: string;            // Araç tipi (Binek, Kamyon vb.) (Türkçe)
  bodyClass: string;              // Kasa tipi (Sedan, SUV vb.) (Türkçe)
  engineCylinders: string;        // Motor silindir sayısı
  engineDisplacement: string;     // Motor hacmi (litre)
  fuelType: string;               // Yakıt tipi (Benzin, Dizel vb.) (Türkçe)
  transmissionStyle: string;      // Vites tipi (Manuel, Otomatik vb.) (Türkçe)
  driveType: string;              // Çekiş tipi (Önden, Arkadan vb.) (Türkçe)
  trim: string;                   // Trim/Donanım seviyesi
  series: string;                 // Seri bilgisi
  doors: string;                  // Kapı sayısı
  windows: string;                // Pencere sayısı
  wheelBase: string;              // Dingil mesafesi
  gvwr: string;                   // Toplam ağırlık (GVWR)
  plantCity: string;              // Üretim şehri
  plantState: string;             // Üretim eyaleti
  plantCompanyName: string;       // Üretim tesisi adı
  errorCode: string;              // NHTSA API hata kodu
  errorText: string;              // NHTSA API hata metni
}

/**
 * VINService Sınıfı
 * 
 * VIN sorgulama işlemlerini yöneten static service class.
 */
export class VINService {
  /**
   * NHTSA API base URL
   * 
   * vpic.nhtsa.dot.gov ücretsiz VIN decode servisi sağlar.
   * Rate limit: Yok (free tier)
   */
  private static readonly NHTSA_API_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues';

  /**
   * İngilizce API yanıtlarını Türkçe'ye çevirir
   * 
   * NHTSA API İngilizce döndürdüğü için kullanıcıya Türkçe gösterilmesi gerekir.
   * Her alan için özel translation mapping'i vardır.
   * 
   * @param value - Çevrilecek İngilizce değer
   * @param field - Hangi alanın çevrileceği (fuelType, transmissionStyle vb.)
   * @returns Türkçe çeviri veya orijinal değer (çeviri bulunamazsa)
   * 
   * @example
   * translateToTurkish('Gasoline', 'fuelType') // 'Benzin'
   * translateToTurkish('Automatic', 'transmissionStyle') // 'Otomatik'
   */
  private static translateToTurkish(value: string, field: string): string {
    // Boş veya zaten Türkçe ise olduğu gibi döndür
    if (!value || value === 'Bilinmiyor') return value;

    /**
     * Translation Mapping Objesi
     * 
     * Her alan için İngilizce → Türkçe çeviri tablosu.
     */
    const translations: { [key: string]: { [key: string]: string } } = {
      // Yakıt tipi çevirileri
      fuelType: {
        'Gasoline': 'Benzin',
        'Diesel': 'Dizel',
        'Electric': 'Elektrik',
        'Hybrid': 'Hibrit',
        'E85': 'E85 Etanol',
        'CNG': 'CNG (Sıkıştırılmış Doğal Gaz)',
        'LPG': 'LPG',
        'Propane': 'Propan',
        'Methanol': 'Metanol',
        'Ethanol': 'Etanol',
        'Biodiesel': 'Biyodizel',
        'Hydrogen': 'Hidrojen',
        'Natural Gas': 'Doğal Gaz',
        'Other': 'Diğer'
      },
      
      // Vites tipi çevirileri
      transmissionStyle: {
        'Manual': 'Manuel',
        'Automatic': 'Otomatik',
        'CVT': 'CVT (Sürekli Değişken Şanzıman)',
        'Semi-Automatic': 'Yarı Otomatik',
        'Sequential': 'Sıralı',
        'Other': 'Diğer'
      },
      
      // Çekiş tipi çevirileri
      driveType: {
        'FWD': 'Önden Çekiş',
        'RWD': 'Arkadan Çekiş',
        'AWD': 'Dört Tekerlek Çekiş',
        '4WD': 'Dört Tekerlek Çekiş',
        '2WD': 'İki Tekerlek Çekiş',
        'Front Wheel Drive': 'Önden Çekiş',
        'Rear Wheel Drive': 'Arkadan Çekiş',
        'All Wheel Drive': 'Dört Tekerlek Çekiş',
        'Four Wheel Drive': 'Dört Tekerlek Çekiş',
        'Two Wheel Drive': 'İki Tekerlek Çekiş',
        'Other': 'Diğer'
      },
      
      // Araç tipi çevirileri
      vehicleType: {
        'PASSENGER CAR': 'Binek Araç',
        'Passenger Car': 'Binek Araç',
        'TRUCK': 'Kamyon',
        'Truck': 'Kamyon',
        'BUS': 'Otobüs',
        'Bus': 'Otobüs',
        'MOTORCYCLE': 'Motosiklet',
        'Motorcycle': 'Motosiklet',
        'TRAILER': 'Römork',
        'Trailer': 'Römork',
        'VAN': 'Van',
        'Van': 'Van',
        'SUV': 'SUV',
        'PICKUP': 'Pickup',
        'Pickup': 'Pickup',
        'CONVERTIBLE': 'Cabrio',
        'Convertible': 'Cabrio',
        'COUPE': 'Coupe',
        'Coupe': 'Coupe',
        'SEDAN': 'Sedan',
        'Sedan': 'Sedan',
        'HATCHBACK': 'Hatchback',
        'Hatchback': 'Hatchback',
        'WAGON': 'Station Wagon',
        'Wagon': 'Station Wagon',
        'CROSSOVER': 'Crossover',
        'Crossover': 'Crossover',
        'OTHER': 'Diğer',
        'Other': 'Diğer'
      },
      
      // Kasa tipi çevirileri
      bodyClass: {
        'Sedan': 'Sedan',
        'Coupe': 'Coupe',
        'Convertible': 'Cabrio',
        'Hatchback': 'Hatchback',
        'Wagon': 'Station Wagon',
        'SUV': 'SUV',
        'Pickup': 'Pickup',
        'Van': 'Van',
        'Truck': 'Kamyon',
        'Bus': 'Otobüs',
        'Motorcycle': 'Motosiklet',
        'Trailer': 'Römork',
        'Other': 'Diğer'
      },
      
      // Üretim ülkesi çevirileri
      plantCountry: {
        'United States': 'Amerika Birleşik Devletleri',
        'Canada': 'Kanada',
        'Mexico': 'Meksika',
        'Germany': 'Almanya',
        'Japan': 'Japonya',
        'South Korea': 'Güney Kore',
        'China': 'Çin',
        'India': 'Hindistan',
        'Brazil': 'Brezilya',
        'Thailand': 'Tayland',
        'Vietnam': 'Vietnam',
        'Turkey': 'Türkiye',
        'United Kingdom': 'İngiltere',
        'France': 'Fransa',
        'Italy': 'İtalya',
        'Spain': 'İspanya',
        'Russia': 'Rusya',
        'Australia': 'Avustralya',
        'South Africa': 'Güney Afrika',
        'Argentina': 'Arjantin',
        'Chile': 'Şili',
        'Other': 'Diğer'
      }
    };

    // İlgili alan için translation mapping'i bul
    const fieldTranslations = translations[field];
    if (fieldTranslations && fieldTranslations[value]) {
      return fieldTranslations[value];
    }

    // Çeviri bulunamazsa orijinal değeri döndür
    return value;
  }

  /**
   * VIN numarasından araç bilgilerini sorgular
   * 
   * NHTSA API'ye istek atarak VIN'i decode eder.
   * Dönen veriler Türkçe'ye çevrilir ve VINData olarak döndürülür.
   * 
   * İşlem adımları:
   * 1. VIN format validasyonu
   * 2. NHTSA API'ye HTTP GET isteği
   * 3. API yanıtını parse etme
   * 4. Hata kontrolü (kritik hatalar için throw)
   * 5. İngilizce değerleri Türkçe'ye çevirme
   * 6. VINData objesi oluşturma
   * 
   * @param vin - 17 haneli VIN numarası
   * @returns Promise<VINData | null> - Araç bilgileri veya null (bulunamazsa)
   * @throws Error - Geçersiz VIN format, API hatası, timeout vb.
   * 
   * @example
   * const vinData = await VINService.decodeVIN('1HGBH41JXMN109186');
   * console.log(vinData.make); // 'Honda'
   * console.log(vinData.model); // 'Accord'
   * console.log(vinData.fuelType); // 'Benzin' (Türkçe çevrilmiş)
   */
  static async decodeVIN(vin: string): Promise<VINData | null> {
    try {
      console.log('VIN Service: Starting decode for VIN:', vin);
      
      // 1. VIN formatını kontrol et (17 haneli, I-O-Q hariç alfanumerik)
      if (!this.isValidVIN(vin)) {
        throw new Error('Geçersiz VIN formatı. VIN 17 haneli olmalıdır.');
      }

      console.log('VIN Service: Making API call to NHTSA');
      
      // 2. NHTSA API'ye istek at
      const response = await axios.get(`${this.NHTSA_API_URL}/${vin}?format=json`, {
        timeout: 10000, // 10 saniye timeout (API yavaş olabilir)
        headers: {
          'User-Agent': 'Mivvo-Expertiz/1.0' // NHTSA API User-Agent gerektirir
        }
      });
      
      console.log('VIN Service: NHTSA API response received');
      
      // 3. API yanıtını parse et
      if (response.data && response.data.Results && response.data.Results.length > 0) {
        const result = response.data.Results[0];
        console.log('VIN Service: Processing result:', { 
          vin: result.VIN, 
          make: result.Make, 
          model: result.Model,
          errorCode: result.ErrorCode 
        });
        
        // 4. Hata kontrolü - Sadece kritik hataları yakala
        const errorCode = result.ErrorCode;
        const errorText = result.ErrorText || '';
        
        // Kritik hatalar:
        // - Check digit hatası (VIN geçersiz)
        // - Invalid VIN
        // - Unable to decode
        if (errorCode && errorCode !== '0' && errorCode !== 0 && 
            (errorText.includes('Check Digit') && errorText.includes('does not calculate properly') ||
             errorText.includes('Invalid') ||
             errorText.includes('Unable to decode'))) {
          throw new Error(errorText);
        }

        // 5. VINData objesi oluştur (Türkçe çevirilerle)
        return {
          vin: result.VIN || vin,
          make: result.Make || 'Bilinmiyor',
          model: result.Model || 'Bilinmiyor',
          modelYear: result.ModelYear || 'Bilinmiyor',
          manufacturer: result.Manufacturer || 'Bilinmiyor',
          plantCountry: this.translateToTurkish(result.PlantCountry || 'Bilinmiyor', 'plantCountry'),
          vehicleType: this.translateToTurkish(result.VehicleType || 'Bilinmiyor', 'vehicleType'),
          bodyClass: this.translateToTurkish(result.BodyClass || 'Bilinmiyor', 'bodyClass'),
          engineCylinders: result.EngineCylinders || 'Bilinmiyor',
          engineDisplacement: result.EngineDisplacement || 'Bilinmiyor',
          fuelType: this.translateToTurkish(result.FuelTypePrimary || 'Bilinmiyor', 'fuelType'),
          transmissionStyle: this.translateToTurkish(result.TransmissionStyle || 'Bilinmiyor', 'transmissionStyle'),
          driveType: this.translateToTurkish(result.DriveType || 'Bilinmiyor', 'driveType'),
          trim: result.Trim || 'Bilinmiyor',
          series: result.Series || 'Bilinmiyor',
          doors: result.Doors || 'Bilinmiyor',
          windows: result.Windows || 'Bilinmiyor',
          wheelBase: result.WheelBaseLong || 'Bilinmiyor',
          gvwr: result.GVWR || 'Bilinmiyor',
          plantCity: result.PlantCity || 'Bilinmiyor',
          plantState: result.PlantState || 'Bilinmiyor',
          plantCompanyName: result.PlantCompanyName || 'Bilinmiyor',
          errorCode: result.ErrorCode || '0',
          errorText: result.ErrorText || ''
        };
      }

      // API'den sonuç dönmedi
      return null;
    } catch (error) {
      console.error('VIN Service: Error occurred:', error);
      
      // Hata mesajını kullanıcı dostu hale getir
      if (error instanceof Error) {
        throw new Error(`VIN sorgulama hatası: ${error.message}`);
      } else {
        throw new Error('VIN sorgulama sırasında bilinmeyen hata oluştu');
      }
    }
  }

  /**
   * VIN numarasının formatını kontrol eder
   * 
   * Geçerli VIN kriterleri:
   * - Tam 17 karakter
   * - Sadece harf (A-Z) ve rakam (0-9)
   * - I, O, Q harfleri kullanılmaz (1, 0 ile karışmasın diye)
   * 
   * @param vin - Kontrol edilecek VIN numarası
   * @returns true: geçerli VIN, false: geçersiz
   * 
   * @example
   * VINService.isValidVIN('1HGBH41JXMN109186') // true
   * VINService.isValidVIN('INVALID') // false (17 karakter değil)
   * VINService.isValidVIN('1HGBH41JXMN10918O') // false (O harfi yasak)
   */
  static isValidVIN(vin: string): boolean {
    // Null/undefined kontrolü
    if (!vin || typeof vin !== 'string') {
      return false;
    }

    // VIN regex pattern: 17 haneli, A-HJ-NPR-Z ve 0-9 (I, O, Q hariç)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return vinRegex.test(vin);
  }

  /**
   * VIN numarasından temel bilgileri çıkarır (decode işlemi olmadan)
   * 
   * VIN yapısından basit bilgiler çıkarır (API çağrısı gerekmez).
   * VIN formatı: [Ülke][Üretici][...][Yıl Kodu][Check Digit][...]
   * 
   * VIN pozisyonları:
   * - 1. karakter: Üretim ülkesi
   * - 10. karakter: Model yılı
   * 
   * @param vin - VIN numarası
   * @returns { year?: string; country?: string } - Yıl ve ülke bilgisi
   * 
   * @example
   * VINService.extractBasicInfo('1HGBH41JXMN109186')
   * // { year: '2021', country: 'ABD' }
   */
  static extractBasicInfo(vin: string): { year?: string; make?: string; country?: string } {
    // Geçersiz VIN ise boş obje döndür
    if (!this.isValidVIN(vin)) {
      return {};
    }

    // 10. karakter model yılını temsil eder
    const yearCode = vin.charAt(9);
    
    // İlk 2 karakter ülke kodunu temsil eder
    const countryCode = vin.substring(0, 2);
    
    /**
     * Yıl Kodu Mapping
     * 
     * A-Y ve 1-9 kullanılır (I, O, Q, Z, 0 hariç)
     * 30 yıllık döngü (1980-2009, 2010-2039 vb.)
     */
    const yearMap: { [key: string]: string } = {
      'A': '2010', 'B': '2011', 'C': '2012', 'D': '2013', 'E': '2014',
      'F': '2015', 'G': '2016', 'H': '2017', 'J': '2018', 'K': '2019',
      'L': '2020', 'M': '2021', 'N': '2022', 'P': '2023', 'R': '2024',
      'S': '2025', 'T': '2026', 'V': '2027', 'W': '2028', 'X': '2029',
      'Y': '2030', '1': '2031', '2': '2032', '3': '2033', '4': '2034',
      '5': '2035', '6': '2036', '7': '2037', '8': '2038', '9': '2039'
    };

    /**
     * Ülke Kodu Mapping
     * 
     * İlk karakter dünya bölgesini, ikinci karakter ülkeyi belirler.
     */
    const countryMap: { [key: string]: string } = {
      '1': 'ABD', '2': 'Kanada', '3': 'Meksika', '4': 'ABD', '5': 'ABD',
      '6': 'Avustralya', '7': 'Yeni Zelanda', '8': 'Arjantin', '9': 'Şili',
      'A': 'Güney Afrika', 'B': 'Brezilya', 'C': 'Kanada', 'D': 'Almanya',
      'E': 'İngiltere', 'F': 'Fransa', 'G': 'İtalya', 'H': 'İsviçre',
      'J': 'Japonya', 'K': 'Güney Kore', 'L': 'Çin', 'M': 'Tayland',
      'N': 'Türkiye', 'P': 'Filipinler', 'R': 'Tayvan', 'S': 'İngiltere',
      'T': 'İsviçre', 'U': 'Romanya', 'V': 'Fransa', 'W': 'Almanya',
      'X': 'Rusya', 'Y': 'İsveç', 'Z': 'İtalya'
    };

    return {
      year: yearMap[yearCode],                        // Model yılı
      country: countryMap[countryCode.substring(0, 1)] // Üretim ülkesi
    };
  }
}
