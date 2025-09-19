/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
      NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
        ? '/api' 
        : 'http://localhost:3001/api',
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  // Enable static generation for dynamic routes
  trailingSlash: false,
  // Ensure dynamic routes are properly handled
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    }
    return config
  },
}

module.exports = nextConfig
