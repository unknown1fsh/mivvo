/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type errors must be fixed before production builds
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint errors must be fixed before production builds
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
      // NEXT_PUBLIC_API_URL Railway'de mutlaka backend service URL'i olarak ayarlanmalı
      // Örnek: NEXT_PUBLIC_API_URL=${{Mivvo-Backend.RAILWAY_PUBLIC_DOMAIN}}
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'),
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || (process.env.NODE_ENV === 'production' ? 'https://mivvo.up.railway.app' : 'http://localhost:3000'),
      // NEXTAUTH_SECRET and JWT_SECRET must be set in environment variables
      // No fallback values for security
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      CORS_ORIGIN: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://mivvo.up.railway.app' : 'http://localhost:3000'),
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
  // Build ID generation
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    }
    return config
  },
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/favicon.svg',
        permanent: true,
      },
    ]
  },
}

// Sentry configuration (opsiyonel - sadece SENTRY_DSN varsa)
if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const { withSentryConfig } = require('@sentry/nextjs');
    const sentryWebpackPluginOptions = {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
    };
    module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
  } catch (error) {
    console.warn('Sentry config yüklenemedi, normal config kullanılıyor:', error);
    module.exports = nextConfig;
  }
} else {
  module.exports = nextConfig;
}
