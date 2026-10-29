import { useState } from 'react'
import { Link } from 'react-router'
import { createBucket } from '../services/bucketServices'
import {
  getSavedBuckets,
  removeBucket,
  saveBucket,
} from '../services/savedBuckets'

function HomePage() {
  const [bucketId, setBucketId] = useState<string | null>(null)
  const [savedBuckets, setSavedBuckets] = useState(getSavedBuckets)
  const [error, setError] = useState<string | null>(null)

  async function handleCreateBucket() {
    setError(null)
    try {
      const bucket = await createBucket()
      saveBucket(bucket)
      setSavedBuckets(getSavedBuckets())
      setBucketId(bucket.id)
    } catch (err) {
      setError(`Could not create bucket: ${(err as Error).message}`)
    }
  }

  function handleRemove(id: string) {
    removeBucket(id)
    setSavedBuckets(getSavedBuckets())
    if (id === bucketId) setBucketId(null)
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

      {savedBuckets.length > 0 && (
        <section>
          <h2>Your buckets</h2>
          <ul>
            {savedBuckets.map((b) => (
              <li key={b.id}>
                <Link to={`/buckets/${b.id}`}>{b.id}</Link>{' '}
                <small>created {new Date(b.createdAt).toLocaleString()}</small>{' '}
                <button type="button" onClick={() => handleRemove(b.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}

export default HomePage
