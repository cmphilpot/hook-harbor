import type { Bucket, RequestData } from '../types'

export async function createBucket(): Promise<Bucket> {
  const res = await fetch('/api/buckets', { method: 'POST' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getRequests(bucketId: string): Promise<RequestData[]> {
  const res = await fetch(`/api/buckets/${bucketId}/requests`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
