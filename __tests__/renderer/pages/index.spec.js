import { fireEvent, render, screen } from '@testing-library/react'
import initEditor from '../../../src/renderer/config/initEditor'
import Home from '../../../src/renderer/pages'
const electron = require('electron')

describe('[PAGE]-index', () => {
  const setUp = () => render(<Home />)
  it('should render the page', () => {
    setUp()
    expect(screen.getByTestId('app')).toBeInTheDocument()
  })

  it('should not render editor if codemirror is false', () => {
    jest.mock('../../../src/renderer/pages')
    setUp()
    expect(screen.queryByTestId('editor')).not.toBeInTheDocument()
  })
})
