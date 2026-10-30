import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getRequests } from '../services/bucketServices'
import { getSavedBuckets } from '../services/savedBuckets'
import type { RequestData } from '../types'
import RequestDetail from './RequestDetail'

type Row = RequestData & { bucketId: string }

// Every request across this browser's saved buckets, newest first
function RequestsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  // Bumping this re-runs the fetch
  const [reloadKey, setReloadKey] = useState(0)
  const hasSavedBuckets = getSavedBuckets().length > 0

  useEffect(() => {
    let cancelled = false
    Promise.all(
      getSavedBuckets().map((b) =>
        getRequests(b.id)
          .then((requests) => requests.map((r) => ({ ...r, bucketId: b.id })))
          // A bucket the server no longer has (e.g. after a restart) is skipped
          .catch(() => [] as Row[]),
      ),
    ).then((lists) => {
      if (cancelled) return
      setRows(
        lists.flat().sort((a, b) => b.requestTime.localeCompare(a.requestTime)),
      )
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const selected = rows.find((r) => r.id === selectedId)

  return (
    <main>
      <h2>Requests</h2>
      <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
        Refresh
      </button>

      {!hasSavedBuckets && (
        <p>
          No saved buckets yet. <Link to="/">Create one</Link> to start
          capturing requests.
        </p>
      )}
      {hasSavedBuckets && loaded && rows.length === 0 && (
        <p>No requests yet.</p>
      )}

      {rows.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Path</th>
                <th>Address</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={r.id === selectedId ? 'clickable selected' : 'clickable'}
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
                  <td>
                    <Link
                      to={`/buckets/${r.bucketId}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <code>{r.bucketId}</code>
                    </Link>
                  </td>
                  <td className="muted">
                    {new Date(r.requestTime).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <RequestDetail request={selected} />}
    </main>
  )
}

export default RequestsPage
