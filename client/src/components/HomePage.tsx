import { useState } from 'react'
import { Link } from 'react-router'
import { createBucket } from '../services/bucketServices'

function HomePage() {
  const [bucketId, setBucketId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCreateBucket() {
    setError(null)
    try {
      const bucket = await createBucket()
      setBucketId(bucket.id)
    } catch (err) {
      setError(`Could not create bucket: ${(err as Error).message}`)
    }
  }

  return (
    <main>
      <button type="button" onClick={handleCreateBucket}>
        Create bucket
      </button>
      {error && <p>{error}</p>}
      {bucketId && (
        <p>
          Send requests to: <code>{`${window.location.origin}/b/${bucketId}`}</code>{' '}
          <Link to={`/buckets/${bucketId}`}>View bucket</Link>
        </p>
      )}
    </main>
  )
}

export default HomePage
