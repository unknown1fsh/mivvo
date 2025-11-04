import { NextResponse } from 'next/server';

/**
 * Health Check API Route
 * 
 * Railway ve diğer monitoring sistemleri için healthcheck endpoint'i
 * 
 * @route GET /api/health
 * @access Public
 */
export async function GET() {
  const healthCheckStart = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] 🏥 Frontend Health Check - Başlatılıyor...`);
  console.log(`[${timestamp}] 📋 Environment Variables:`);
  console.log(`   • NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`   • NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL || 'undefined'}`);
  console.log(`   • NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'undefined'}`);
  console.log(`   • Railway Environment: ${process.env.RAILWAY_ENVIRONMENT || 'N/A'}`);
  console.log(`   • Railway Service: ${process.env.RAILWAY_SERVICE_NAME || 'N/A'}`);
  console.log(`   • Railway Deployment: ${process.env.RAILWAY_DEPLOYMENT_ID || 'N/A'}`);
  
  try {
    const healthCheckDuration = Date.now() - healthCheckStart;
    const response = {
      status: 'OK',
      timestamp: timestamp,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      service: 'mivvo-frontend',
      version: '1.0.0',
      healthCheckDuration: healthCheckDuration,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      config: {
        hasApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      }
    };
    
    console.log(`[${timestamp}] ✅ Frontend Health Check - Başarılı (${healthCheckDuration}ms)`);
    console.log(`[${timestamp}] 📊 Health Check Response:`, JSON.stringify(response, null, 2));
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const healthCheckDuration = Date.now() - healthCheckStart;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(`[${timestamp}] ❌ Frontend Health Check - Hata:`, errorMessage);
    if (errorStack) {
      console.error(`[${timestamp}] ❌ Frontend Health Check - Stack trace:`, errorStack);
    }
    
    const response = {
      status: 'ERROR',
      timestamp: timestamp,
      error: errorMessage,
      healthCheckDuration: healthCheckDuration,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      }
    };
    
    console.log(`[${timestamp}] 📊 Health Check Error Response:`, JSON.stringify(response, null, 2));
    
    return NextResponse.json(response, { status: 500 });
  }
}

