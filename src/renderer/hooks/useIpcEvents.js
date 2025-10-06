import React, { useEffect, useState } from 'react'

const useIpcEvents = ({ initValue, event, callback }) => {
  const [value, setValue] = useState(initValue)
  useEffect(() => {
    const handler = callback || ((_, data) => setValue(data))

    if (window.api) {
      window.api.on(event, handler)
    }

    return () => {
      if (window.api?.removeListener) {
        window.api.removeListener(event, handler)
      }
    }
  }, [])

  return [value, setValue]
}

export default useIpcEvents
