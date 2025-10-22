/**
 * Unified Report Page
 * 
 * Tüm rapor türleri için tek birleşik sayfa
 * /reports/[id] route'u için
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { UnifiedReportView, UnifiedReportData } from '@/components/features/UnifiedReportView';
import { ReportLoading } from '@/components/ui/ReportLoading';
import { ReportError } from '@/components/ui/ReportError';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = params.id as string;

  console.log('🔍 ReportPage Debug:', { 
    reportId, 
    searchParams: searchParams.toString(),
    type: searchParams.get('type')
  });

  const [reportData, setReportData] = useState<UnifiedReportData | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // İlk yükleme sırasında rapor verilerini al
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        console.log('📥 Fetching report data...');
        const response = await fetch(`/api/reports/${reportId}`);
        
        console.log('📡 Response received:', { 
          status: response.status, 
          ok: response.ok 
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Rapor bulunamadı');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('📊 Report data:', { 
          id: data.id, 
          type: data.type, 
          status: data.status,
          hasVehicleInfo: !!data.vehicleInfo,
          hasData: !!data.data,
          dataContent: data.data // Veri içeriğini görmek için
        });
        
        // Rapor verisini set et
        setReportData(data);
        setIsInitialLoading(false);
        
      } catch (err) {
        console.error('❌ Rapor verisi alınamadı:', err);
        setFetchError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
        setIsInitialLoading(false);
      }
    };

    if (reportId) {
      fetchReportData();
    }
  }, [reportId]);

  // Geri dönme fonksiyonu
  const handleBack = () => {
    router.push('/dashboard');
  };

  // İlk yükleme durumu
  if (isInitialLoading) {
    const reportType = searchParams.get('type') || 'comprehensive';
    return (
      <ReportLoading
        type={reportType as any}
        progress={75}
        estimatedTime="Yükleniyor..."
      />
    );
  }

  // Hata durumu
  if (fetchError) {
    return (
      <ReportError
        type="not_found"
        message={fetchError}
        onRetry={() => window.location.reload()}
        showDashboardLink={true}
      />
    );
  }

  // Rapor verisi mevcut
  if (reportData) {
    console.log('✅ Rendering UnifiedReportView with data');
    return (
      <UnifiedReportView
        reportData={reportData}
        onBack={handleBack}
      />
    );
  }

  // Varsayılan durum - rapor bulunamadı
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Rapor Bulunamadı</h3>
        <p className="text-gray-500 mb-6">
          Aradığınız rapor bulunamadı veya henüz oluşturulmamış olabilir.
        </p>
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Dashboard'a Dön
        </button>
      </div>
    </div>
  );
}