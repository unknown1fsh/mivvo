import { NextRequest, NextResponse } from 'next/server';

/**
 * NextAuth Log API Route
 * 
 * NextAuth log isteklerini handle eder
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('NextAuth log:', body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log API error:', error);
    return NextResponse.json(
      { error: 'Log error' },
      { status: 500 }
    );
  }
}
