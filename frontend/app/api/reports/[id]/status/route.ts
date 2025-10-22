import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Backend'den rapor durumunu al - authentication olmadan test için
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    const response = await fetch(`${backendUrl}/api/reports/${id}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Test için authentication header'ı kaldırdık
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { 
            id,
            status: 'FAILED',
            error: 'Rapor bulunamadı',
            progress: 0
          },
          { status: 200 } // 200 döndür ama status FAILED olsun
        );
      }
      
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    // Backend'den gelen veriyi düzenle
    const statusData = {
      id,
      status: data.status || 'PROCESSING',
      progress: data.progress || 0,
      error: data.error || null,
      data: data.data || null
    };
    
    return NextResponse.json(statusData);
    
  } catch (error) {
    console.error('Rapor durumu alınamadı:', error);
    return NextResponse.json(
      {
        id: params.id,
        status: 'FAILED',
        error: 'Bağlantı hatası',
        progress: 0
      },
      { status: 200 } // 200 döndür ama status FAILED olsun
    );
  }
}

