import React, { useState, memo } from 'react'
import { getThemeConfig } from '../config/themes'

const Tab = memo(({ tab, isActive, onTabClick, onTabClose, theme }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isCloseHovered, setIsCloseHovered] = useState(false)
  const themeConfig = getThemeConfig(theme)

  return (
    <div
      onClick={() => onTabClick(tab)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '10px 12px',
        cursor: 'pointer',
        backgroundColor: isActive ? themeConfig.ui.active : (isHovered ? themeConfig.ui.hover : 'transparent'),
        borderRight: `1px solid ${themeConfig.ui.border}`,
        borderBottom: isActive ? `2px solid ${themeConfig.editor.accent}` : `2px solid transparent`,
        display: 'inline-flex',
        alignItems: 'center',
        minWidth: '120px',
        maxWidth: '200px',
        transition: 'all 0.15s ease',
        color: isActive ? themeConfig.ui.text : themeConfig.ui.textSecondary,
        position: 'relative'
      }}
    >
      <span style={{ marginRight: '6px', fontSize: '12px', opacity: 0.7 }}>📄</span>
      <span style={{
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '13px',
        fontWeight: isActive ? '500' : '400'
      }}>
        {tab.name}
      </span>
      {tab.isDirty && (
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: themeConfig.editor.accent,
          marginLeft: '6px',
          marginRight: '2px'
        }}></span>
      )}
      <button
        onMouseEnter={() => setIsCloseHovered(true)}
        onMouseLeave={() => setIsCloseHovered(false)}
        onClick={(e) => {
          e.stopPropagation()
          onTabClose(tab)
        }}
        style={{
          marginLeft: '6px',
          background: isCloseHovered ? 'rgba(255,255,255,0.1)' : 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '2px 4px',
          color: 'inherit',
          borderRadius: '3px',
          transition: 'background-color 0.15s ease',
          lineHeight: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ×
      </button>
    </div>
  )
})

Tab.displayName = 'Tab'

const TabBar = memo(({ tabs, activeTab, onTabClick, onTabClose, theme = 'yonce' }) => {
  const themeConfig = getThemeConfig(theme)

  return (
    <div style={{
      display: 'flex',
      backgroundColor: themeConfig.ui.tabBar,
      borderBottom: `1px solid ${themeConfig.ui.border}`,
      overflowX: 'auto',
      overflowY: 'hidden',
      whiteSpace: 'nowrap',
      scrollbarWidth: 'thin',
      scrollbarColor: `${themeConfig.ui.border} transparent`
    }}>
      {tabs.map(tab => (
        <Tab
          key={tab.path}
          tab={tab}
          isActive={activeTab === tab.path}
          onTabClick={onTabClick}
          onTabClose={onTabClose}
          theme={theme}
        />
      ))}
    </div>
  )
})

TabBar.displayName = 'TabBar'

export default TabBar
