import React, { useEffect, useRef, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeKatex from 'rehype-katex'
import SyntaxHighlighter from './SyntaxHighlighter'
import mermaid from 'mermaid'
import 'katex/dist/katex.min.css'

// Initialize Mermaid
mermaid.initialize({ startOnLoad: false, theme: 'default' })

const MermaidDiagram = ({ value }) => {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && value) {
      try {
        mermaid.render(`mermaid-${Date.now()}`, value).then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg
          }
        })
      } catch (error) {
        console.error('Mermaid render error:', error)
        if (ref.current) {
          ref.current.textContent = 'Error rendering diagram'
        }
      }
    }
  }, [value])

  return <div ref={ref} style={{ padding: '10px' }} />
}

const CodeComponent = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : null

  if (!inline && language === 'mermaid') {
    return <MermaidDiagram value={String(children).trim()} />
  }

  if (!inline && language) {
    return <SyntaxHighlighter language={language} value={String(children).trim()} {...props} />
  }

  return <code className={className} {...props}>{children}</code>
}

// Generate TOC from markdown
const generateTOC = (markdown) => {
  const headings = []
  const lines = markdown.split('\n')

  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2]
      const id = text.toLowerCase().replace(/[^\w]+/g, '-')
      headings.push({ level, text, id })
    }
  })

  return headings
}

export default ({ markdown, allowHtml, showToc }) => {
  const toc = useMemo(() => generateTOC(markdown), [markdown])

  // Create a permissive schema that allows more HTML but still blocks scripts
  const permissiveSchema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      '*': [...(defaultSchema.attributes['*'] || []), 'className', 'style', 'id'],
      svg: ['xmlns', 'viewBox', 'width', 'height', 'style'],
      path: ['d', 'fill', 'stroke', 'strokeWidth'],
      g: ['transform', 'fill', 'stroke'],
      rect: ['x', 'y', 'width', 'height', 'fill', 'stroke', 'rx', 'ry'],
      circle: ['cx', 'cy', 'r', 'fill', 'stroke'],
      text: ['x', 'y', 'fill', 'fontSize', 'textAnchor']
    },
    tagNames: [
      ...(defaultSchema.tagNames || []),
      'div', 'span', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'ul', 'ol', 'li', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code', 'em', 'strong', 'a', 'br', 'hr',
      'svg', 'path', 'g', 'rect', 'circle', 'text', 'line', 'polyline', 'polygon'
    ]
  }

  const rehypePlugins = allowHtml
    ? [rehypeRaw, rehypeKatex, [rehypeSanitize, permissiveSchema]]
    : [rehypeRaw, rehypeKatex, rehypeSanitize]

  const components = {
    code: CodeComponent
  }

  return (
    <div className="markdown-body" data-testid={'markdown-preview'} style={{ padding: '20px' }}>
      {showToc && toc.length > 0 && (
        <div style={{
          backgroundColor: '#f6f8fa',
          padding: '16px',
          marginBottom: '20px',
          borderRadius: '6px',
          border: '1px solid #d0d7de'
        }}>
          <h3 style={{ marginTop: 0 }}>Table of Contents</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {toc.map((item, idx) => (
              <li
                key={idx}
                style={{
                  paddingLeft: `${(item.level - 1) * 16}px`,
                  marginBottom: '4px'
                }}
              >
                <a href={`#${item.id}`} style={{ textDecoration: 'none', color: '#0366d6' }}>
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={rehypePlugins}
        components={components}
        children={markdown}
      />
    </div>
  )
}
