import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { getRequests } from '../services/bucketServices'
import type { RequestData } from '../types'
import DetailPanel from './DetailPanel'

function BucketPage() {
  const { id } = useParams()
  const [requests, setRequests] = useState<RequestData[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Bumping this re-runs the fetch
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getRequests(id)
      .then((data) => {
        if (cancelled) return
        setRequests(data)
        setError(null)
      })
      .catch((err: Error) => {
        if (cancelled) return
        setError(
          err.message === 'HTTP 404'
            ? 'Bucket not found'
            : `Could not load requests: ${err.message}`,
        )
      })
    return () => {
      cancelled = true
    }
  }, [id, reloadKey])

  const selected = requests.find((r) => r.id === selectedId)

  return (
    <main>
      <h2>Bucket {id}</h2>
      <p>
        Send requests to: <code>{`${window.location.origin}/b/${id}`}</code>
      </p>
      <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
        Refresh
      </button>
      {error && <p>{error}</p>}

      {!error && requests.length === 0 && <p>No requests yet.</p>}
      {requests.length > 0 && (
        <div className="split">
          <div className="table-wrap card">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Path</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    className={
                      r.id === selectedId ? 'clickable selected' : 'clickable'
                    }
                    onClick={() => setSelectedId(r.id)}
                  >
                    <td>
                      <span className="chip">{r.method}</span>
                    </td>
                    <td>
                      {/* A real button so the row works from the keyboard */}
                      <button type="button" className="link-button">
                        <code>{r.path}</code>
                      </button>
                    </td>
                    <td className="muted">
                      {new Date(r.requestTime).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DetailPanel selected={selected} />
        </div>
      )}
    </main>
  )
}

export default BucketPage
