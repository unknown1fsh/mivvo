import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export interface ReportStatus {
  id: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PENDING';
  progress?: number;
  error?: string;
  failedReason?: string;
  refundStatus?: string;
  data?: any;
}

export interface UseReportPollingOptions {
  reportId: string;
  pollingInterval?: number; // milisaniye
  timeout?: number; // milisaniye
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onTimeout?: () => void;
}

export interface UseReportPollingReturn {
  status: ReportStatus['status'];
  progress: number;
  error: string | null;
  isLoading: boolean;
  data: any;
  refundStatus: string | null;
  failedReason: string | null;
  retry: () => void;
  stopPolling: () => void;
}

export const useReportPolling = ({
  reportId,
  pollingInterval = 2000,
  timeout = 60000,
  onSuccess,
  onError,
  onTimeout
}: UseReportPollingOptions): UseReportPollingReturn => {
  const [status, setStatus] = useState<ReportStatus['status']>('PENDING');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [refundStatus, setRefundStatus] = useState<string | null>(null);
  const [failedReason, setFailedReason] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const router = useRouter();

  // Polling'i durdur - stable reference
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Rapor durumunu kontrol et - stable reference
  const checkReportStatus = useCallback(async () => {
    if (!reportId) return;
    
    console.log('🔍 Polling Debug:', { reportId, status, progress });
    
    try {
      const response = await fetch(`/api/reports/${reportId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 Polling Response:', { 
        status: response.status, 
        ok: response.ok,
        url: response.url 
      });

      if (!response.ok) {
        // 404 hatası için özel işlem - rapor bulunamadı
        if (response.status === 404) {
          console.log('Rapor bulunamadı, polling durduruluyor');
          setIsLoading(false);
          stopPolling();
          const notFoundMessage = 'Rapor bulunamadı. Lütfen tekrar deneyin.';
          setError(notFoundMessage);
          setStatus('FAILED');
          
          if (onError) {
            onError(notFoundMessage);
          }
          return;
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reportStatus: ReportStatus = await response.json();
      
      setStatus(reportStatus.status);
      setProgress(reportStatus.progress || 0);
      setError(reportStatus.error || null);
      setData(reportStatus.data || null);
      setRefundStatus(reportStatus.refundStatus || null);
      setFailedReason(reportStatus.failedReason || null);

      // Durum değişikliklerini işle
      switch (reportStatus.status) {
        case 'COMPLETED':
          setIsLoading(false);
          stopPolling();
          if (onSuccess) {
            onSuccess(reportStatus.data);
          }
          toast.success('Rapor başarıyla oluşturuldu!');
          break;
          
        case 'FAILED':
          setIsLoading(false);
          stopPolling();
          const errorMessage = reportStatus.error || 'Rapor oluşturulurken bir hata oluştu';
          setError(errorMessage);
          if (onError) {
            onError(errorMessage);
          }
          toast.error(errorMessage);
          break;
          
        case 'PROCESSING':
          // Progress hesapla (zaman bazlı)
          const elapsed = Date.now() - startTimeRef.current;
          const estimatedProgress = Math.min((elapsed / timeout) * 100, 90);
          setProgress(Math.max(reportStatus.progress || estimatedProgress, estimatedProgress));
          break;
          
        case 'PENDING':
          setProgress(10);
          break;
      }

    } catch (err) {
      console.error('Rapor durumu kontrol hatası:', err);
      const errorMessage = err instanceof Error ? err.message : 'Bağlantı hatası';
      setError(errorMessage);
      setIsLoading(false);
      stopPolling();
        setRefundStatus(null);
        setFailedReason(null);
      
      if (onError) {
        onError(errorMessage);
      }
      
      toast.error('Rapor durumu kontrol edilemedi');
    }
  }, [reportId, timeout, onSuccess, onError, stopPolling]);

  // Tekrar dene - stable reference
  const retry = useCallback(() => {
    setStatus('PENDING');
    setError(null);
    setProgress(0);
    setIsLoading(true);
    setRefundStatus(null);
    setFailedReason(null);
    startTimeRef.current = Date.now();
    
    // Mevcut polling'i temizle
    stopPolling();
    
    // İlk kontrol
    checkReportStatus();
    
    // Periyodik kontrol
    intervalRef.current = setInterval(checkReportStatus, pollingInterval);
    
    // Timeout
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      stopPolling();
      const timeoutMessage = 'Rapor oluşturma süresi aşıldı. Lütfen tekrar deneyin.';
      setError(timeoutMessage);
      
      if (onTimeout) {
        onTimeout();
      }
      
      toast.error(timeoutMessage);
    }, timeout);
  }, [checkReportStatus, pollingInterval, timeout, onTimeout, stopPolling]);

  // Component mount olduğunda polling'i başlat
  useEffect(() => {
    if (!reportId) return;
    
    // İlk durumu ayarla
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setStatus('PENDING');
    startTimeRef.current = Date.now();
    
    // İlk kontrol
    checkReportStatus();
    
    // Periyodik kontrol
    intervalRef.current = setInterval(checkReportStatus, pollingInterval);
    
    // Timeout
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      stopPolling();
      const timeoutMessage = 'Rapor oluşturma süresi aşıldı. Lütfen tekrar deneyin.';
      setError(timeoutMessage);
      
      if (onTimeout) {
        onTimeout();
      }
      
      toast.error(timeoutMessage);
    }, timeout);

    // Cleanup
    return () => {
      stopPolling();
    };
  }, [reportId]); // Sadece reportId değiştiğinde yeniden başlat

  return {
    status,
    progress,
    error,
    isLoading,
    data,
    retry,
    stopPolling,
    refundStatus,
    failedReason,
  };
};

// Progress mesajını almak için yardımcı hook
export const useProgressMessage = (progress: number): string => {
  if (progress < 20) return 'Analiz başlatılıyor...';
  if (progress < 40) return 'AI verileri değerlendiriyor...';
  if (progress < 60) return 'Rapor hazırlanıyor...';
  if (progress < 80) return 'Son kontroller yapılıyor...';
  if (progress < 95) return 'Rapor tamamlanıyor...';
  return 'Rapor hazır!';
};
