import { useEffect } from 'react'
import '../styles/globals.css'
import '../../../node_modules/codemirror/lib/codemirror.css'
import '../../../node_modules/codemirror/theme/yonce.css'
import '../../../node_modules/codemirror/theme/ayu-dark.css'
import '../../../node_modules/codemirror/theme/darcula.css'
import '../../../node_modules/codemirror/theme/duotone-dark.css'
import '../../../node_modules/codemirror/theme/eclipse.css'
import '../../../node_modules/codemirror/theme/elegant.css'
import '../../../node_modules/codemirror/theme/gruvbox-dark.css'
import '../../../node_modules/codemirror/theme/icecoder.css'
import '../../../node_modules/codemirror/theme/idea.css'
import '../../../node_modules/codemirror/theme/material.css'
import '../../../node_modules/codemirror/theme/monokai.css'
import '../../../node_modules/codemirror/theme/neat.css'
import '../../../node_modules/codemirror/theme/neo.css'
import '../../../node_modules/codemirror/theme/base16-light.css'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize Tauri API bridge
    if (typeof window !== 'undefined' && !window.api) {
      import('../lib/tauri-api').then(module => {
        window.api = module.default
      })
    }
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
