const getLineNumber = editor => editor.getCursor().line

const getElement = (srtLineNo, endLineNo) => {
  if ((endLineNo && srtLineNo > endLineNo) || !srtLineNo) return null
  const elem = document.querySelector(`[data-sourcepos^='${srtLineNo}:1']`)
  if (!elem) return getElement(srtLineNo - 1, endLineNo)
  return elem
}

const srollToElement = (elmnt, behavior = 'auto') => {
  if (elmnt) elmnt.scrollIntoView({ behavior })
}

const onScroll = editor => {
  var rect = editor.getWrapperElement().getBoundingClientRect()
  var topVisibleLine = editor.lineAtHeight(rect.top, 'window')
  var bottomVisibleLine = editor.lineAtHeight(rect.bottom, 'window')
  const domNode = getElement(topVisibleLine + 1, bottomVisibleLine)
  if (domNode) srollToElement(domNode)
}

const selectAll = editor => editor.current.execCommand('selectAll')

const downLoadDoc = () => {
  const obj = document.querySelector('[data-testid="markdown-preview"]')

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Markdown</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #fff;
    }
    .markdown-body {
      word-wrap: break-word;
    }
    .markdown-body h1, .markdown-body h2 {
      border-bottom: 1px solid #eaecef;
      padding-bottom: 0.3em;
    }
    .markdown-body h1 {
      font-size: 2em;
      margin: 0.67em 0;
    }
    .markdown-body h2 {
      font-size: 1.5em;
      margin: 0.75em 0;
    }
    .markdown-body h3 {
      font-size: 1.25em;
      margin: 1em 0;
    }
    .markdown-body code {
      background-color: rgba(27, 31, 35, 0.05);
      border-radius: 3px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 85%;
      margin: 0;
      padding: 0.2em 0.4em;
    }
    .markdown-body pre {
      background-color: #f6f8fa;
      border-radius: 3px;
      font-size: 85%;
      line-height: 1.45;
      overflow: auto;
      padding: 16px;
    }
    .markdown-body pre code {
      background-color: transparent;
      border: 0;
      display: inline;
      line-height: inherit;
      margin: 0;
      overflow: visible;
      padding: 0;
      word-wrap: normal;
    }
    .markdown-body blockquote {
      border-left: 4px solid #dfe2e5;
      color: #6a737d;
      padding: 0 1em;
      margin: 0;
    }
    .markdown-body table {
      border-collapse: collapse;
      width: 100%;
    }
    .markdown-body table th, .markdown-body table td {
      border: 1px solid #dfe2e5;
      padding: 6px 13px;
    }
    .markdown-body table tr:nth-child(2n) {
      background-color: #f6f8fa;
    }
    .markdown-body img {
      max-width: 100%;
      box-sizing: border-box;
    }
    .markdown-body a {
      color: #0366d6;
      text-decoration: none;
    }
    .markdown-body a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  ${obj.innerHTML}
</body>
</html>`

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.body.appendChild(document.createElement('a'))
  a.download = 'export.html'
  a.href = url
  a.click()
  URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

const exportToPNG = async (previewElement) => {
  try {
    const { toPng } = await import('html-to-image')
    const dataUrl = await toPng(previewElement, {
      quality: 0.95,
      pixelRatio: 2
    })

    const link = document.createElement('a')
    link.download = 'export.png'
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('Failed to export PNG:', error)
  }
}

const copyHTMLToClipboard = () => {
  const obj = document.querySelector('[data-testid="markdown-preview"]')
  if (obj && navigator.clipboard) {
    navigator.clipboard.writeText(obj.innerHTML)
      .then(() => console.log('HTML copied to clipboard'))
      .catch(err => console.error('Failed to copy HTML:', err))
  }
}

const publishGist = async (content, filename, isSecret) => {
  try {
    const token = prompt('Enter your GitHub Personal Access Token:')
    if (!token) return

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'Markdown document from MarkIt',
        public: !isSecret,
        files: {
          [filename || 'document.md']: {
            content: content
          }
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      const url = data.html_url
      alert(`Gist published successfully!\n\n${url}`)

      // Copy URL to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      }
    } else {
      alert('Failed to publish Gist. Please check your token.')
    }
  } catch (error) {
    console.error('Failed to publish Gist:', error)
    alert('Failed to publish Gist: ' + error.message)
  }
}

export { getElement, getLineNumber, srollToElement, onScroll, selectAll, downLoadDoc, exportToPNG, copyHTMLToClipboard, publishGist }
