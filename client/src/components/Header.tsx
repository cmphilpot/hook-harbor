import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { getSavedBuckets } from '../services/savedBuckets'
import type { Bucket } from '../types'

function Header() {
  const navigate = useNavigate()
  const [buckets, setBuckets] = useState<Bucket[]>([])

  // Re-read on open so buckets created or deleted since are reflected
  const loadBuckets = () => setBuckets(getSavedBuckets())

  return (
    <header>
      <Link to="/" className="brand">
        {/* Decorative: the name next to it is the accessible label */}
        <img src="/Hook-Harbor-logo.png" alt="" className="logo" />
        <h1>HookHarbor</h1>
      </Link>
      <nav className="nav">
        <button
          type="button"
          className="nav-button"
          onClick={() => navigate('/')}
        >
          Home
        </button>
        {/* Menu opens on hover, or on keyboard focus */}
        <div className="menu" onMouseEnter={loadBuckets} onFocus={loadBuckets}>
          <button
            type="button"
            className="nav-button"
            onClick={() => navigate('/requests')}
          >
            Requests
          </button>
          <ul className="menu-list">
            {/* Labels the addresses below: each opens that pier's requests */}
            <li className="menu-heading">Piers</li>
            {buckets.length === 0 ? (
              <li className="menu-empty">None yet</li>
            ) : (
              buckets.map((b) => (
                <li key={b.id}>
                  <Link
                    to={`/piers/${b.id}`}
                    // Drop focus so the menu closes after choosing
                    onClick={(e) => e.currentTarget.blur()}
                  >
                    <code>{b.id}</code>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </nav>
    </header>
  )
}

export default Header
