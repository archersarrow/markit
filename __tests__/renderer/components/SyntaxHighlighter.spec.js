import { render, screen } from '@testing-library/react'
import SyntaxHighlighter from '../../../src/renderer/components/SyntaxHighlighter'

describe('[COMPONENT] - SyntaxHighlighter', () => {
  it('should render Prism with language and value props', () => {
    const props = {
      language: 'javascript',
      children: 'var'
    }
    render(<SyntaxHighlighter {...props} />)
    expect(screen.getByTestId('code-block')).toBeInTheDocument()
  })
})
