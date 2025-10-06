import React, { useState, useEffect } from 'react'

const FileTreeNode = ({ item, level, onFileClick, expandedDirs, toggleDir }) => {
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

  return (
    <div>
      <div
        onClick={handleClick}
        style={{
          paddingLeft: `${level * 16}px`,
          padding: '4px 8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          fontSize: '13px',
          userSelect: 'none'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {item.isDirectory && (
          <span style={{ marginRight: '4px' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        <span>{item.name}</span>
      </div>
      {item.isDirectory && isExpanded && children.map(child => (
        <FileTreeNode
          key={child.path}
          item={child}
          level={level + 1}
          onFileClick={onFileClick}
          expandedDirs={expandedDirs}
          toggleDir={toggleDir}
        />
      ))}
    </div>
  )
}

const FileTree = ({ workspacePath, onFileClick }) => {
  const [files, setFiles] = useState([])
  const [expandedDirs, setExpandedDirs] = useState({})

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
      <div style={{ padding: '16px', color: '#666', fontSize: '13px' }}>
        No workspace opened. Use File → Open Folder...
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflow: 'auto', backgroundColor: '#fafafa' }}>
      {files.map(file => (
        <FileTreeNode
          key={file.path}
          item={file}
          level={0}
          onFileClick={onFileClick}
          expandedDirs={expandedDirs}
          toggleDir={toggleDir}
        />
      ))}
    </div>
  )
}

export default FileTree
