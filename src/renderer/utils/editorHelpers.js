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
  const a = document.body.appendChild(document.createElement('a'))
  a.download = 'export.html'
  a.href = 'data:text/html,' + obj.innerHTML
  a.click()
}

export { getElement, getLineNumber, srollToElement, onScroll, selectAll, downLoadDoc }
