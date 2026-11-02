import type { Bucket } from '../types'

// Buckets this browser created, kept in localStorage (newest first).
// localStorage can be unavailable (e.g. some private windows), so every
// access is wrapped and failures just mean nothing is remembered.

const KEY = 'hookHarbor.buckets'

export function getSavedBuckets(): Bucket[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(buckets: Bucket[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(buckets))
  } catch {
    // Storage unavailable or full; nothing to do
  }
}

export function saveBucket(bucket: Bucket) {
  write([bucket, ...getSavedBuckets().filter((b) => b.id !== bucket.id)])
}

export function removeBucket(id: string) {
  write(getSavedBuckets().filter((b) => b.id !== id))
}
