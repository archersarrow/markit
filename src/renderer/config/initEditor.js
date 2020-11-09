const initEditor = () => {
  let CodeMirror = null
  if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
    CodeMirror = require('react-codemirror2')
    require('codemirror/mode/markdown/markdown')
    require('codemirror/mode/javascript/javascript.js')
    require('codemirror/addon/search/search.js')
    require('codemirror/addon/dialog/dialog.js')
    require('codemirror/addon/dialog/dialog.css')
    require('codemirror/addon/search/jump-to-line.js')
    require('codemirror/addon/search/match-highlighter.js')
    require('codemirror/addon/search/matchesonscrollbar.css')
    require('codemirror/addon/search/matchesonscrollbar.js')
    require('codemirror/addon/search/searchcursor.js')
  }

  return CodeMirror
}

export default initEditor
