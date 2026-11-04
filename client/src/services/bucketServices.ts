import type { Bucket, RequestData } from '../types'

export async function createBucket(): Promise<Bucket> {
  const res = await fetch('/api/piers',{ method: 'POST' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getRequests(bucketId: string): Promise<RequestData[]> {
  const res = await fetch(`/api/piers/${bucketId}/requests`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
