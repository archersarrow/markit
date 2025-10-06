import React, { useRef, useEffect, useCallback } from 'react'
import MarkdowPreview from '../components/MarkdownPreview'
import editorOptions from '../config/editorOptions'
import useIpcEvents from '../hooks/useIpcEvents'
import { getLineNumber, onScroll, selectAll, getElement, srollToElement, downLoadDoc } from '../utils/editorHelpers'
import { SELECT_ALL, SET_EDITOR_TEXT, SET_THEME, SET_ALLOW_HTML, SAVE_CONTENT_IN_STORE } from '../constants'
import initEditor from '../config/initEditor'

const Home = () => {
  const editor = useRef(null)
  const saveTimeoutRef = useRef(null)
  const [content, setContent] = useIpcEvents({
    initValue: '',
    event: SET_EDITOR_TEXT
  })

  const [theme, setTheme] = useIpcEvents({
    initValue: 'yonce',
    event: SET_THEME
  })
  const [allowHtml, setAllowHtml] = useIpcEvents({
    initValue: false,
    event: SET_ALLOW_HTML
  })
  const [previewVisible, setPreviewVisible] = useIpcEvents({
    initValue: true,
    event: 'TOGGLE_PREVIEW',
    callback: () => setPreviewVisible(prev => !prev)
  })
  useIpcEvents({ event: SELECT_ALL, callback: selectAll.bind(null, editor) })

  // Debounced save function
  const debouncedSave = useCallback((value) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      window.api.send(SAVE_CONTENT_IN_STORE, value)
    }, 500)
  }, [])

  const onChangeHandler = (editor, data, value) => {
    setContent(value)
    debouncedSave(value)
    const lineNo = getLineNumber(editor)
    const domNode = getElement(lineNo)
    srollToElement(domNode)
  }

  useEffect(() => {
    const loadInitialData = async () => {
      const { content, theme, allowHtml } = await window.api.invoke('GET_GLOBALS')
      setContent(content || '')
      setAllowHtml(allowHtml || false)
      setTheme(theme || 'yonce')
      if (editor?.current) editor.current.focus()
    }

    const handleExportPdf = () => {
      window.api.send('EXPORT_TO_PDF')
    }

    loadInitialData()
    window.api.on('EXPORT_TO_HTML', downLoadDoc)
    window.api.on('EXPORT_TO_PDF', handleExportPdf)

    return () => {
      window.api.removeListener('EXPORT_TO_HTML', downLoadDoc)
      window.api.removeListener('EXPORT_TO_PDF', handleExportPdf)
    }
  }, [])

  const CodeMirror = initEditor()
  return (
    <div className="layout" data-testid="app">
      <div className="editor">
        {CodeMirror && (
          <CodeMirror.Controlled
            editorDidMount={e => (editor.current = e)}
            value={content}
            options={editorOptions(theme)}
            onBeforeChange={onChangeHandler}
            onChange={onChangeHandler}
            onScroll={onScroll}
          />
        )}
      </div>
      {previewVisible && (
        <div className="preview">
          <MarkdowPreview allowHtml={allowHtml} markdown={content} />
        </div>
      )}
    </div>
  )
}

export default Home
