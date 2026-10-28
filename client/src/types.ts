export interface Bucket {
  id: string
  createdAt: string
}

export interface RequestData {
  id: string
  method: string
  requestTime: string
  headers: string
  body: string // Use the parsed body type here
  bodyEncoding: 'utf8' | 'base64'
  path: string
  query: Record<string, string | string[]>
}
