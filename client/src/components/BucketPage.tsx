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
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  )
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
  const captureUrl = `${window.location.origin}/b/${id}`

  // The browser only allows this on HTTPS pages and localhost
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(captureUrl)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    setTimeout(() => setCopyState('idle'), 2000)
  }

  return (
    <main>
      {/* Bucket ID on the left, Refresh on the right */}
      <div className="section-header">
        <h2>
          <span className="sr-only">Bucket </span>
          <span className="bucket-id">{id}</span>
        </h2>
        <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
          Refresh
        </button>
      </div>

      {/* URL on the left (wraps on narrow screens), Copy button on the right */}
      <div className="card capture-card">
        <div className="capture-text">
          <p className="capture-label">Capture URL</p>
          <code className="capture-url">{captureUrl}</code>
        </div>
        <button type="button" className="icon-button" onClick={handleCopy}>
          {copyState === 'copied' ? (
            // Check mark
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            // Two overlapping sheets: the usual copy symbol
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <rect
                x="9"
                y="9"
                width="11"
                height="11"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M5 15V6a2 2 0 0 1 2-2h8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
          {copyState === 'copied' ? 'Copied' : 'Copy URL'}
        </button>
        {/* Announces the result to screen readers */}
        <span className="sr-only" role="status">
          {copyState === 'copied'
            ? 'Copied'
            : copyState === 'failed'
              ? 'Copy failed'
              : ''}
        </span>
      </div>

      {error && <p>{error}</p>}

      {!error && requests.length === 0 && (
        <section className="empty-state">
          <h2>No requests captured yet</h2>
          <p>
            Send any HTTP request to this bucket's capture URL and it will
            appear here.
          </p>
          <code className="capture-url">{captureUrl}</code>
          <p>Any method, any body — GET, POST, PUT, anything.</p>
        </section>
      )}
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
