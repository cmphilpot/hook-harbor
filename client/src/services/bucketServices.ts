import type { Bucket } from '../types'

export async function createBucket(): Promise<Bucket> {
  const res = await fetch('/api/buckets', { method: 'POST' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
