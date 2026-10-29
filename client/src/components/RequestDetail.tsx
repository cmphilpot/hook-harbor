import type { RequestData } from '../types'

// Bodies are always shown as text (never rendered as HTML), since anyone can
// send anything to a bucket.
function formatBody(request: RequestData) {
  if (request.bodyEncoding === 'base64') {
    return `Binary body, ${atob(request.body).length} bytes (base64):\n${request.body}`
  }
  if (!request.body) return '(empty)'
  try {
    return JSON.stringify(JSON.parse(request.body), null, 2)
  } catch {
    return request.body
  }
}

function RequestDetail({ request }: { request: RequestData }) {
  const headers = JSON.parse(request.headers) as Record<string, string>
  const query = Object.entries(request.query)

  return (
    <section>
      <h3>
        {request.method} {request.path}
      </h3>
      <p>Received {new Date(request.requestTime).toLocaleString()}</p>

      <h4>Query</h4>
      {query.length === 0 ? (
        <p>(none)</p>
      ) : (
        <table>
          <tbody>
            {query.map(([key, value]) => (
              <tr key={key}>
                <th>{key}</th>
                <td>{Array.isArray(value) ? value.join(', ') : value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h4>Headers</h4>
      <table>
        <tbody>
          {Object.entries(headers).map(([key, value]) => (
            <tr key={key}>
              <th>{key}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>Body</h4>
      <pre>{formatBody(request)}</pre>
    </section>
  )
}

export default RequestDetail
