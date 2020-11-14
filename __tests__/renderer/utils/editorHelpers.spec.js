const editorUtils = require('../../../src/renderer/utils/editorHelpers')

import { render } from '@testing-library/react'

describe('[UTILS] - Editor Helpers', () => {
  const { getLineNumber, getElement, srollToElement, onScroll, selectAll, downLoadDoc } = editorUtils

  describe('[Function] - getLineNumber', () => {
    const editor = {
      getCursor: () => ({ line: '::LINE_NUMBER::' })
    }
    it('should return cursor line number', () => {
      const lineNumber = getLineNumber(editor)
      expect(lineNumber).toBe('::LINE_NUMBER::')
    })
  })

  describe('[Function] - getElement', () => {
    const setUp = () =>
      render(
        <div>
          <span data-sourcepos="1:1"></span>
          <span data-sourcepos="2:1"></span>
          <span data-sourcepos="4:1"></span>
        </div>
      )
    it('should return null if srtLineNo is zero or null or startLino > endLineNo', () => {
      setUp()
      let ele = getElement()
      expect(ele).toBeNull()
      ele = getElement(0)
      expect(ele).toBeNull()
      ele = getElement(4, 1)
      expect(ele).toBeNull()
    })

    it('should return the dom element whose "data-sourcepos" attribute start with starLineNo ', () => {
      setUp()
      const ele = getElement(1, 3)
      expect(ele.getAttribute('data-sourcepos')).toBe('1:1')
    })

    it('should return the dom element whose "data-sourcepos" attribute near to starLineNo', () => {
      setUp()
      const ele = getElement(3)
      expect(ele.getAttribute('data-sourcepos')).toBe('2:1')
    })
  })

  describe('[Function] - srollToElement', () => {
    it('should call scrollIntoView function with behavior', () => {
      const elem = {
        scrollIntoView: jest.fn()
      }
      srollToElement(elem, '::BEHAVIOR::')

      expect(elem.scrollIntoView).toBeCalledWith({ behavior: '::BEHAVIOR::' })
    })
  })

  describe('[Function] - selectAll', () => {
    it('should call execCommand method with selectall argument', () => {
      const editor = {
        current: {
          execCommand: jest.fn()
        }
      }
      selectAll(editor)
      expect(editor.current.execCommand).toBeCalledWith('selectAll')
    })
  })

  describe('[Function] - downLoadDoc', () => {
    const setUp = () => render(<div data-testid="markdown-preview">::PREVIEW::</div>)
    it('should download markdown preview content in html using anchor tag click method', () => {
      setUp()
      const click = jest.fn()
      document.createElement = jest.fn()
      document.body.appendChild = () => ({
        click
      })

      downLoadDoc()

      expect(click).toBeCalled()
    })
  })

  describe('[Function] - onScroll', () => {
    const lineAtHeight = jest.fn()

    const editor = {
      getWrapperElement: () => ({
        getBoundingClientRect: () => ({
          top: '::TOP::',
          bottom: '::BOTTOM::'
        })
      }),
      lineAtHeight
    }

    onScroll(editor)

    expect(lineAtHeight).toHaveBeenCalledWith('::TOP::', 'window')
    expect(lineAtHeight).toHaveBeenCalledWith('::BOTTOM::', 'window')
  })
})
