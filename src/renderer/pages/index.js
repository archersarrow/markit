import React, { useRef, useEffect, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import MarkdowPreview from '../components/MarkdownPreview'
import FileTree from '../components/FileTree'
import TabBar from '../components/TabBar'
import ToastContainer from '../components/Toast'
import editorOptions from '../config/editorOptions'
import useIpcEvents from '../hooks/useIpcEvents'
import { getLineNumber, onScroll, selectAll, getElement, srollToElement, downLoadDoc, exportToPNG, exportToPDF, copyHTMLToClipboard, publishGist } from '../utils/editorHelpers'
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
      const { content, theme, allowHtml, workspacePath } = await window.api.invoke('GET_GLOBALS')
      setContent(content || '')
      contentRef.current = content || ''
      setAllowHtml(allowHtml || false)
      setTheme(theme || 'yonce')
      if (workspacePath) {
        setWorkspacePath(workspacePath)
      }
      if (editor?.current) editor.current.focus()
    }

    const handleExportPdf = async (_, filePath) => {
      if (previewRef.current) {
        try {
          await exportToPDF(previewRef.current, filePath)
        } catch (err) {
          console.error('PDF export failed:', err)
        }
      }
    }

    const handleExportPng = async (_, filePath) => {
      if (previewRef.current) {
        try {
          await exportToPNG(previewRef.current, filePath)
        } catch (err) {
          console.error('PNG export failed:', err)
        }
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
      window.api.on('DO_EXPORT_PDF', handleExportPdf)
      window.api.on('DO_EXPORT_PNG', handleExportPng)
      window.api.on('COPY_HTML_TO_CLIPBOARD', handleCopyHtml)
      window.api.on('PUBLISH_GIST', handlePublishGist)
      window.api.on('TOGGLE_TOC', handleToggleToc)
      window.api.on('OPEN_SETTINGS', handleOpenSettings)
      window.api.on('OPEN_URL', async (_, url) => {
        try {
          const { open } = await import('@tauri-apps/api/shell')
          await open(url)
        } catch (e) {
          console.error('Failed to open url', url, e)
        }
      })
      window.api.on('OPEN_WORKSPACE_FOLDER', handleOpenFolder)
      window.api.on('WORKSPACE_OPENED', (_, path) => {
        console.log('Workspace opened:', path)
        setWorkspacePath(path)
      })
      // Edit menu wiring
      window.api.on('EDIT_UNDO', () => editor.current && editor.current.undo())
      window.api.on('EDIT_REDO', () => editor.current && editor.current.redo())
      window.api.on('EDIT_CUT', () => document.execCommand('cut'))
      window.api.on('EDIT_COPY', () => document.execCommand('copy'))
      window.api.on('EDIT_PASTE', () => document.execCommand('paste'))
      window.api.on('EDIT_SELECT_ALL', () => editor.current && editor.current.execCommand('selectAll'))
    }

    return () => {
      if (ipcBoundRef.current) {
        ipcBoundRef.current = false
        window.api.removeListener('EXPORT_TO_HTML', downLoadDoc)
        window.api.removeListener('DO_EXPORT_PDF', handleExportPdf)
        window.api.removeListener('DO_EXPORT_PNG', handleExportPng)
        window.api.removeListener('COPY_HTML_TO_CLIPBOARD', handleCopyHtml)
        window.api.removeListener('PUBLISH_GIST', handlePublishGist)
        window.api.removeListener('TOGGLE_TOC', handleToggleToc)
        window.api.removeListener('OPEN_SETTINGS', handleOpenSettings)
        window.api.removeListener('OPEN_WORKSPACE_FOLDER', handleOpenFolder)
        window.api.removeListener('OPEN_URL', () => {})
        window.api.removeListener('WORKSPACE_OPENED', () => {})
        window.api.removeListener('EDIT_UNDO', () => {})
        window.api.removeListener('EDIT_REDO', () => {})
        window.api.removeListener('EDIT_CUT', () => {})
        window.api.removeListener('EDIT_COPY', () => {})
        window.api.removeListener('EDIT_PASTE', () => {})
        window.api.removeListener('EDIT_SELECT_ALL', () => {})
      }
    }
  }, [])

  return (
    <>
      <ToastContainer />
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {tabs.length > 0 && (
          <TabBar
            tabs={tabs}
            activeTab={activeTabPath}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
            theme={theme}
          />
        )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {workspacePath && (
          <div style={{ width: '250px', borderRight: '1px solid #323232', overflow: 'hidden' }}>
            <FileTree workspacePath={workspacePath} onFileClick={handleFileClick} theme={theme} />
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
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '0',
            borderRadius: '12px',
            minWidth: '480px',
            maxWidth: '600px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                color: '#1F2937'
              }}>Settings</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6B7280',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px 28px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="gh-token" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  GitHub Personal Access Token
                </label>
                <input
                  id="gh-token"
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    fontFamily: 'monospace'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3B82F6'
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <div style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  marginTop: '8px',
                  lineHeight: '1.5'
                }}>
                  Used for publishing gists. You can create a token at{' '}
                  <a href="#" style={{ color: '#3B82F6', textDecoration: 'none' }}>github.com/settings/tokens</a>
                </div>
              </div>
            </div>

            <div style={{
              padding: '16px 28px',
              backgroundColor: '#F9FAFB',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              borderRadius: '0 0 12px 12px'
            }}>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#FFFFFF'}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await window.api.invoke('SET_GITHUB_TOKEN', githubToken)
                    setSettingsOpen(false)
                  } catch (e) {
                    console.error('Failed to save token', e)
                  }
                }}
                style={{
                  padding: '8px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#FFFFFF',
                  backgroundColor: '#3B82F6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3B82F6'}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}

export default Home
