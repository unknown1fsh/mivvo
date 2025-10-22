/**
 * Unified Report View Component
 * 
 * Tüm rapor türlerini tek bir component'te birleştirir
 * PDF indirme, loading ve error handling dahil
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentArrowDownIcon,
  ArrowLeftIcon,
  PrinterIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Rapor component'lerini import et
import { DamageReport } from './DamageReport';
import { PaintReport } from './PaintReport';
import { AudioReport } from './AudioReport';
import { ValueReport } from './ValueReport';
import { ComprehensiveReport } from './ComprehensiveReport';

// PDF ve utility'leri import et
import { generatePDFFromElement, downloadPDF, createSimplePDF, PDFReportData } from '@/lib/generatePDF';
import { useProgressMessage } from '@/hooks/useReportPolling';

// Tip tanımları
export type ReportType = 'damage' | 'paint' | 'audio' | 'value' | 'comprehensive';

export interface UnifiedReportData {
  id: string;
  type: ReportType;
  data: any;
  vehicleInfo: {
    plate: string;
    brand: string;
    model: string;
    year: number;
    vin?: string;
  };
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
  images?: string[];
  charts?: string[];
}

interface UnifiedReportViewProps {
  reportData: UnifiedReportData;
  onBack?: () => void;
  onRetry?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function UnifiedReportView({ 
  reportData, 
  onBack, 
  onRetry, 
  isLoading = false, 
  error = null 
}: UnifiedReportViewProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Rapor türüne göre başlık ve icon
  const getReportInfo = (type: ReportType) => {
    switch (type) {
      case 'damage':
        return {
          title: 'Hasar Analizi Raporu',
          icon: '🔧',
          color: 'red'
        };
      case 'paint':
        return {
          title: 'Boya Analizi Raporu',
          icon: '🎨',
          color: 'blue'
        };
      case 'audio':
        return {
          title: 'Motor Ses Analizi Raporu',
          icon: '🔊',
          color: 'cyan'
        };
      case 'value':
        return {
          title: 'Değer Tahmini Raporu',
          icon: '💰',
          color: 'green'
        };
      case 'comprehensive':
        return {
          title: 'Kapsamlı Ekspertiz Raporu',
          icon: '⭐',
          color: 'amber'
        };
      default:
        return {
          title: 'Analiz Raporu',
          icon: '📊',
          color: 'gray'
        };
    }
  };

  // Rapor component'ini render et
  const renderReportComponent = () => {
    const { data, vehicleInfo } = reportData;
    
    switch (reportData.type) {
      case 'damage':
        return <DamageReport data={data} vehicleInfo={vehicleInfo} />;
      case 'paint':
        return <PaintReport report={data} vehicleInfo={vehicleInfo} />;
      case 'audio':
        return <AudioReport data={data} vehicleInfo={vehicleInfo} />;
      case 'value':
        return <ValueReport data={data} vehicleInfo={vehicleInfo} />;
      case 'comprehensive':
        return <ComprehensiveReport data={data} vehicleInfo={vehicleInfo} />;
      default:
        return <div className="text-center text-gray-500">Desteklenmeyen rapor türü</div>;
    }
  };

  // PDF indirme fonksiyonu
  const handleDownloadPDF = async () => {
    if (!reportRef.current) {
      toast.error('Rapor yüklenemedi');
      return;
    }

    setIsGeneratingPDF(true);
    
    try {
      // PDF data hazırla
      const pdfData: PDFReportData = {
        title: getReportInfo(reportData.type).title,
        vehicleInfo: reportData.vehicleInfo,
        reportType: reportData.type,
        analysisData: reportData.data,
        images: reportData.images || [],
        charts: reportData.charts || [],
        createdAt: reportData.createdAt,
        reportId: reportData.id
      };
      
      // PDF oluştur
      const pdf = createSimplePDF(pdfData);
      
      // Dosya adı
      const filename = `${getReportInfo(reportData.type).title}-${reportData.vehicleInfo.plate}-${new Date(reportData.createdAt).toLocaleDateString('tr-TR')}.pdf`;
      
      // İndir
      downloadPDF(pdf, filename);
      toast.success('Rapor başarıyla indirildi!');
      
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      toast.error('PDF indirilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Yazdırma fonksiyonu
  const handlePrint = () => {
    if (!reportRef.current) {
      toast.error('Rapor yüklenemedi');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${getReportInfo(reportData.type).title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .print-footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px; text-align: center; font-size: 12px; color: #666; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h1>${getReportInfo(reportData.type).title}</h1>
              <p>${reportData.vehicleInfo.brand} ${reportData.vehicleInfo.model} (${reportData.vehicleInfo.year}) - ${reportData.vehicleInfo.plate}</p>
              <p>Rapor Tarihi: ${new Date(reportData.createdAt).toLocaleDateString('tr-TR')}</p>
            </div>
            ${reportRef.current.innerHTML}
            <div class="print-footer">
              <p>Bu rapor MIVVO AI teknolojisi ile oluşturulmuştur.</p>
              <p>Rapor ID: ${reportData.id}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Paylaşım fonksiyonu
  const handleShare = async () => {
    const shareData = {
      title: getReportInfo(reportData.type).title,
      text: `${reportData.vehicleInfo.brand} ${reportData.vehicleInfo.model} için ${getReportInfo(reportData.type).title}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: URL'yi kopyala
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Rapor linki kopyalandı!');
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      toast.error('Paylaşım başarısız');
    }
  };

  const reportInfo = getReportInfo(reportData.type);

  // Loading durumu
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Rapor hazırlanıyor...</h3>
          <p className="text-gray-500">Lütfen bekleyin, bu işlem birkaç dakika sürebilir.</p>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Rapor Yüklenemedi</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="space-x-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Tekrar Dene
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Geri Dön
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Sol taraf - Geri dön ve başlık */}
            <div className="flex items-center">
              {onBack && (
                <button
                  onClick={onBack}
                  className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">{reportInfo.icon}</span>
                  {reportInfo.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {reportData.vehicleInfo.brand} {reportData.vehicleInfo.model} ({reportData.vehicleInfo.year}) - {reportData.vehicleInfo.plate}
                </p>
              </div>
            </div>

            {/* Sağ taraf - Aksiyon butonları */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Paylaş
              </button>
              
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Yazdır
              </button>
              
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                {isGeneratingPDF ? 'PDF Hazırlanıyor...' : 'PDF İndir'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rapor İçeriği */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          ref={reportRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm"
        >
          {/* Rapor Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{reportInfo.title}</h2>
                <p className="text-gray-600 mt-1">
                  Rapor ID: {reportData.id} • 
                  Oluşturulma Tarihi: {new Date(reportData.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Tamamlandı
                </div>
              </div>
            </div>
          </div>

          {/* Rapor Body */}
          <div className="px-6 py-6">
            {renderReportComponent()}
          </div>

          {/* Rapor Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center text-sm text-gray-500">
              <p>Bu rapor MIVVO AI teknolojisi ile oluşturulmuştur.</p>
              <p className="mt-1">
                Rapor doğrulama için QR kod: <span className="font-mono text-xs">{String(reportData.id).substring(0, 8)}</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
