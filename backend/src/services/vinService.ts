import axios from 'axios';

export interface VINData {
  vin: string;
  make: string;
  model: string;
  modelYear: string;
  manufacturer: string;
  plantCountry: string;
  vehicleType: string;
  bodyClass: string;
  engineCylinders: string;
  engineDisplacement: string;
  fuelType: string;
  transmissionStyle: string;
  driveType: string;
  trim: string;
  series: string;
  doors: string;
  windows: string;
  wheelBase: string;
  gvwr: string;
  plantCity: string;
  plantState: string;
  plantCompanyName: string;
  errorCode: string;
  errorText: string;
}

export class VINService {
  private static readonly NHTSA_API_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues';

  /**
   * İngilizce değerleri Türkçe'ye çevirir
   */
  private static translateToTurkish(value: string, field: string): string {
    if (!value || value === 'Bilinmiyor') return value;

    const translations: { [key: string]: { [key: string]: string } } = {
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
      transmissionStyle: {
        'Manual': 'Manuel',
        'Automatic': 'Otomatik',
        'CVT': 'CVT (Sürekli Değişken Şanzıman)',
        'Semi-Automatic': 'Yarı Otomatik',
        'Sequential': 'Sıralı',
        'Other': 'Diğer'
      },
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

    const fieldTranslations = translations[field];
    if (fieldTranslations && fieldTranslations[value]) {
      return fieldTranslations[value];
    }

    return value;
  }

  /**
   * VIN numarasından araç bilgilerini sorgular
   * @param vin - 17 haneli VIN numarası
   * @returns Promise<VINData | null>
   */
  static async decodeVIN(vin: string): Promise<VINData | null> {
    try {
      console.log('VIN Service: Starting decode for VIN:', vin);
      
      // VIN formatını kontrol et
      if (!this.isValidVIN(vin)) {
        throw new Error('Geçersiz VIN formatı. VIN 17 haneli olmalıdır.');
      }

      console.log('VIN Service: Making API call to NHTSA');
      const response = await axios.get(`${this.NHTSA_API_URL}/${vin}?format=json`, {
        timeout: 10000, // 10 saniye timeout
        headers: {
          'User-Agent': 'Mivvo-Expertiz/1.0'
        }
      });
      
      console.log('VIN Service: NHTSA API response received');
      
      if (response.data && response.data.Results && response.data.Results.length > 0) {
        const result = response.data.Results[0];
        console.log('VIN Service: Processing result:', { 
          vin: result.VIN, 
          make: result.Make, 
          model: result.Model,
          errorCode: result.ErrorCode 
        });
        
        // Hata kontrolü - Sadece kritik hataları kontrol et
        const errorCode = result.ErrorCode;
        const errorText = result.ErrorText || '';
        
        // Kritik hatalar: Check digit hatası, geçersiz VIN formatı vb.
        if (errorCode && errorCode !== '0' && errorCode !== 0 && 
            (errorText.includes('Check Digit') && errorText.includes('does not calculate properly') ||
             errorText.includes('Invalid') ||
             errorText.includes('Unable to decode'))) {
          throw new Error(errorText);
        }

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

      return null;
    } catch (error) {
      console.error('VIN Service: Error occurred:', error);
      if (error instanceof Error) {
        throw new Error(`VIN sorgulama hatası: ${error.message}`);
      } else {
        throw new Error('VIN sorgulama sırasında bilinmeyen hata oluştu');
      }
    }
  }

  /**
   * VIN numarasının formatını kontrol eder
   * @param vin - VIN numarası
   * @returns boolean
   */
  static isValidVIN(vin: string): boolean {
    if (!vin || typeof vin !== 'string') {
      return false;
    }

    // VIN 17 haneli olmalı ve sadece harf ve rakam içermeli
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return vinRegex.test(vin);
  }

  /**
   * VIN numarasından temel bilgileri çıkarır
   * @param vin - VIN numarası
   * @returns object
   */
  static extractBasicInfo(vin: string): { year?: string; make?: string; country?: string } {
    if (!this.isValidVIN(vin)) {
      return {};
    }

    const yearCode = vin.charAt(9);
    const countryCode = vin.substring(0, 2);
    
    // Yıl kodları (basit mapping)
    const yearMap: { [key: string]: string } = {
      'A': '2010', 'B': '2011', 'C': '2012', 'D': '2013', 'E': '2014',
      'F': '2015', 'G': '2016', 'H': '2017', 'J': '2018', 'K': '2019',
      'L': '2020', 'M': '2021', 'N': '2022', 'P': '2023', 'R': '2024',
      'S': '2025', 'T': '2026', 'V': '2027', 'W': '2028', 'X': '2029',
      'Y': '2030', '1': '2031', '2': '2032', '3': '2033', '4': '2034',
      '5': '2035', '6': '2036', '7': '2037', '8': '2038', '9': '2039'
    };

    // Ülke kodları
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
      year: yearMap[yearCode],
      country: countryMap[countryCode.substring(0, 1)]
    };
  }
}
