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
  experimental: {
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
  },
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
        splitChunks: {
          chunks: 'all',
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
              enforce: true
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
                return `npm.${packageName.replace('@', '')}`
              },
              priority: 10
            }
          }
        }
      }
    }

    // Ignore source maps in production
    if (process.env.NODE_ENV === 'production') {
      config.devtool = false
    }

    return config
  }
}

module.exports = nextConfig
