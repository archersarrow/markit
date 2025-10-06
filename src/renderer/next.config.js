/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
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
  // Use Next.js defaults; do not override webpack target
}

module.exports = nextConfig
