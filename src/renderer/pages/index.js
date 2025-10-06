import React, { useRef, useEffect, useCallback, useState } from 'react'
import MarkdowPreview from '../components/MarkdownPreview'
import FileTree from '../components/FileTree'
import TabBar from '../components/TabBar'
import editorOptions from '../config/editorOptions'
import useIpcEvents from '../hooks/useIpcEvents'
import { getLineNumber, onScroll, selectAll, getElement, srollToElement, downLoadDoc, exportToPNG, copyHTMLToClipboard, publishGist } from '../utils/editorHelpers'
import { SELECT_ALL, SET_EDITOR_TEXT, SET_THEME, SET_ALLOW_HTML, SAVE_CONTENT_IN_STORE } from '../constants'
import initEditor from '../config/initEditor'

const Home = () => {
  const editor = useRef(null)
  const saveTimeoutRef = useRef(null)
  const previewRef = useRef(null)

  // State
  const [content, setContent] = useState('')
  const [workspacePath, setWorkspacePath] = useState(null)
  const [tabs, setTabs] = useState([])
  const [activeTabPath, setActiveTabPath] = useState(null)
  const [showToc, setShowToc] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

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
  const debouncedSave = useCallback((path, value) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(async () => {
      if (path) {
        try {
          await window.api.fs.writeFile(path, value)
        } catch (err) {
          console.error('Failed to save file:', err)
        }
      } else {
        window.api.send(SAVE_CONTENT_IN_STORE, value)
      }
    }, 500)
  }, [])

  const onChangeHandler = (editor, data, value) => {
    setContent(value)
    debouncedSave(activeTabPath, value)

    // Update tab content
    if (activeTabPath) {
      setTabs(prev => prev.map(tab =>
        tab.path === activeTabPath ? { ...tab, content: value, isDirty: true } : tab
      ))
    }

    const lineNo = getLineNumber(editor)
    const domNode = getElement(lineNo)
    srollToElement(domNode)
  }

  // File operations
  const handleFileClick = useCallback(async (file) => {
    try {
      const fileContent = await window.api.fs.readFile(file.path)

      // Check if tab already exists
      const existingTab = tabs.find(t => t.path === file.path)
      if (existingTab) {
        setActiveTabPath(file.path)
        setContent(existingTab.content)
      } else {
        const newTab = {
          path: file.path,
          name: file.name,
          content: fileContent,
          isDirty: false
        }
        setTabs(prev => [...prev, newTab])
        setActiveTabPath(file.path)
        setContent(fileContent)
      }
    } catch (err) {
      console.error('Failed to open file:', err)
    }
  }, [tabs])

  const handleTabClick = useCallback((tab) => {
    setActiveTabPath(tab.path)
    setContent(tab.content)
  }, [])

  const handleTabClose = useCallback((tab) => {
    const newTabs = tabs.filter(t => t.path !== tab.path)
    setTabs(newTabs)

    if (activeTabPath === tab.path) {
      if (newTabs.length > 0) {
        const nextTab = newTabs[newTabs.length - 1]
        setActiveTabPath(nextTab.path)
        setContent(nextTab.content)
      } else {
        setActiveTabPath(null)
        setContent('')
      }
    }
  }, [tabs, activeTabPath])

  // Workspace handling
  const handleOpenFolder = useCallback(async () => {
    try {
      const folderPath = await window.api.fs.openFolderDialog()
      if (folderPath) {
        setWorkspacePath(folderPath)
      }
    } catch (err) {
      console.error('Failed to open folder:', err)
    }
  }, [])

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

    const handleExportPng = () => {
      if (previewRef.current) {
        exportToPNG(previewRef.current)
      }
    }

    const handleCopyHtml = () => {
      copyHTMLToClipboard()
    }

    const handlePublishGist = (_, { secret }) => {
      publishGist(content, activeTabPath, secret)
    }

    const handleToggleToc = () => {
      setShowToc(prev => !prev)
    }

    const handleOpenSettings = () => {
      setSettingsOpen(true)
    }

    loadInitialData()

    window.api.on('EXPORT_TO_HTML', downLoadDoc)
    window.api.on('EXPORT_TO_PDF', handleExportPdf)
    window.api.on('EXPORT_TO_PNG', handleExportPng)
    window.api.on('COPY_HTML_TO_CLIPBOARD', handleCopyHtml)
    window.api.on('PUBLISH_GIST', handlePublishGist)
    window.api.on('TOGGLE_TOC', handleToggleToc)
    window.api.on('OPEN_SETTINGS', handleOpenSettings)
    window.api.on('OPEN_WORKSPACE_FOLDER', handleOpenFolder)

    return () => {
      window.api.removeListener('EXPORT_TO_HTML', downLoadDoc)
      window.api.removeListener('EXPORT_TO_PDF', handleExportPdf)
      window.api.removeListener('EXPORT_TO_PNG', handleExportPng)
      window.api.removeListener('COPY_HTML_TO_CLIPBOARD', handleCopyHtml)
      window.api.removeListener('PUBLISH_GIST', handlePublishGist)
      window.api.removeListener('TOGGLE_TOC', handleToggleToc)
      window.api.removeListener('OPEN_SETTINGS', handleOpenSettings)
      window.api.removeListener('OPEN_WORKSPACE_FOLDER', handleOpenFolder)
    }
  }, [content, activeTabPath])

  const CodeMirror = initEditor()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {tabs.length > 0 && (
        <TabBar
          tabs={tabs}
          activeTab={activeTabPath}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
        />
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {workspacePath && (
          <div style={{ width: '250px', borderRight: '1px solid #ddd', overflow: 'hidden' }}>
            <FileTree workspacePath={workspacePath} onFileClick={handleFileClick} />
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: previewVisible ? 1 : 2, overflow: 'auto' }}>
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
            <div ref={previewRef} style={{ flex: 1, overflow: 'auto', borderLeft: '1px solid #ddd' }}>
              <MarkdowPreview allowHtml={allowHtml} markdown={content} showToc={showToc} />
            </div>
          )}
        </div>
      </div>

      {settingsOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            minWidth: '400px'
          }}>
            <h2>Settings</h2>
            <p>Settings UI coming soon...</p>
            <button onClick={() => setSettingsOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
