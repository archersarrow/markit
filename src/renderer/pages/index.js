import React, { useRef, useEffect } from 'react'
import MarkdowPreview from '../components/MarkdownPreview'
import editorOptions from '../config/editorOptions'
import useIpcEvents from '../hooks/useIpcEvents'
import { getLineNumber, onScroll, selectAll, getElement, srollToElement, downLoadDoc } from '../utils/editorHelpers'
import { SELECT_ALL, SET_EDITOR_TEXT, SET_THEME, SET_ALLOW_HTML, SAVE_CONTENT_IN_STORE } from '../constants'
import initEditor from '../config/initEditor'

const { ipcRenderer, remote } = require('electron')

const Home = () => {
  const editor = useRef(null)
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
  useIpcEvents({ event: SELECT_ALL, callback: selectAll.bind(null, editor) })

  const onChangeHandler = (editor, data, value) => {
    setContent(value)
    ipcRenderer.send(SAVE_CONTENT_IN_STORE, content)
    const lineNo = getLineNumber(editor)
    const domNode = getElement(lineNo)
    srollToElement(domNode)
  }

  useEffect(() => {
    const { getGlobal } = remote
    setContent(getGlobal('content') || '')
    setAllowHtml(getGlobal('allowHtml') || false)
    setTheme(getGlobal('theme') || 'yonce')
    if (editor?.current) editor.current.focus()

    ipcRenderer.on('EXPORT_TO_HTML', downLoadDoc)
    ipcRenderer.on('message', (e, d) => alert(d))
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
      <div className="preview">
        <MarkdowPreview allowHtml={allowHtml} markdown={content} />
      </div>
    </div>
  )
}

export default Home
