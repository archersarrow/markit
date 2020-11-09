import React from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import SyntaxHighlighter from './SyntaxHighlighter'

export default ({ markdown, allowHtml }) => {
  const renderers = {
    code: SyntaxHighlighter
  }

  return (
    <div className="markdown-body" data-testid={'markdown-preview'}>
      <ReactMarkdown
        sourcePos={true}
        rawSourcePos={true}
        plugins={[gfm]}
        allowDangerousHtml={allowHtml}
        renderers={renderers}
        children={markdown}
      />
    </div>
  )
}
