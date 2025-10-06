import React from 'react'

const TabBar = ({ tabs, activeTab, onTabClick, onTabClose }) => {
  return (
    <div style={{
      display: 'flex',
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #ddd',
      overflowX: 'auto',
      whiteSpace: 'nowrap'
    }}>
      {tabs.map(tab => (
        <div
          key={tab.path}
          onClick={() => onTabClick(tab)}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            backgroundColor: activeTab === tab.path ? '#fff' : 'transparent',
            borderBottom: activeTab === tab.path ? '2px solid #0366d6' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            minWidth: '120px',
            maxWidth: '200px'
          }}
        >
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13px' }}>
            {tab.name}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTabClose(tab)
            }}
            style={{
              marginLeft: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0 4px'
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default TabBar
