import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Admin sayfalarını koru
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token')?.value
    
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // Token doğrulaması (basit)
    try {
      // JWT decode ve kontrol
      const payload = JSON.parse(atob(adminToken.split('.')[1]))
      
      if (!payload.isAdminSession || payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      
      // Token süresi kontrolü
      if (payload.exp * 1000 < Date.now()) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
