import { NextRequest, NextResponse } from 'next/server';

/**
 * NextAuth Session API Route
 * 
 * NextAuth session bilgilerini döndürür
 */
export async function GET(request: NextRequest) {
  try {
    // NextAuth session endpoint'i için basit response
    return NextResponse.json({
      user: null,
      expires: null
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Session error' },
      { status: 500 }
    );
  }
}
