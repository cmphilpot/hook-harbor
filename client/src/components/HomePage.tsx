import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
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
  const navigate = useNavigate()

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
        + Create bucket
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
          <div className="table-wrap card">
            <table>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Created</th>
                  <th className="actions">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {savedBuckets.map((b) => (
                  <tr
                    key={b.id}
                    className="clickable"
                    onClick={() => navigate(`/buckets/${b.id}`)}
                  >
                    <td>
                      <Link to={`/buckets/${b.id}`}>
                        <code>{b.id}</code>
                      </Link>
                    </td>
                    <td className="muted">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
                    <td className="actions">
                      {/* Removes it from this browser's list only */}
                      <button
                        type="button"
                        className="text-danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(b.id)
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  )
}

export default HomePage
