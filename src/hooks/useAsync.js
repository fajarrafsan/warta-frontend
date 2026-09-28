import { useCallback, useEffect, useState } from 'react'

// useAsync menjalankan load setiap kali deps berubah atau refresh dipanggil.
// Data lama tetap ditampilkan selama data baru dimuat, sehingga halaman tidak
// berkedip saat berpindah tab atau halaman.
export default function useAsync(load, deps) {
  const [version, setVersion] = useState(0)
  const key = JSON.stringify([...deps, version])
  const [result, setResult] = useState({ key: null, data: undefined, error: null })

  useEffect(() => {
    let active = true

    load().then(
      (data) => {
        if (active) setResult({ key, data, error: null })
      },
      (error) => {
        if (active) setResult((current) => ({ key, data: current.data, error }))
      },
    )

    return () => {
      active = false
    }
    // load sengaja tidak ikut deps: pemanggil menyebutkan nilai yang dipakainya.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const refresh = useCallback(() => setVersion((current) => current + 1), [])
  const loading = result.key !== key

  return {
    data: result.data,
    error: loading ? null : result.error,
    loading,
    refresh,
  }
}
