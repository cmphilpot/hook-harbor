import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { createBucket } from '../services/bucketServices'
import {
  getSavedBuckets,
  removeBucket,
  saveBucket,
} from '../services/savedBuckets'

function HomePage() {
  const [savedBuckets, setSavedBuckets] = useState(getSavedBuckets)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Saves the new bucket to this browser's list, then opens its page
  async function handleCreateBucket() {
    setError(null)
    try {
      const bucket = await createBucket()
      saveBucket(bucket)
      navigate(`/piers/${bucket.id}`)
    } catch (err) {
      setError(`Could not create pier: ${(err as Error).message}`)
    }
  }

  function handleRemove(id: string) {
    removeBucket(id)
    setSavedBuckets(getSavedBuckets())
  }

  const createButton = (
    <button type="button" onClick={handleCreateBucket}>
      + Create pier
    </button>
  )

  return (
    <main>
      {error && <p>{error}</p>}

      {savedBuckets.length === 0 ? (
        // The only Create button while there are no buckets
        <section className="empty-state">
          <h2>No piers yet</h2>
          <p>
            Create a pier to get a capture URL, then point any HTTP client at
            it.
          </p>
          {createButton}
        </section>
      ) : (
        <section>
          {/* Title and description on the left, Create button on the right */}
          <div className="section-header">
            <div>
              <h2>Your piers</h2>
              <p className="section-description">
                Each pier is a URL that captures every request sent to it.
              </p>
            </div>
            {createButton}
          </div>
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
                    onClick={() => navigate(`/piers/${b.id}`)}
                  >
                    <td>
                      <Link to={`/piers/${b.id}`}>
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
