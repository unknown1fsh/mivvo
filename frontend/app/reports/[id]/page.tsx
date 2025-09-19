import { ReportDetailClient } from './ReportDetailClient'

// Static params for Vercel deployment
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' }
  ]
}

// Generate metadata for each report
export async function generateMetadata({ params }: { params: { id: string } }) {
  const mockReports: { [key: string]: any } = {
    '1': {
      id: '1',
      vehicleInfo: {
        plate: '34 ABC 123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        vin: '1HGBH41JXMN109186',
        color: 'Gümüş',
        mileage: 45000,
        fuelType: 'Benzin',
        transmission: 'CVT',
        engine: '1.6L 4-Silindir',
        bodyType: 'Sedan'
      },
      reportType: 'Tam Expertiz',
      status: 'completed',
      createdAt: '2024-01-15',
      totalCost: 75,
      overallScore: 87,
      marketValue: { estimatedValue: 485000 }
    },
    '2': {
      id: '2',
      vehicleInfo: {
        plate: '06 XYZ 789',
        brand: 'Honda',
        model: 'Civic',
        year: 2019,
        vin: '1HGBH41JXMN109187',
        color: 'Kırmızı',
        mileage: 62000,
        fuelType: 'Benzin',
        transmission: 'Manuel',
        engine: '1.5L Turbo',
        bodyType: 'Hatchback'
      },
      reportType: 'Boya Analizi',
      status: 'processing',
      createdAt: '2024-01-14',
      totalCost: 25,
      overallScore: 78,
      marketValue: { estimatedValue: 425000 }
    }
  }

  const report = mockReports[params.id]
  
  if (!report) {
    return {
      title: 'Rapor Bulunamadı - Mivvo Expertiz',
      description: 'Aradığınız rapor bulunamadı.'
    }
  }

  return {
    title: `${report.vehicleInfo.brand} ${report.vehicleInfo.model} ${report.vehicleInfo.year} - Expertiz Raporu | Mivvo Expertiz`,
    description: `${report.vehicleInfo.plate} plakalı ${report.vehicleInfo.brand} ${report.vehicleInfo.model} için detaylı expertiz raporu. Puan: ${report.overallScore}/100, Tahmini değer: ${report.marketValue.estimatedValue.toLocaleString()}₺`,
    keywords: `expertiz, ${report.vehicleInfo.brand}, ${report.vehicleInfo.model}, araç analizi, ${report.vehicleInfo.plate}`,
    openGraph: {
      title: `${report.vehicleInfo.brand} ${report.vehicleInfo.model} Expertiz Raporu`,
      description: `Detaylı araç analizi ve piyasa değeri: ${report.marketValue.estimatedValue.toLocaleString()}₺`,
      type: 'website',
    }
  }
}

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  return <ReportDetailClient reportId={params.id} />
}
