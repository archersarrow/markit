import React, { useState } from 'react'
import { Prism } from 'react-syntax-highlighter'

const SyntaxHighlighter = ({ language, value }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleCopy}
        data-testid="copy-button"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '4px 8px',
          fontSize: '12px',
          backgroundColor: copied ? '#28a745' : '#0366d6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 1
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <Prism data-testid="code-block" language={language} children={value || ''} />
    </div>
  )
}

export default SyntaxHighlighter
