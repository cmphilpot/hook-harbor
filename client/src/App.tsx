import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState('checking...')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('server unreachable'))
  }, [])

  return (
    <main>
      <h1>Hook Haven</h1>
      <p>Server status: {status}</p>
    </main>
  )
}

export default App
