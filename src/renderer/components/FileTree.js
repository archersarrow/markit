import React, { useState, useEffect, memo } from 'react'
import { getThemeConfig } from '../config/themes'

const FileTreeNode = memo(({ item, level, onFileClick, expandedDirs, toggleDir, theme }) => {
  const themeConfig = getThemeConfig(theme)
  const isExpanded = expandedDirs[item.path]
  const [children, setChildren] = useState([])

  useEffect(() => {
    if (item.isDirectory && isExpanded && children.length === 0) {
      window.api.fs.listDir(item.path).then(entries => {
        // Filter to only show .md files and directories
        const filtered = entries.filter(e =>
          e.isDirectory || e.extension === '.md' || e.extension === '.markdown'
        )
        setChildren(filtered.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1
          if (!a.isDirectory && b.isDirectory) return 1
          return a.name.localeCompare(b.name)
        }))
      }).catch(err => console.error('Failed to list directory:', err))
    }
  }, [item.path, item.isDirectory, isExpanded])

  const handleClick = () => {
    if (item.isDirectory) {
      toggleDir(item.path)
    } else {
      onFileClick(item)
    }
  }

  const [isHovered, setIsHovered] = useState(false)

  return (
    <div>
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          paddingLeft: `${12 + level * 16}px`,
          paddingRight: '12px',
          paddingTop: '6px',
          paddingBottom: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          fontSize: '13px',
          userSelect: 'none',
          color: themeConfig.ui.text,
          backgroundColor: isHovered ? themeConfig.ui.hover : 'transparent',
          transition: 'background-color 0.15s ease, color 0.15s ease',
          borderRadius: '4px',
          margin: '1px 6px'
        }}
      >
        {item.isDirectory && (
          <span style={{
            marginRight: '6px',
            fontSize: '10px',
            color: themeConfig.ui.textSecondary,
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            display: 'inline-block'
          }}>
            ▶
          </span>
        )}
        {!item.isDirectory && (
          <span style={{ marginRight: '6px', fontSize: '12px', opacity: 0.6 }}>📄</span>
        )}
        {item.isDirectory && (
          <span style={{ marginRight: '6px', fontSize: '12px' }}>{isExpanded ? '📂' : '📁'}</span>
        )}
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: item.isDirectory ? '500' : '400'
        }}>
          {item.name}
        </span>
      </div>
      {item.isDirectory && isExpanded && children.map(child => (
        <FileTreeNode
          key={child.path}
          item={child}
          level={level + 1}
          onFileClick={onFileClick}
          expandedDirs={expandedDirs}
          toggleDir={toggleDir}
          theme={theme}
        />
      ))}
    </div>
  )
})

FileTreeNode.displayName = 'FileTreeNode'

const FileTree = memo(({ workspacePath, onFileClick, theme = 'yonce' }) => {
  const [files, setFiles] = useState([])
  const [expandedDirs, setExpandedDirs] = useState({})
  const themeConfig = getThemeConfig(theme)

  useEffect(() => {
    if (workspacePath) {
      window.api.fs.listDir(workspacePath).then(entries => {
        const filtered = entries.filter(e =>
          e.isDirectory || e.extension === '.md' || e.extension === '.markdown'
        )
        setFiles(filtered.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1
          if (!a.isDirectory && b.isDirectory) return 1
          return a.name.localeCompare(b.name)
        }))
        // Auto-expand root
        setExpandedDirs({ [workspacePath]: true })
      }).catch(err => console.error('Failed to load workspace:', err))
    }
  }, [workspacePath])

  const toggleDir = (path) => {
    setExpandedDirs(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  if (!workspacePath) {
    return (
      <div style={{
        padding: '20px 16px',
        color: themeConfig.ui.textSecondary,
        fontSize: '13px',
        textAlign: 'center',
        lineHeight: '1.5'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>📁</div>
        <div style={{ fontWeight: '500', marginBottom: '4px' }}>No Workspace</div>
        <div style={{ fontSize: '12px' }}>Use File → Open Folder...</div>
      </div>
    )
  }

  return (
    <div style={{
      height: '100%',
      overflow: 'auto',
      backgroundColor: themeConfig.ui.sidebar,
      padding: '8px 0'
    }}>
      <div style={{
        padding: '8px 12px 12px 12px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: themeConfig.ui.textSecondary,
        borderBottom: `1px solid ${themeConfig.ui.border}`
      }}>
        Explorer
      </div>
      <div style={{ paddingTop: '8px' }}>
        {files.map(file => (
          <FileTreeNode
            key={file.path}
            item={file}
            level={0}
            onFileClick={onFileClick}
            expandedDirs={expandedDirs}
            toggleDir={toggleDir}
            theme={theme}
          />
        ))}
      </div>
    </div>
  )
})

FileTree.displayName = 'FileTree'

export default FileTree
