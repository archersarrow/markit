import { render, screen } from '@testing-library/react'
import MarkdownPreview from '../../../src/renderer/components/MarkdownPreview'
import ReactMarkdown from 'react-markdown'

jest.mock('react-markdown', () => props => (
  <div>
    {Object.keys(props).map((key, index) => (
      <span key={key}>{`${key}:${JSON.stringify(props[key])}`}</span>
    ))}
  </div>
))

describe('[COMPONENT] - MarkdownPreview', () => {
  const setUp = (props = {}) => render(<MarkdownPreview {...props} />)

  it('should render MarkdownPreview component', () => {
    setUp()
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
  })

  it('should render markdown content', () => {
    const markdown = '::MARKDOWN_CONTENT::'
    setUp({ markdown })
    expect(screen.getAllByText(`children:"${markdown}"`)).toBeTruthy()
  })

  it('should render HTML when allowHtml is true', () => {
    const markdown = '<span>::MARKDOWN_CONTENT::</span>'
    const allowHtml = true
    setUp({ markdown, allowHtml })
    expect(screen.getAllByText('allowDangerousHtml:true')).toBeTruthy()
  })
})
