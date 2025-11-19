'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  TruckIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';

interface VINData {
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
  cached?: boolean;
  lastUpdated?: string;
}

export default function VINLookupPage() {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VINData | null>(null);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const generatePDF = async () => {
    if (!result) return;
    
    setPdfLoading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Türkçe karakterler için font ayarları
      pdf.setFont('helvetica', 'normal');
      
      // Arka plan gradient efekti (mavi tonları)
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Başlık bölümü - Türkçe karakterler düzgün
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SASI NUMARASI SORGULAMA RAPORU', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Mivvo Expertiz', pageWidth / 2, 30, { align: 'center' });
      
      // Tarih ve VIN bilgisi
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, 50);
      pdf.text(`VIN Numarasi: ${result.vin}`, pageWidth - 20, 50, { align: 'right' });
      
      // Ayırıcı çizgi
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.line(20, 55, pageWidth - 20, 55);
      
      // Ana başlık
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text('ARAC BILGILERI', 20, 70);
      
      // Temel bilgiler kartı
      pdf.setFillColor(249, 250, 251);
      pdf.roundedRect(20, 75, pageWidth - 40, 40, 3, 3, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(75, 85, 99);
      pdf.text('TEMEL BILGILER', 25, 85);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      // Temel bilgiler - daha düzenli
      const basicInfo = [
        { label: 'Marka', value: result.make },
        { label: 'Model', value: result.model },
        { label: 'Model Yili', value: result.modelYear },
        { label: 'Uretici', value: result.manufacturer }
      ];
      
      basicInfo.forEach((info, index) => {
        const x = 25 + (index % 2) * 85;
        const y = 95 + Math.floor(index / 2) * 10;
        if (info.value && info.value !== 'Bilinmiyor') {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${info.label}:`, x, y);
          pdf.setFont('helvetica', 'normal');
          pdf.text(info.value, x + 30, y);
        }
      });
      
      // Teknik özellikler kartı
      pdf.setFillColor(239, 246, 255);
      pdf.roundedRect(20, 120, pageWidth - 40, 40, 3, 3, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text('TEKNIK OZELLIKLER', 25, 130);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      const techInfo = [
        { label: 'Arac Tipi', value: result.vehicleType },
        { label: 'Yakit Tipi', value: result.fuelType },
        { label: 'Motor Silindirleri', value: result.engineCylinders },
        { label: 'Motor Hacmi', value: result.engineDisplacement }
      ];
      
      techInfo.forEach((info, index) => {
        const x = 25 + (index % 2) * 85;
        const y = 140 + Math.floor(index / 2) * 10;
        if (info.value && info.value !== 'Bilinmiyor') {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${info.label}:`, x, y);
          pdf.setFont('helvetica', 'normal');
          pdf.text(info.value, x + 35, y);
        }
      });
      
      // Sürüş özellikleri
      pdf.setFillColor(240, 253, 244);
      pdf.roundedRect(20, 165, pageWidth - 40, 30, 3, 3, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 197, 94);
      pdf.text('SURUS OZELLIKLERI', 25, 175);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      const driveInfo = [
        { label: 'Sanziman', value: result.transmissionStyle },
        { label: 'Cekis Tipi', value: result.driveType }
      ];
      
      driveInfo.forEach((info, index) => {
        const x = 25 + index * 85;
        const y = 185;
        if (info.value && info.value !== 'Bilinmiyor') {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${info.label}:`, x, y);
          pdf.setFont('helvetica', 'normal');
          pdf.text(info.value, x + 30, y);
        }
      });
      
      // Üretim bilgileri kartı
      pdf.setFillColor(254, 249, 195);
      pdf.roundedRect(20, 200, pageWidth - 40, 40, 3, 3, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(234, 179, 8);
      pdf.text('URETIM BILGILERI', 25, 210);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      const productionInfo = [
        { label: 'Uretim Ulkesi', value: result.plantCountry },
        { label: 'Uretim Sehri', value: result.plantCity },
        { label: 'Uretim Sirketi', value: result.plantCompanyName }
      ];
      
      productionInfo.forEach((info, index) => {
        const x = 25 + (index % 2) * 85;
        const y = 220 + Math.floor(index / 2) * 10;
        if (info.value && info.value !== 'Bilinmiyor') {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${info.label}:`, x, y);
          pdf.setFont('helvetica', 'normal');
          pdf.text(info.value, x + 40, y);
        }
      });
      
      // Alt bilgi bölümü
      pdf.setFillColor(243, 244, 246);
      pdf.roundedRect(20, 245, pageWidth - 40, 25, 3, 3, 'F');
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text('Bu rapor Mivvo Expertiz tarafindan NHTSA (ABD Ulusal Karayolu Trafik Guvenligi Idaresi)', 25, 252);
      pdf.text('veritabani kullanilarak olusturulmustur. Bilgiler ABD pazarina odaklanmis olup,', 25, 257);
      pdf.text('Turkiye\'deki araclar icin eksik veya sinirli olabilir.', 25, 262);
      
      // Logo ve web sitesi
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text('www.mivvo.com', pageWidth - 20, 262, { align: 'right' });
      
      // PDF'i indir
      const fileName = `sasi-raporu-${result.vin}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleVINSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vin.trim()) {
      setError('VIN numarası gereklidir');
      return;
    }

    if (vin.length !== 17) {
      setError('VIN numarası 17 haneli olmalıdır');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/vin/decode' 
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/vin/decode`;
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vin: vin.toUpperCase() }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        
        // Uyarı mesajları varsa göster
        if (data.warnings && data.warnings.length > 0) {
          console.warn('VIN uyarıları:', data.warnings);
        }
      } else {
        // NHTSA API hata mesajlarını Türkçe'ye çevir
        let errorMessage = data.message || 'VIN sorgulama sırasında hata oluştu';
        
        if (errorMessage.includes('No detailed data available')) {
          errorMessage = 'Bu VIN numarası için detaylı bilgi bulunamadı. VIN numarasını kontrol edin veya farklı bir VIN deneyin.';
        } else if (errorMessage.includes('Check Digit') || errorMessage.includes('kontrol hanesi')) {
          errorMessage = 'VIN numarasının 9. hanesi (kontrol hanesi) hatalı. VIN numarasını kontrol edin.';
          // Check digit önerisi varsa göster
          if (data.suggestion) {
            errorMessage += ' ' + data.suggestion;
          }
        } else if (errorMessage.includes('Invalid')) {
          errorMessage = 'Geçersiz VIN formatı. 17 haneli VIN numarası girin.';
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const isValidVIN = (vin: string) => {
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return vinRegex.test(vin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Geri Tuşu */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Dashboard&apos;a Dön</span>
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <TruckIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Şasi Numarası Sorgulama
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Araç şasi numarasından detaylı bilgileri öğrenin. 
            Marka, model, üretim yılı ve teknik özellikler hakkında bilgi alın.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleVINSubmit} className="space-y-6">
            <div>
              <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-2">
                Şasi Numarası (VIN)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="vin"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="17 haneli şasi numarasını girin (örn: 1HGBH41JXMN109186)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    vin && !isValidVIN(vin) ? 'border-red-300' : 'border-gray-300'
                  }`}
                  maxLength={17}
                />
                <MagnifyingGlassIcon className="absolute right-3 top-3 w-6 h-6 text-gray-400" />
              </div>
              {vin && !isValidVIN(vin) && (
                <p className="mt-2 text-sm text-red-600">
                  Geçersiz VIN formatı. Sadece harf ve rakam kullanın.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isValidVIN(vin)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sorgulanıyor...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  Şasi Sorgula
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Araç Bilgileri
              </h2>
              <div className="flex items-center space-x-4">
                {result.cached && (
                  <div className="flex items-center text-sm text-blue-600">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Cache&apos;den alındı
                  </div>
                )}
                <button
                  onClick={generatePDF}
                  disabled={pdfLoading}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  {pdfLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>PDF Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      <span>PDF İndir</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Temel Bilgiler
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Marka:</span>
                    <p className="text-gray-900">{result.make}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Model:</span>
                    <p className="text-gray-900">{result.model}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Model Yılı:</span>
                    <p className="text-gray-900">{result.modelYear}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Üretici:</span>
                    <p className="text-gray-900">{result.manufacturer}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Teknik Özellikler
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Araç Tipi:</span>
                    <p className="text-gray-900">{result.vehicleType}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Gövde Sınıfı:</span>
                    <p className="text-gray-900">{result.bodyClass}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Motor Silindir:</span>
                    <p className="text-gray-900">{result.engineCylinders}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Motor Hacmi:</span>
                    <p className="text-gray-900">{result.engineDisplacement}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Diğer Bilgiler
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Yakıt Tipi:</span>
                    <p className="text-gray-900">{result.fuelType}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Şanzıman:</span>
                    <p className="text-gray-900">{result.transmissionStyle}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Çekiş:</span>
                    <p className="text-gray-900">{result.driveType}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Kapı Sayısı:</span>
                    <p className="text-gray-900">{result.doors}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    Bilgi Kaynağı
                  </h4>
                  <p className="text-sm text-blue-700">
                    Bu bilgiler NHTSA (ABD Ulusal Karayolu Trafik Güvenliği İdaresi) 
                    veritabanından alınmıştır. Bilgiler ABD pazarına odaklanmış olup, 
                    Türkiye&apos;deki araçlar için eksik veya sınırlı olabilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}