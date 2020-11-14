import { render, screen } from '@testing-library/react'
import MyApp from '../../../src/renderer/pages/_app'

describe('[PAGE] - MyApp', () => {
  const mockComponent = props => <div {...props}>::COMPONENT::</div>
  const pageProps = {
    'data-testid': 'mock-component'
  }
  const setUp = props => render(<MyApp {...props} Component={mockComponent} pageProps={pageProps} />)
  it('Should render Component with pageprops', () => {
    setUp()
    expect(screen.getByTestId('mock-component')).toBeInTheDocument()
    expect(screen.getByText('::COMPONENT::')).toBeInTheDocument()
  })
})
