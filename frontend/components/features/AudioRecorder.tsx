'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  MicrophoneIcon, 
  StopIcon, 
  PlayIcon, 
  PauseIcon,
  TrashIcon,
  CloudArrowUpIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline'
import { UploadedAudio } from '@/types'
import { useAudioRecording } from '@/hooks/useAudioRecording'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface AudioRecorderProps {
  onAudiosChange: (audios: UploadedAudio[]) => void
  maxRecordings?: number
  onNext?: () => void
  onPrev?: () => void
  selectedReportType?: { id: string; name: string; icon: string } | null
  // Hook props (opsiyonel - eğer verilirse dışarıdan state kullanılır)
  audioRecordingHook?: ReturnType<typeof useAudioRecording>
}

export const AudioRecorder = ({ onAudiosChange, maxRecordings = 3, onNext, onPrev, selectedReportType, audioRecordingHook }: AudioRecorderProps) => {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  
  // Eğer dışarıdan hook verilmişse onu kullan, yoksa kendi hook'unu çağır
  const localHook = useAudioRecording()
  const hook = audioRecordingHook || localHook
  
  const {
    isRecording,
    recordedAudios,
    recordingDuration,
    startRecording,
    stopRecording,
    uploadAudioFile,
    removeAudio,
    validateAudioQuality,
    formatDuration,
    getTotalDuration,
    canStartAnalysis
  } = hook

  // recordedAudios değiştiğinde parent'a bildir
  useEffect(() => {
    onAudiosChange(recordedAudios)
  }, [recordedAudios, onAudiosChange])

  // Ses dosyası yükleme
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Dosya boyutu kontrolü (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Dosya boyutu 50MB\'dan büyük olamaz')
      return
    }

    // Kalite kontrolü
    const validation = await validateAudioQuality(file)
    if (!validation.isValid) {
      return
    }

    uploadAudioFile(file)
    toast.success('Ses dosyası yüklendi')
  }

  // Ses çalma/durdurma
  const togglePlayback = (audioId: string, audioUrl: string) => {
    if (playingAudio === audioId) {
      if (isPaused) {
        audioRef.current?.play()
        setIsPaused(false)
      } else {
        audioRef.current?.pause()
        setIsPaused(true)
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      
      audio.addEventListener('ended', () => {
        setPlayingAudio(null)
        setIsPaused(false)
      })
      
      audio.play()
      setPlayingAudio(audioId)
      setIsPaused(false)
    }
  }

  // Ses dosyası silme
  const handleRemoveAudio = (audioId: string) => {
    removeAudio(audioId)
    toast.success('Ses kaydı silindi')
  }

  // Kayıt başlatma/durdurma
  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      if (recordedAudios.length >= maxRecordings) {
        toast.error(`Maksimum ${maxRecordings} ses kaydı yapabilirsiniz`)
        return
      }
      startRecording()
    }
  }

  return (
    <div className="space-y-6">
      {/* Rapor Türü Gösterimi */}
      {selectedReportType && (
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <span className="mr-2">{selectedReportType.icon}</span>
            {selectedReportType.name}
          </div>
        </div>
      )}

      {/* Kayıt Kontrolleri */}
      <Card padding="lg">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <SpeakerWaveIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Motor Ses Kaydı</h3>
              <p className="text-sm text-gray-600">Motor çalışırken ses kaydı yapın</p>
            </div>
          </div>

          {/* Kayıt Butonu */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={handleRecordToggle}
              variant={isRecording ? "danger" : "primary"}
              size="lg"
              className="w-20 h-20 rounded-full"
              disabled={recordedAudios.length >= maxRecordings && !isRecording}
            >
              {isRecording ? (
                <StopIcon className="w-8 h-8" />
              ) : (
                <MicrophoneIcon className="w-8 h-8" />
              )}
            </Button>
            
            {isRecording && (
              <div className="text-center">
                <div className="text-2xl font-mono text-red-500">
                  {formatDuration(recordingDuration)}
                </div>
                <div className="text-sm text-gray-500">Kayıt süresi</div>
              </div>
            )}
          </div>

          {/* Dosya Yükleme */}
          <div className="flex items-center justify-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/wav,audio/mp3,audio/mpeg,audio/ogg,audio/webm,audio/m4a,audio/x-m4a,audio/mp4,audio/aac,audio/x-caf,audio/3gpp,audio/3gpp2,audio/amr,audio/x-amr,audio/opus,audio/flac,audio/x-flac,.wav,.mp3,.ogg,.webm,.m4a,.aac,.3gp,.amr,.opus,.flac,.caf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={recordedAudios.length >= maxRecordings}
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={recordedAudios.length >= maxRecordings}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudArrowUpIcon className="w-4 h-4 mr-2" />
              Dosya Yükle
            </Button>
          </div>

          {/* Bilgi */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Motor çalışırken kayıt yapın (5-30 saniye)</p>
            <p>• Sessiz ortamda kayıt yapın</p>
            <p>• 📱 Cep telefonu formatları: M4A, AAC, 3GP</p>
            <p>• 💻 Bilgisayar formatları: MP3, WAV, OGG, WebM</p>
            <p>• Maksimum {maxRecordings} kayıt yapabilirsiniz</p>
          </div>
        </div>
      </Card>

      {/* Kayıt Listesi */}
      {recordedAudios.length > 0 && (
        <Card padding="lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Ses Kayıtları ({recordedAudios.length}/{maxRecordings})
          </h4>
          
          <div className="space-y-3">
            {recordedAudios.map((audio) => (
              <div
                key={audio.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <SpeakerWaveIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900">
                      {audio.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDuration(audio.duration)} • {(audio.size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePlayback(audio.id, URL.createObjectURL(audio.file))}
                  >
                    {playingAudio === audio.id && !isPaused ? (
                      <PauseIcon className="w-4 h-4" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAudio(audio.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Toplam Süre */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Toplam Süre:</span>
              <span className="font-medium">{formatDuration(getTotalDuration())}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Navigasyon Butonları */}
      {(onNext || onPrev) && (
        <div className="flex justify-between pt-6">
          {onPrev && (
            <Button variant="secondary" onClick={onPrev}>
              Geri
            </Button>
          )}
          {onNext && (
            <Button 
              variant="primary" 
              onClick={onNext}
              disabled={recordedAudios.length === 0}
            >
              İleri
            </Button>
          )}
        </div>
      )}

      {/* Ses Elementi */}
      <audio ref={audioRef} />
    </div>
  )
}
