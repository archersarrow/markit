import React from 'react'
import { Prism } from 'react-syntax-highlighter'

const SyntaxHighlighter = ({ language, value }) => (
  <Prism data-testid="code-block" language={language} children={value || ''} />
)

export default SyntaxHighlighter
