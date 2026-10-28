import { useEffect, useState } from 'react'
import { createBucket } from './services/bucketServices'

function App() {
  const [status, setStatus] = useState('checking...')
  const [bucketId, setBucketId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('server unreachable'))
  }, [])

  async function handleCreateBucket() {
    setError(null)
    try {
      const bucket = await createBucket()
      setBucketId(bucket.id)
    } catch (err) {
      setError(`Could not create bucket: ${(err as Error).message}`)
    }
  }

  const captureUrl = bucketId && `${window.location.origin}/b/${bucketId}`

  return (
    <main>
      <h1>Hook Haven</h1>
      <p>Server status: {status}</p>
      <button type="button" onClick={handleCreateBucket}>
        Create bucket
      </button>
      {error && <p>{error}</p>}
      {captureUrl && (
        <p>
          Send requests to: <code>{captureUrl}</code>
        </p>
      )}
    </main>
  )
}

export default App
