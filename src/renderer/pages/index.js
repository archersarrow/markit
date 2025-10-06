import React, { useRef, useEffect, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import MarkdowPreview from '../components/MarkdownPreview'
import FileTree from '../components/FileTree'
import TabBar from '../components/TabBar'
import editorOptions from '../config/editorOptions'
import useIpcEvents from '../hooks/useIpcEvents'
import { getLineNumber, onScroll, selectAll, getElement, srollToElement, downLoadDoc, exportToPNG, copyHTMLToClipboard, publishGist } from '../utils/editorHelpers'
import { SELECT_ALL, SET_EDITOR_TEXT, SET_THEME, SET_ALLOW_HTML, SAVE_CONTENT_IN_STORE } from '../constants'
// Client-only CodeMirror to avoid SSR hydration mismatch
const CodeMirrorControlled = dynamic(async () => {
  const mod = await import('react-codemirror2')
  await import('codemirror/mode/markdown/markdown')
  await import('codemirror/mode/javascript/javascript.js')
  await import('codemirror/addon/search/search.js')
  await import('codemirror/addon/dialog/dialog.js')
  await import('codemirror/addon/dialog/dialog.css')
  await import('codemirror/addon/search/jump-to-line.js')
  await import('codemirror/addon/search/match-highlighter.js')
  await import('codemirror/addon/search/matchesonscrollbar.css')
  await import('codemirror/addon/search/matchesonscrollbar.js')
  await import('codemirror/addon/search/searchcursor.js')
  return mod.Controlled
}, { ssr: false })

const Home = () => {
  const editor = useRef(null)
  const saveTimeoutRef = useRef(null)
  const previewRef = useRef(null)
  const contentRef = useRef('')
  const activeTabPathRef = useRef(null)
  const openFolderInProgressRef = useRef(false)
  const ipcBoundRef = useRef(false)

  // State
  const [content, setContent] = useState('')
  const [workspacePath, setWorkspacePath] = useState(null)
  const [tabs, setTabs] = useState([])
  const [activeTabPath, setActiveTabPath] = useState(null)
  const [showToc, setShowToc] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [githubToken, setGithubToken] = useState('')

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
    contentRef.current = value
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
        activeTabPathRef.current = file.path
        setContent(fileContent)
        contentRef.current = fileContent
      }
    } catch (err) {
      console.error('Failed to open file:', err)
    }
  }, [tabs])

  const handleTabClick = useCallback((tab) => {
    setActiveTabPath(tab.path)
    activeTabPathRef.current = tab.path
    setContent(tab.content)
    contentRef.current = tab.content
  }, [])

  const handleTabClose = useCallback((tab) => {
    const newTabs = tabs.filter(t => t.path !== tab.path)
    setTabs(newTabs)

    if (activeTabPath === tab.path) {
      if (newTabs.length > 0) {
        const nextTab = newTabs[newTabs.length - 1]
        setActiveTabPath(nextTab.path)
        activeTabPathRef.current = nextTab.path
        setContent(nextTab.content)
        contentRef.current = nextTab.content
      } else {
        setActiveTabPath(null)
        activeTabPathRef.current = null
        setContent('')
        contentRef.current = ''
      }
    }
  }, [tabs, activeTabPath])

  // Workspace handling
  const handleOpenFolder = useCallback(async () => {
    if (openFolderInProgressRef.current) return
    openFolderInProgressRef.current = true
    try {
      const folderPath = await window.api.fs.openFolderDialog()
      if (folderPath) {
        setWorkspacePath(folderPath)
      }
    } catch (err) {
      console.error('Failed to open folder:', err)
    } finally {
      openFolderInProgressRef.current = false
    }
  }, [])

  useEffect(() => {
    const loadInitialData = async () => {
      const { content, theme, allowHtml } = await window.api.invoke('GET_GLOBALS')
      setContent(content || '')
      contentRef.current = content || ''
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
      publishGist(contentRef.current, activeTabPathRef.current, secret)
    }

    const handleToggleToc = () => {
      setShowToc(prev => !prev)
    }

    const handleOpenSettings = async () => {
      setSettingsOpen(true)
      try {
        const token = await window.api.invoke('GET_GITHUB_TOKEN')
        setGithubToken(token || '')
      } catch (e) {
        console.error('Failed to load token', e)
      }
    }

    loadInitialData()

    // Guard against double-binding in React StrictMode dev
    if (!ipcBoundRef.current) {
      ipcBoundRef.current = true
      window.api.on('EXPORT_TO_HTML', downLoadDoc)
      window.api.on('EXPORT_TO_PDF', handleExportPdf)
      window.api.on('EXPORT_TO_PNG', handleExportPng)
      window.api.on('COPY_HTML_TO_CLIPBOARD', handleCopyHtml)
      window.api.on('PUBLISH_GIST', handlePublishGist)
      window.api.on('TOGGLE_TOC', handleToggleToc)
      window.api.on('OPEN_SETTINGS', handleOpenSettings)
      window.api.on('OPEN_WORKSPACE_FOLDER', handleOpenFolder)
      window.api.on('WORKSPACE_OPENED', (_, path) => setWorkspacePath(path))
    }

    return () => {
      if (ipcBoundRef.current) {
        ipcBoundRef.current = false
        window.api.removeListener('EXPORT_TO_HTML', downLoadDoc)
        window.api.removeListener('EXPORT_TO_PDF', handleExportPdf)
        window.api.removeListener('EXPORT_TO_PNG', handleExportPng)
        window.api.removeListener('COPY_HTML_TO_CLIPBOARD', handleCopyHtml)
        window.api.removeListener('PUBLISH_GIST', handlePublishGist)
        window.api.removeListener('TOGGLE_TOC', handleToggleToc)
        window.api.removeListener('OPEN_SETTINGS', handleOpenSettings)
        window.api.removeListener('OPEN_WORKSPACE_FOLDER', handleOpenFolder)
        window.api.removeListener('WORKSPACE_OPENED', () => {})
      }
    }
  }, [])

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
            <CodeMirrorControlled
              editorDidMount={e => (editor.current = e)}
              value={content}
              options={editorOptions(theme)}
              onBeforeChange={onChangeHandler}
              onScroll={onScroll}
            />
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
            <div style={{ margin: '12px 0' }}>
              <label htmlFor="gh-token" style={{ display: 'block', fontSize: 12, color: '#555' }}>GitHub Personal Access Token</label>
              <input
                id="gh-token"
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_..."
                style={{ width: '100%', padding: '8px', marginTop: 6 }}
              />
              <div style={{ fontSize: 12, color: '#777', marginTop: 6 }}>Used for publishing gists.</div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setSettingsOpen(false)}>Cancel</button>
              <button onClick={async () => {
                try {
                  await window.api.invoke('SET_GITHUB_TOKEN', githubToken)
                  setSettingsOpen(false)
                } catch (e) {
                  console.error('Failed to save token', e)
                }
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
