// Theme configuration for the entire app
const themeColors = {
  'yonce': {
    name: 'Yonce',
    editor: { bg: '#1C1E26', text: '#E4E4E7', accent: '#F09483' },
    ui: { bg: '#16181D', sidebar: '#1C1E26', tabBar: '#1C1E26', border: '#2D303D', hover: '#2D303D', active: '#3A3D4A', text: '#E4E4E7', textSecondary: '#9CA3AF' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  },
  'ayu-dark': {
    name: 'Ayu Dark',
    editor: { bg: '#0A0E14', text: '#B3B1AD', accent: '#FFB454' },
    ui: { bg: '#01060E', sidebar: '#0A0E14', tabBar: '#0A0E14', border: '#11151C', hover: '#11151C', active: '#1F2430', text: '#B3B1AD', textSecondary: '#5C6773' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  },
  'darcula': {
    name: 'Darcula',
    editor: { bg: '#2B2B2B', text: '#A9B7C6', accent: '#CC7832' },
    ui: { bg: '#1E1E1E', sidebar: '#2B2B2B', tabBar: '#2B2B2B', border: '#323232', hover: '#323232', active: '#3C3F41', text: '#A9B7C6', textSecondary: '#808080' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  },
  'duotone-dark': {
    name: 'Duotone Dark',
    editor: { bg: '#2a2734', text: '#6c6783', accent: '#9a86fd' },
    ui: { bg: '#1f1d27', sidebar: '#2a2734', tabBar: '#2a2734', border: '#393447', hover: '#393447', active: '#46425C', text: '#9a86fd', textSecondary: '#6c6783' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  },
  'eclipse': {
    name: 'Eclipse',
    editor: { bg: '#FFFFFF', text: '#000000', accent: '#0000C0' },
    ui: { bg: '#F5F5F5', sidebar: '#FFFFFF', tabBar: '#FFFFFF', border: '#D1D5DB', hover: '#E5E7EB', active: '#DBEAFE', text: '#1F2937', textSecondary: '#6B7280' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  },
  'elegant': {
    name: 'Elegant',
    editor: { bg: '#2F2F2F', text: '#CCCCCC', accent: '#569CD6' },
    ui: { bg: '#252526', sidebar: '#2F2F2F', tabBar: '#2F2F2F', border: '#3E3E42', hover: '#3E3E42', active: '#4D4D4D', text: '#CCCCCC', textSecondary: '#858585' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  },
  'gruvbox-dark': {
    name: 'Gruvbox Dark',
    editor: { bg: '#282828', text: '#ebdbb2', accent: '#fe8019' },
    ui: { bg: '#1d2021', sidebar: '#282828', tabBar: '#282828', border: '#3c3836', hover: '#3c3836', active: '#504945', text: '#ebdbb2', textSecondary: '#a89984' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  },
  'icecoder': {
    name: 'Icecoder',
    editor: { bg: '#1d1d1b', text: '#c0c0c0', accent: '#e1c46e' },
    ui: { bg: '#121212', sidebar: '#1d1d1b', tabBar: '#1d1d1b', border: '#2a2a28', hover: '#2a2a28', active: '#383836', text: '#c0c0c0', textSecondary: '#808080' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  },
  'idea': {
    name: 'Idea',
    editor: { bg: '#FFFFFF', text: '#000000', accent: '#00639C' },
    ui: { bg: '#F7F7F7', sidebar: '#FFFFFF', tabBar: '#FFFFFF', border: '#C5C5C5', hover: '#E8E8E8', active: '#CCE5FF', text: '#000000', textSecondary: '#808080' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  },
  'material': {
    name: 'Material',
    editor: { bg: '#263238', text: '#EEFFFF', accent: '#C3E88D' },
    ui: { bg: '#1E272C', sidebar: '#263238', tabBar: '#263238', border: '#2C3B41', hover: '#2C3B41', active: '#314549', text: '#EEFFFF', textSecondary: '#546E7A' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  },
  'monokai': {
    name: 'Monokai',
    editor: { bg: '#272822', text: '#F8F8F2', accent: '#F92672' },
    ui: { bg: '#1E1F1C', sidebar: '#272822', tabBar: '#272822', border: '#34352F', hover: '#34352F', active: '#3E3D32', text: '#F8F8F2', textSecondary: '#75715E' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  },
  'neat': {
    name: 'Neat',
    editor: { bg: '#FFFFFF', text: '#333333', accent: '#449' },
    ui: { bg: '#F9FAFB', sidebar: '#FFFFFF', tabBar: '#FFFFFF', border: '#E5E7EB', hover: '#F3F4F6', active: '#DBEAFE', text: '#1F2937', textSecondary: '#6B7280' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  },
  'neo': {
    name: 'Neo',
    editor: { bg: '#FFFFFF', text: '#2e3440', accent: '#859900' },
    ui: { bg: '#FAFAFA', sidebar: '#FFFFFF', tabBar: '#FFFFFF', border: '#E5E7EB', hover: '#F3F4F6', active: '#E0F2F1', text: '#2e3440', textSecondary: '#718096' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  },
  'base16-light': {
    name: 'Base16 Light',
    editor: { bg: '#f5f5f5', text: '#202020', accent: '#ac4142' },
    ui: { bg: '#EFEFEF', sidebar: '#f5f5f5', tabBar: '#f5f5f5', border: '#D0D0D0', hover: '#E8E8E8', active: '#D0D0D0', text: '#202020', textSecondary: '#606060' },
    preview: { bg: '#FFFFFF', text: '#1F2937' }
  }
}

export const getThemeConfig = (themeName) => {
  return themeColors[themeName] || themeColors['yonce']
}

export default themeColors
