/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'),
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'production' ? 'https://www.mivvo.org' : 'http://localhost:3000'),
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret',
      CORS_ORIGIN: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://www.mivvo.org' : 'http://localhost:3000'),
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  trailingSlash: false,
  // Disable static optimization for pages that use useSearchParams
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Vercel için optimize edilmiş build ID
  generateBuildId: async () => {
    if (process.env.VERCEL) {
      return process.env.VERCEL_GIT_COMMIT_SHA || 'vercel-build';
    }
    return `build-${Date.now()}`;
  },
  // Vercel için output ayarları kaldırıldı
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    }
    return config
  },
}

module.exports = nextConfig
