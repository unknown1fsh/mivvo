import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log('🔍 Report API Debug:', { id, url: request.url });
    
    // Backend'den rapor verilerini al - authentication olmadan test için
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    console.log('🔍 Backend Request:', { backendUrl });
    
    const response = await fetch(`${backendUrl}/api/reports/${id}`, {
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
          { error: 'Rapor bulunamadı' },
          { status: 404 }
        );
      }
      
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Rapor verisi alınamadı:', error);
    return NextResponse.json(
      { error: 'Rapor verisi alınamadı' },
      { status: 500 }
    );
  }
}

