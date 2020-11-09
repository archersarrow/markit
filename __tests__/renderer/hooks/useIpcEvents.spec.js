import { renderHook } from '@testing-library/react-hooks'
import useIpcEvents from '../../../src/renderer/hooks/useIpcEvents'

import { ipcRenderer } from 'electron'

jest.mock('electron', () => {
  return {
    ipcRenderer: {
      on: jest.fn()
    }
  }
})

describe('[HOOKS] - useIpcEvents', () => {
  const setUp = (props = {}) => renderHook(() => useIpcEvents({ ...props }))
  it('should set initValue', () => {
    const { result } = setUp({ initValue: '::INITIAL_VALUE::' })
    expect(result.current[0]).toBe('::INITIAL_VALUE::')
  })

  it('should call ipcRenderer event', () => {
    const { result } = setUp({
      initValue: '::INITIAL_VALUE::',
      event: '::EVENT::'
    })
    expect(ipcRenderer.on).toHaveBeenCalledWith('::EVENT::', expect.any(Function))
  })
})
