/**
 * Audio Optimizer Utility
 * 
 * FFmpeg kütüphanesi ile ses optimizasyonu ve validasyonu.
 * OpenAI Audio API'den maksimum verim almak için optimize edilmiştir.
 * 
 * Özellikler:
 * - Ses dosyası boyut kontrolü
 * - Süre kontrolü ve kırpma
 * - Ses seviyesi analizi ve normalizasyon
 * - Silence detection
 * - Noise reduction
 * - Format dönüşümü
 * 
 * FFmpeg Dependency:
 * npm install fluent-ffmpeg
 * npm install @types/fluent-ffmpeg
 * 
 * System Requirements:
 * - FFmpeg binary installed on system
 */

import ffmpeg from 'fluent-ffmpeg'
import { AUDIO_CONSTRAINTS, FileSizeHelpers } from '../constants/FileConstraints'
import { ERROR_MESSAGES } from '../constants/ErrorMessages'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

/**
 * Ses Optimizasyon Sonucu Interface
 */
export interface AudioOptimizationResult {
  success: boolean
  optimizedPath?: string
  metadata: {
    duration: number
    format: string
    bitrate: number
    sampleRate: number
    channels: number
    size: number
    volumeLevel: number
    silenceRatio: number
    noiseLevel: number
  }
  errors: string[]
  warnings: string[]
}

/**
 * Ses Validasyon Sonucu Interface
 */
export interface AudioValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata: {
    duration: number
    format: string
    bitrate: number
    sampleRate: number
    channels: number
    size: number
    volumeLevel: number
    silenceRatio: number
    noiseLevel: number
  }
}

/**
 * Ses Optimizasyon Sınıfı
 */
export class AudioOptimizer {
  /**
   * Ses dosyasını optimize et ve validasyon yap
   * 
   * İş Akışı:
   * 1. FFmpeg ile metadata al
   * 2. Validasyon kontrolleri yap
   * 3. Gerekirse normalize et ve optimize et
   * 4. Silence detection yap
   * 5. Sonuç döndür
   * 
   * @param inputPath - Giriş ses dosyası yolu
   * @param outputPath - Çıkış ses dosyası yolu
   * @param options - Optimizasyon seçenekleri
   * @returns AudioOptimizationResult
   */
  static async optimizeAudio(
    inputPath: string,
    outputPath: string,
    options: {
      targetSampleRate?: number
      targetBitrate?: number
      targetChannels?: number
      normalizeVolume?: boolean
      removeNoise?: boolean
      trimSilence?: boolean
      forceOptimization?: boolean
    } = {}
  ): Promise<AudioOptimizationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Metadata al
      const metadata = await this.getAudioMetadata(inputPath)
      
      // Validasyon kontrolleri
      const validationResult = await this.validateAudio(inputPath)
      if (!validationResult.isValid) {
        errors.push(...validationResult.errors)
      }
      warnings.push(...validationResult.warnings)
      
      // Optimizasyon gerekiyor mu?
      const needsOptimization = this.needsOptimization(metadata, options)
      
      let optimizedPath = inputPath
      
      if (needsOptimization || options.forceOptimization) {
        optimizedPath = await this.performOptimization(inputPath, outputPath, options)
        warnings.push('Ses dosyası optimizasyonu uygulandı')
      }
      
      // Final metadata al
      const finalMetadata = await this.getAudioMetadata(optimizedPath)
      
      return {
        success: errors.length === 0,
        optimizedPath,
        metadata: finalMetadata,
        errors,
        warnings
      }
      
    } catch (error) {
      console.error('Ses optimizasyon hatası:', error)
      return {
        success: false,
        metadata: {
          duration: 0,
          format: 'unknown',
          bitrate: 0,
          sampleRate: 0,
          channels: 0,
          size: 0,
          volumeLevel: 0,
          silenceRatio: 0,
          noiseLevel: 0
        },
        errors: ['Ses dosyası işlenirken hata oluştu'],
        warnings: []
      }
    }
  }
  
  /**
   * Ses dosyası validasyonu yap
   * 
   * @param inputPath - Giriş ses dosyası yolu
   * @returns AudioValidationResult
   */
  static async validateAudio(inputPath: string): Promise<AudioValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      const metadata = await this.getAudioMetadata(inputPath)
      const { duration, format, bitrate, sampleRate, channels, size } = metadata
      
      // Süre kontrolleri
      if (duration < AUDIO_CONSTRAINTS.MIN_DURATION_SECONDS) {
        errors.push(ERROR_MESSAGES.FILE_QUALITY.AUDIO_TOO_SHORT)
      }
      
      if (duration > AUDIO_CONSTRAINTS.MAX_DURATION_SECONDS) {
        errors.push(ERROR_MESSAGES.FILE_QUALITY.AUDIO_TOO_LONG)
      }
      
      // Dosya boyutu kontrolü
      if (size > AUDIO_CONSTRAINTS.MAX_SIZE_BYTES) {
        errors.push('Ses dosyası çok büyük')
      }
      
      if (size < AUDIO_CONSTRAINTS.MIN_SIZE_BYTES) {
        warnings.push('Dosya boyutu çok küçük olabilir')
      }
      
      // Format kontrolü
      if (!AUDIO_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(`.${format}` as any)) {
        errors.push(ERROR_MESSAGES.FILE_QUALITY.UNSUPPORTED_FORMAT)
      }
      
      // Bitrate kontrolü
      if (bitrate < AUDIO_CONSTRAINTS.MIN_BITRATE_KBPS) {
        warnings.push('Ses kalitesi düşük olabilir')
      }
      
      if (bitrate > AUDIO_CONSTRAINTS.MAX_BITRATE_KBPS) {
        warnings.push('Ses dosyası çok büyük, optimize edilecek')
      }
      
      // Sample rate kontrolü
      if (sampleRate < AUDIO_CONSTRAINTS.MIN_SAMPLE_RATE_HZ) {
        warnings.push('Sample rate düşük')
      }
      
      // Ses seviyesi kontrolü
      const volumeLevel = await this.analyzeVolume(inputPath)
      if (volumeLevel < AUDIO_CONSTRAINTS.MIN_VOLUME_THRESHOLD) {
        errors.push(ERROR_MESSAGES.FILE_QUALITY.AUDIO_TOO_QUIET)
      }
      
      // Silence ratio kontrolü
      const silenceRatio = await this.analyzeSilence(inputPath)
      if (silenceRatio > AUDIO_CONSTRAINTS.MAX_SILENCE_RATIO) {
        errors.push(ERROR_MESSAGES.FILE_QUALITY.AUDIO_TOO_SILENT)
      }
      
      // Noise level kontrolü
      const noiseLevel = await this.analyzeNoise(inputPath)
      if (noiseLevel > 0.7) { // %70'den fazla noise
        warnings.push(ERROR_MESSAGES.FILE_QUALITY.AUDIO_TOO_NOISY)
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: {
          ...metadata,
          volumeLevel,
          silenceRatio,
          noiseLevel
        }
      }
      
    } catch (error) {
      console.error('Ses validasyon hatası:', error)
      return {
        isValid: false,
        errors: ['Ses dosyası okunamadı'],
        warnings: [],
        metadata: {
          duration: 0,
          format: 'unknown',
          bitrate: 0,
          sampleRate: 0,
          channels: 0,
          size: 0,
          volumeLevel: 0,
          silenceRatio: 0,
          noiseLevel: 0
        }
      }
    }
  }
  
  /**
   * Ses dosyası metadata'sını al
   * 
   * @param inputPath - Ses dosyası yolu
   * @returns Metadata bilgisi
   */
  private static async getAudioMetadata(inputPath: string): Promise<{
    duration: number
    format: string
    bitrate: number
    sampleRate: number
    channels: number
    size: number
    volumeLevel: number
    silenceRatio: number
    noiseLevel: number
  }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err: any, metadata: any) => {
        if (err) {
          reject(err)
          return
        }
        
        const audioStream = metadata.streams.find((stream: any) => stream.codec_type === 'audio')
        if (!audioStream) {
          reject(new Error('Ses stream bulunamadı'))
          return
        }
        
        const fileStats = fs.statSync(inputPath)
        
        resolve({
          duration: parseFloat(metadata.format.duration || '0'),
          format: metadata.format.format_name || 'unknown',
          bitrate: parseInt(audioStream.bit_rate || '0') / 1000, // kbps
          sampleRate: parseInt(audioStream.sample_rate || '0'),
          channels: audioStream.channels || 0,
          size: fileStats.size,
          volumeLevel: 0, // Ayrı hesaplanacak
          silenceRatio: 0, // Ayrı hesaplanacak
          noiseLevel: 0 // Ayrı hesaplanacak
        })
      })
    })
  }
  
  /**
   * Ses seviyesini analiz et
   * 
   * @param inputPath - Ses dosyası yolu
   * @returns Ses seviyesi (0-1)
   */
  private static async analyzeVolume(inputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let maxVolume = 0
      
      ffmpeg(inputPath)
        .audioFilters('volumedetect')
        .format('null')
        .on('stderr', (stderrLine: any) => {
          // FFmpeg output'undan max_volume değerini çıkar
          const match = stderrLine.match(/max_volume:\s*([-\d.]+)/)
          if (match) {
            maxVolume = parseFloat(match[1])
          }
        })
        .on('end', () => {
          // dB'yi 0-1 aralığına normalize et
          const normalizedVolume = Math.max(0, Math.min(1, (maxVolume + 60) / 60))
          resolve(normalizedVolume)
        })
        .on('error', (err: any) => {
          console.error('Volume analysis error:', err)
          resolve(0.5) // Fallback
        })
        .save('/dev/null') // Output'u discard et
    })
  }
  
  /**
   * Silence ratio analiz et
   * 
   * @param inputPath - Ses dosyası yolu
   * @returns Silence oranı (0-1)
   */
  private static async analyzeSilence(inputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let silenceDuration = 0
      let totalDuration = 0
      
      ffmpeg(inputPath)
        .audioFilters('silencedetect=noise=-30dB:d=0.5')
        .format('null')
        .on('stderr', (stderrLine: any) => {
          // Duration bilgisini al
          if (stderrLine.includes('Duration:')) {
            const match = stderrLine.match(/Duration: (\d+):(\d+):(\d+\.\d+)/)
            if (match) {
              const hours = parseInt(match[1])
              const minutes = parseInt(match[2])
              const seconds = parseFloat(match[3])
              totalDuration = hours * 3600 + minutes * 60 + seconds
            }
          }
          
          // Silence duration'ları topla
          if (stderrLine.includes('silence_duration:')) {
            const match = stderrLine.match(/silence_duration:\s*([\d.]+)/)
            if (match) {
              silenceDuration += parseFloat(match[1])
            }
          }
        })
        .on('end', () => {
          const silenceRatio = totalDuration > 0 ? silenceDuration / totalDuration : 0
          resolve(silenceRatio)
        })
        .on('error', (err: any) => {
          console.error('Silence analysis error:', err)
          resolve(0) // Fallback
        })
        .save('/dev/null')
    })
  }
  
  /**
   * Noise level analiz et
   * 
   * @param inputPath - Ses dosyası yolu
   * @returns Noise oranı (0-1)
   */
  private static async analyzeNoise(inputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let noiseLevel = 0
      
      ffmpeg(inputPath)
        .audioFilters('astats=metadata=1:reset=1')
        .format('null')
        .on('stderr', (stderrLine: any) => {
          // Noise floor analizi
          if (stderrLine.includes('lavfi.astats.Overall.RMS_level:')) {
            const match = stderrLine.match(/lavfi\.astats\.Overall\.RMS_level:\s*([-\d.]+)/)
            if (match) {
              const rmsLevel = parseFloat(match[1])
              // dB'yi 0-1 aralığına normalize et (tahmini)
              noiseLevel = Math.max(0, Math.min(1, (rmsLevel + 80) / 80))
            }
          }
        })
        .on('end', () => {
          resolve(noiseLevel)
        })
        .on('error', (err: any) => {
          console.error('Noise analysis error:', err)
          resolve(0.3) // Fallback
        })
        .save('/dev/null')
    })
  }
  
  /**
   * Optimizasyon gerekip gerekmediğini kontrol et
   * 
   * @param metadata - Metadata bilgisi
   * @param options - Optimizasyon seçenekleri
   * @returns Optimizasyon gerekli mi?
   */
  private static needsOptimization(
    metadata: any,
    options: any
  ): boolean {
    const { duration, bitrate, sampleRate, channels, size } = metadata
    
    // Çok uzun süre
    if (duration > AUDIO_CONSTRAINTS.MAX_DURATION_SECONDS) {
      return true
    }
    
    // Çok büyük dosya boyutu
    if (size > 10 * 1024 * 1024) { // 10MB
      return true
    }
    
    // Düşük kalite
    if (bitrate < AUDIO_CONSTRAINTS.MIN_BITRATE_KBPS) {
      return true
    }
    
    // Yanlış sample rate
    if (sampleRate !== AUDIO_CONSTRAINTS.OPTIMIZE_FOR_AI.TARGET_SAMPLE_RATE) {
      return true
    }
    
    // Çok kanal (stereo)
    if (channels > AUDIO_CONSTRAINTS.OPTIMIZE_FOR_AI.TARGET_CHANNELS) {
      return true
    }
    
    return false
  }
  
  /**
   * Optimizasyon işlemini gerçekleştir
   * 
   * @param inputPath - Giriş dosyası yolu
   * @param outputPath - Çıkış dosyası yolu
   * @param options - Optimizasyon seçenekleri
   * @returns Çıkış dosyası yolu
   */
  private static async performOptimization(
    inputPath: string,
    outputPath: string,
    options: {
      targetSampleRate?: number
      targetBitrate?: number
      targetChannels?: number
      normalizeVolume?: boolean
      removeNoise?: boolean
      trimSilence?: boolean
    }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const {
        targetSampleRate = AUDIO_CONSTRAINTS.OPTIMIZE_FOR_AI.TARGET_SAMPLE_RATE,
        targetBitrate = AUDIO_CONSTRAINTS.OPTIMIZE_FOR_AI.TARGET_BITRATE,
        targetChannels = AUDIO_CONSTRAINTS.OPTIMIZE_FOR_AI.TARGET_CHANNELS,
        normalizeVolume = true,
        removeNoise = false,
        trimSilence = false
      } = options
      
      let command = ffmpeg(inputPath)
      
      // Ses filtreleri
      const audioFilters = []
      
      // Normalize volume
      if (normalizeVolume) {
        audioFilters.push(`loudnorm=I=${AUDIO_CONSTRAINTS.OPTIMIZE_FOR_AI.NORMALIZE_LEVEL}`)
      }
      
      // Noise reduction
      if (removeNoise) {
        audioFilters.push('afftdn=nf=-20')
      }
      
      // Trim silence
      if (trimSilence) {
        audioFilters.push('silenceremove=start_periods=1:start_duration=0.5:start_threshold=-30dB')
      }
      
      // Filtreleri uygula
      if (audioFilters.length > 0) {
        command = command.audioFilters(audioFilters)
      }
      
      // Ses ayarları
      command
        .audioCodec('aac')
        .audioBitrate(targetBitrate)
        .audioFrequency(targetSampleRate)
        .audioChannels(targetChannels)
        .format('aac')
        .on('end', () => {
          resolve(outputPath)
        })
        .on('error', (err: any) => {
          console.error('Audio optimization error:', err)
          reject(err)
        })
        .save(outputPath)
    })
  }
  
  /**
   * Ses dosyası formatını tespit et
   * 
   * @param inputPath - Ses dosyası yolu
   * @returns Format bilgisi
   */
  static async detectFormat(inputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err: any, metadata: any) => {
        if (err) {
          reject(err)
          return
        }
        
        resolve(metadata.format.format_name || 'unknown')
      })
    })
  }
  
  /**
   * Ses dosyası süresini al
   * 
   * @param inputPath - Ses dosyası yolu
   * @returns Süre (saniye)
   */
  static async getDuration(inputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err: any, metadata: any) => {
        if (err) {
          reject(err)
          return
        }
        
        resolve(parseFloat(metadata.format.duration || '0'))
      })
    })
  }
}

/**
 * Utility fonksiyonları
 */
export const AudioUtils = {
  /**
   * Dosya uzantısından MIME type'a çevir
   * 
   * @param extension - Dosya uzantısı
   * @returns MIME type
   */
  extensionToMimeType: (extension: string): string => {
    const mapping: Record<string, string> = {
      '.wav': 'audio/wav',
      '.mp3': 'audio/mp3',
      '.m4a': 'audio/m4a',
      '.aac': 'audio/aac',
      '.3gp': 'audio/3gpp',
      '.ogg': 'audio/ogg',
      '.webm': 'audio/webm',
      '.flac': 'audio/flac'
    }
    
    return mapping[extension.toLowerCase()] || 'audio/mp3'
  },
  
  /**
   * Süreyi formatla (ss:ss formatında)
   * 
   * @param seconds - Süre (saniye)
   * @returns Formatlanmış süre
   */
  formatDuration: (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  },
  
  /**
   * Dosya boyutunu formatla
   * 
   * @param bytes - Byte cinsinden boyut
   * @returns Formatlanmış boyut
   */
  formatFileSize: (bytes: number): string => {
    return FileSizeHelpers.formatFileSize(bytes)
  }
}
