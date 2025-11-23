/**
 * Unified Report Page
 * 
 * Tüm rapor türleri için tek birleşik sayfa
 * /reports/[id] route'u için
 * 
 * ReportDetailClient component'ini kullanarak doğru endpoint'lerden rapor verisini çeker
 */

'use client';

import { useParams } from 'next/navigation';
import { ReportDetailClient } from './ReportDetailClient';

export default function ReportPage() {
  const params = useParams();
  const reportId = params.id as string;

  if (!reportId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Rapor ID Bulunamadı</h3>
          <p className="text-gray-500 mb-6">
            Rapor ID parametresi eksik.
          </p>
        </div>
      </div>
    );
  }

  return <ReportDetailClient reportId={reportId} />;
}