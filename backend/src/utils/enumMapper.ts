/**
 * Enum Mapper - İngilizce-Türkçe Dönüştürücü (Backend)
 * 
 * Backward compatibility için eski İngilizce enum değerlerini
 * yeni Türkçe değerlere çeviren mapper fonksiyonları
 */

// ===== HASAR ŞİDDETİ MAPPER =====

export const severityMapper = {
  // İngilizce -> Türkçe
  toTurkish: (english: string): string => {
    const map: Record<string, string> = {
      'minimal': 'minimal',
      'low': 'düşük',
      'medium': 'orta',
      'high': 'yüksek',
      'critical': 'kritik'
    }
    return map[english] || english
  },
  
  // Türkçe -> İngilizce
  toEnglish: (turkish: string): string => {
    const map: Record<string, string> = {
      'minimal': 'minimal',
      'düşük': 'low',
      'orta': 'medium',
      'yüksek': 'high',
      'kritik': 'critical'
    }
    return map[turkish] || turkish
  }
}

// ===== HASAR TÜRÜ MAPPER =====

export const damageTypeMapper = {
  // İngilizce -> Türkçe
  toTurkish: (english: string): string => {
    const map: Record<string, string> = {
      'scratch': 'çizik',
      'dent': 'göçük',
      'rust': 'pas',
      'oxidation': 'oksidasyon',
      'crack': 'çatlak',
      'break': 'kırılma',
      'paint_damage': 'boya_hasarı',
      'structural': 'yapısal_hasar',
      'mechanical': 'mekanik_hasar',
      'electrical': 'elektrik_hasarı'
    }
    return map[english] || english
  },
  
  // Türkçe -> İngilizce
  toEnglish: (turkish: string): string => {
    const map: Record<string, string> = {
      'çizik': 'scratch',
      'göçük': 'dent',
      'pas': 'rust',
      'oksidasyon': 'oxidation',
      'çatlak': 'crack',
      'kırılma': 'break',
      'boya_hasarı': 'paint_damage',
      'yapısal_hasar': 'structural',
      'mekanik_hasar': 'mechanical',
      'elektrik_hasarı': 'electrical'
    }
    return map[turkish] || turkish
  }
}

// ===== HASAR BÖLGESİ MAPPER =====

export const damageAreaMapper = {
  // İngilizce -> Türkçe
  toTurkish: (english: string): string => {
    const map: Record<string, string> = {
      'front': 'ön',
      'rear': 'arka',
      'left': 'sol',
      'right': 'sağ',
      'top': 'üst',
      'bottom': 'alt',
      'interior': 'iç',
      'engine': 'motor',
      'chassis': 'şasi'
    }
    return map[english] || english
  },
  
  // Türkçe -> İngilizce
  toEnglish: (turkish: string): string => {
    const map: Record<string, string> = {
      'ön': 'front',
      'arka': 'rear',
      'sol': 'left',
      'sağ': 'right',
      'üst': 'top',
      'alt': 'bottom',
      'iç': 'interior',
      'motor': 'engine',
      'şasi': 'chassis'
    }
    return map[turkish] || turkish
  }
}

// ===== ONARIM ÖNCELİĞİ MAPPER =====

export const repairPriorityMapper = {
  // İngilizce -> Türkçe
  toTurkish: (english: string): string => {
    const map: Record<string, string> = {
      'low': 'düşük',
      'medium': 'orta',
      'high': 'yüksek',
      'urgent': 'acil'
    }
    return map[english] || english
  },
  
  // Türkçe -> İngilizce
  toEnglish: (turkish: string): string => {
    const map: Record<string, string> = {
      'düşük': 'low',
      'orta': 'medium',
      'yüksek': 'high',
      'acil': 'urgent'
    }
    return map[turkish] || turkish
  }
}

// ===== GÜVENLİK ETKİSİ MAPPER =====

export const safetyImpactMapper = {
  // İngilizce -> Türkçe
  toTurkish: (english: string): string => {
    const map: Record<string, string> = {
      'none': 'yok',
      'low': 'düşük',
      'medium': 'orta',
      'high': 'yüksek',
      'critical': 'kritik'
    }
    return map[english] || english
  },
  
  // Türkçe -> İngilizce
  toEnglish: (turkish: string): string => {
    const map: Record<string, string> = {
      'yok': 'none',
      'düşük': 'low',
      'orta': 'medium',
      'yüksek': 'high',
      'kritik': 'critical'
    }
    return map[turkish] || turkish
  }
}

// ===== HASAR SEVİYESİ MAPPER =====

export const damageLevelMapper = {
  // İngilizce -> Türkçe
  toTurkish: (english: string): string => {
    const map: Record<string, string> = {
      'excellent': 'mükemmel',
      'good': 'iyi',
      'fair': 'orta',
      'poor': 'kötü',
      'critical': 'kritik'
    }
    return map[english] || english
  },
  
  // Türkçe -> İngilizce
  toEnglish: (turkish: string): string => {
    const map: Record<string, string> = {
      'mükemmel': 'excellent',
      'iyi': 'good',
      'orta': 'fair',
      'kötü': 'poor',
      'kritik': 'critical'
    }
    return map[turkish] || turkish
  }
}

// ===== YOL DURUMU MAPPER =====

export const roadworthinessMapper = {
  // İngilizce -> Türkçe
  toTurkish: (english: string): string => {
    const map: Record<string, string> = {
      'safe': 'güvenli',
      'conditional': 'koşullu',
      'unsafe': 'güvensiz'
    }
    return map[english] || english
  },
  
  // Türkçe -> İngilizce
  toEnglish: (turkish: string): string => {
    const map: Record<string, string> = {
      'güvenli': 'safe',
      'koşullu': 'conditional',
      'güvensiz': 'unsafe'
    }
    return map[turkish] || turkish
  }
}

// ===== TEKNİK SİSTEM DURUMU MAPPER =====

export const technicalSystemMapper = {
  // İngilizce -> Türkçe
  toTurkish: (english: string): string => {
    const map: Record<string, string> = {
      'functional': 'fonksiyonel',
      'needs_inspection': 'inceleme_gerekli',
      'non_functional': 'fonksiyonsuz',
      'operational': 'çalışır',
      'minor_issues': 'hafif_sorun',
      'major_issues': 'büyük_sorun',
      'non_operational': 'çalışmaz',
      'intact': 'sağlam',
      'minor_damage': 'hafif_hasar',
      'moderate_damage': 'orta_hasar',
      'severe_damage': 'ağır_hasar',
      'compromised': 'bozuk',
      'perfect': 'mükemmel',
      'minor_deviation': 'hafif_sapma',
      'moderate_deviation': 'orta_sapma',
      'severe_deviation': 'büyük_sapma'
    }
    return map[english] || english
  },
  
  // Türkçe -> İngilizce
  toEnglish: (turkish: string): string => {
    const map: Record<string, string> = {
      'fonksiyonel': 'functional',
      'inceleme_gerekli': 'needs_inspection',
      'fonksiyonsuz': 'non_functional',
      'çalışır': 'operational',
      'hafif_sorun': 'minor_issues',
      'büyük_sorun': 'major_issues',
      'çalışmaz': 'non_operational',
      'sağlam': 'intact',
      'hafif_hasar': 'minor_damage',
      'orta_hasar': 'moderate_damage',
      'ağır_hasar': 'severe_damage',
      'bozuk': 'compromised',
      'mükemmel': 'perfect',
      'hafif_sapma': 'minor_deviation',
      'orta_sapma': 'moderate_deviation',
      'büyük_sapma': 'severe_deviation'
    }
    return map[turkish] || turkish
  }
}

// ===== GENEL MAPPER FONKSİYONU =====

/**
 * Tüm enum değerlerini İngilizce'den Türkçe'ye çevirir
 * 
 * @param data - Çevrilecek veri objesi
 * @returns Türkçe enum değerleri ile güncellenmiş veri
 */
export function convertToTurkish(data: any): any {
  if (!data || typeof data !== 'object') return data
  
  const converted = { ...data }
  
  // Recursive olarak tüm objeyi tarar
  for (const key in converted) {
    if (converted[key] && typeof converted[key] === 'object') {
      if (Array.isArray(converted[key])) {
        converted[key] = converted[key].map(item => convertToTurkish(item))
      } else {
        converted[key] = convertToTurkish(converted[key])
      }
    } else if (typeof converted[key] === 'string') {
      // String değerleri kontrol et ve çevir
      converted[key] = convertStringValue(converted[key])
    }
  }
  
  return converted
}

/**
 * String değeri kontrol eder ve uygun mapper ile çevirir
 * 
 * @param value - Çevrilecek string değer
 * @returns Çevrilmiş değer
 */
function convertStringValue(value: string): string {
  // Hasar şiddeti kontrolü
  if (severityMapper.toTurkish(value) !== value) {
    return severityMapper.toTurkish(value)
  }
  
  // Hasar türü kontrolü
  if (damageTypeMapper.toTurkish(value) !== value) {
    return damageTypeMapper.toTurkish(value)
  }
  
  // Hasar bölgesi kontrolü
  if (damageAreaMapper.toTurkish(value) !== value) {
    return damageAreaMapper.toTurkish(value)
  }
  
  // Onarım önceliği kontrolü
  if (repairPriorityMapper.toTurkish(value) !== value) {
    return repairPriorityMapper.toTurkish(value)
  }
  
  // Güvenlik etkisi kontrolü
  if (safetyImpactMapper.toTurkish(value) !== value) {
    return safetyImpactMapper.toTurkish(value)
  }
  
  // Hasar seviyesi kontrolü
  if (damageLevelMapper.toTurkish(value) !== value) {
    return damageLevelMapper.toTurkish(value)
  }
  
  // Yol durumu kontrolü
  if (roadworthinessMapper.toTurkish(value) !== value) {
    return roadworthinessMapper.toTurkish(value)
  }
  
  // Teknik sistem durumu kontrolü
  if (technicalSystemMapper.toTurkish(value) !== value) {
    return technicalSystemMapper.toTurkish(value)
  }
  
  return value
}

/**
 * Tüm enum değerlerini Türkçe'den İngilizce'ye çevirir
 * 
 * @param data - Çevrilecek veri objesi
 * @returns İngilizce enum değerleri ile güncellenmiş veri
 */
export function convertToEnglish(data: any): any {
  if (!data || typeof data !== 'object') return data
  
  const converted = { ...data }
  
  // Recursive olarak tüm objeyi tarar
  for (const key in converted) {
    if (converted[key] && typeof converted[key] === 'object') {
      if (Array.isArray(converted[key])) {
        converted[key] = converted[key].map(item => convertToEnglish(item))
      } else {
        converted[key] = convertToEnglish(converted[key])
      }
    } else if (typeof converted[key] === 'string') {
      // String değerleri kontrol et ve çevir
      converted[key] = convertStringValueToEnglish(converted[key])
    }
  }
  
  return converted
}

/**
 * String değeri kontrol eder ve uygun mapper ile İngilizce'ye çevirir
 * 
 * @param value - Çevrilecek string değer
 * @returns Çevrilmiş değer
 */
function convertStringValueToEnglish(value: string): string {
  // Hasar şiddeti kontrolü
  if (severityMapper.toEnglish(value) !== value) {
    return severityMapper.toEnglish(value)
  }
  
  // Hasar türü kontrolü
  if (damageTypeMapper.toEnglish(value) !== value) {
    return damageTypeMapper.toEnglish(value)
  }
  
  // Hasar bölgesi kontrolü
  if (damageAreaMapper.toEnglish(value) !== value) {
    return damageAreaMapper.toEnglish(value)
  }
  
  // Onarım önceliği kontrolü
  if (repairPriorityMapper.toEnglish(value) !== value) {
    return repairPriorityMapper.toEnglish(value)
  }
  
  // Güvenlik etkisi kontrolü
  if (safetyImpactMapper.toEnglish(value) !== value) {
    return safetyImpactMapper.toEnglish(value)
  }
  
  // Hasar seviyesi kontrolü
  if (damageLevelMapper.toEnglish(value) !== value) {
    return damageLevelMapper.toEnglish(value)
  }
  
  // Yol durumu kontrolü
  if (roadworthinessMapper.toEnglish(value) !== value) {
    return roadworthinessMapper.toEnglish(value)
  }
  
  // Teknik sistem durumu kontrolü
  if (technicalSystemMapper.toEnglish(value) !== value) {
    return technicalSystemMapper.toEnglish(value)
  }
  
  return value
}
