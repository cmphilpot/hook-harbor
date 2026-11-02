import type { RequestData } from '../types'
import RequestDetail from './RequestDetail'

// Right-hand column of the two-column layout. On narrow screens it sits below
// the table and is hidden until a request is selected.
function DetailPanel({ selected }: { selected: RequestData | undefined }) {
  return (
    <aside className={selected ? 'detail-panel' : 'detail-panel is-empty'}>
      {selected ? (
        <RequestDetail request={selected} />
      ) : (
        <p className="muted">Select a request to see its details.</p>
      )}
    </aside>
  )
}

export default DetailPanel
