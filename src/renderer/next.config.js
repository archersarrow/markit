/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  reactStrictMode: false,
  swcMinify: true,
  // Important for Tauri
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : undefined,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false
  },
  transpilePackages: [
    'react-markdown',
    'remark-gfm',
    'remark-math',
    'rehype-raw',
    'rehype-sanitize',
    'rehype-katex',
    'katex',
    'mermaid'
  ]
}

module.exports = nextConfig
