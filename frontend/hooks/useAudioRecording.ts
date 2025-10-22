// Ses kayıt ve analiz hook'u

import { useState, useRef, useCallback } from 'react'
import { UploadedAudio } from '@/types'
import { engineSoundAnalysisService } from '@/services/engineSoundAnalysisService'
import toast from 'react-hot-toast'

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudios, setRecordedAudios] = useState<UploadedAudio[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Mikrofon izni al ve kayıt başlat
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        const audioFile = new File([audioBlob], `engine-sound-${Date.now()}.webm`, {
          type: 'audio/webm'
        })
        
        const newAudio: UploadedAudio = {
          id: `audio-${Date.now()}`,
          file: audioFile,
          duration: recordingDuration,
          name: audioFile.name,
          size: audioFile.size,
          status: 'uploaded',
          type: 'engine_sound'
        }
        
        setRecordedAudios(prev => [...prev, newAudio])
        setRecordingDuration(0)
        
        // Stream'i temizle
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      
      // Kayıt süresini takip et
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
      
      toast.success('Kayıt başlatıldı')
      
    } catch (error) {
      console.error('Kayıt başlatma hatası:', error)
      toast.error('Mikrofon erişimi reddedildi veya kayıt başlatılamadı')
    }
  }, [recordingDuration])

  // Kayıt durdur
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      toast.success('Kayıt tamamlandı')
    }
  }, [isRecording])

  // Ses dosyası yükle
  const uploadAudioFile = useCallback((file: File) => {
    const audioUrl = URL.createObjectURL(file)
    
    // Ses dosyası süresini al
    const audio = new Audio(audioUrl)
    audio.addEventListener('loadedmetadata', () => {
      const duration = Math.round(audio.duration)
      
      const newAudio: UploadedAudio = {
        id: `audio-${Date.now()}`,
        file,
        duration,
        name: file.name,
        size: file.size,
        status: 'uploaded',
        type: 'engine_sound'
      }
      
      setRecordedAudios(prev => [...prev, newAudio])
    })
    
    audio.load()
  }, [])

  // Ses dosyası sil
  const removeAudio = useCallback((audioId: string) => {
    setRecordedAudios(prev => prev.filter(audio => audio.id !== audioId))
  }, [])

  // Ses dosyası kalitesini kontrol et
  const validateAudioQuality = useCallback(async (audioFile: File) => {
    const validation = await engineSoundAnalysisService.validateAudioQuality(audioFile)
    
    if (!validation.isValid) {
      toast.error(`Ses kalitesi sorunları: ${validation.issues.join(', ')}`)
      validation.recommendations.forEach(rec => {
        toast(rec, { icon: '💡' })
      })
    }
    
    return validation
  }, [])

  // Motor sesi analizi yap
  const performEngineSoundAnalysis = useCallback(async (vehicleInfo: any) => {
    if (recordedAudios.length === 0) {
      toast.error('Analiz için en az bir ses kaydı gerekli')
      return null
    }

    setIsAnalyzing(true)
    
    try {
      const response = await engineSoundAnalysisService.startAnalysis({
        vehicleInfo,
        audioFiles: recordedAudios,
        analysisType: 'detailed'
      })
      
      if (response.success && response.data) {
        toast.success('Motor sesi analizi tamamlandı')
        return response.data
      } else {
        toast.error(response.error || 'Analiz sırasında hata oluştu')
        return null
      }
    } catch (error: any) {
      console.error('Motor sesi analizi hatası:', error)
      
      const message = error.response?.data?.message || error.message || 'Analiz sırasında hata oluştu'
      
      // Kredi iadesi mesajını özel olarak göster
      if (message.includes('iade') || error.response?.data?.creditRefunded) {
        toast.success('💳 ' + message, { duration: 5000 })
      } else {
        toast.error(message)
      }
      
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [recordedAudios])

  // Temizlik
  const cleanup = useCallback(() => {
    if (isRecording) {
      stopRecording()
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    setRecordedAudios([])
    setRecordingDuration(0)
  }, [isRecording, stopRecording])

  return {
    // Durum
    isRecording,
    recordedAudios,
    isAnalyzing,
    recordingDuration,
    
    // Fonksiyonlar
    startRecording,
    stopRecording,
    uploadAudioFile,
    removeAudio,
    validateAudioQuality,
    performEngineSoundAnalysis,
    cleanup,
    
    // Yardımcı fonksiyonlar
    formatDuration: (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    getTotalDuration: () => {
      return recordedAudios.reduce((total, audio) => total + audio.duration, 0)
    },
    
    canStartAnalysis: () => {
      return recordedAudios.length > 0 && !isAnalyzing
    }
  }
}
