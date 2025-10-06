/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  webpack(config) {
    // Allows you to load Electron modules and
    // native Node.js ones into your renderer
    config.target = 'electron-renderer'
    return config
  }
}

module.exports = nextConfig
