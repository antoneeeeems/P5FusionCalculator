/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only export for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  // Only use basePath in production for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/persona5_calculator' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
