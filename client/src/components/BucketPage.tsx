import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { getRequests } from '../services/bucketServices'
import type { RequestData } from '../types'
import RequestDetail from './RequestDetail'

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
      <ul>
        {requests.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => setSelectedId(r.id)}>
              <strong>{r.method}</strong> {r.path}{' '}
              <small>{new Date(r.requestTime).toLocaleString()}</small>
            </button>
          </li>
        ))}
      </ul>

      {selected && <RequestDetail request={selected} />}
    </main>
  )
}

export default BucketPage
