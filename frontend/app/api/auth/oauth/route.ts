import { NextRequest, NextResponse } from 'next/server';

/**
 * NextAuth OAuth API Route
 * 
 * OAuth login isteklerini backend'e yönlendirir
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, providerId, email, name, image, accessToken } = body;

    // Backend'e OAuth isteği gönder
    const backendUrl = process.env.BACKEND_URL || 'https://mivvo-backend-production.up.railway.app';
    
    const response = await fetch(`${backendUrl}/api/auth/oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        provider, 
        providerId, 
        email, 
        name, 
        image, 
        accessToken 
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return NextResponse.json({
        success: true,
        data: data.data
      });
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'OAuth login failed' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('OAuth API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
