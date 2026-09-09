import { useEffect, useState } from 'react'
import { getServiceHealth } from '../api/articleApi.js'

export default function useServiceHealth() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true

    function updateHealth() {
      getServiceHealth()
        .then(() => {
          if (active) setStatus('online')
        })
        .catch(() => {
          if (active) setStatus('offline')
        })
    }

    updateHealth()
    const interval = window.setInterval(updateHealth, 30000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  return status
}
