<p align="center">
  <img src="client/public/hook-harbor-readme.png" alt="HookHarbor logo" width="180" />
</p>

# HookHarbor

A full-stack webhook testing tool for inspecting HTTP requests. Built with React, TypeScript, Node.js, Express, PostgreSQL and MongoDB, and deployed on DigitalOcean behind NGINX at [hookharbor.chasephilpot.com](https://hookharbor.chasephilpot.com).

It lets developers capture, inspect and debug HTTP requests with ease. Each pier is a unique URL that captures every request sent to it, which makes it easy to test webhooks and see exactly what arrived.

## Features

- ⚓ **Create piers:** generate unique URLs that collect incoming HTTP requests.
- 📋 **Request inspection:** view the method, path, query, headers and body of each request.
- 📁 **Request history:** browse each pier's requests newest first, or every saved pier's requests together on the Requests page.
- 💾 **Saved in your browser:** piers you create are kept in your browser's local storage, so they're still listed after a reload.

## How it works

1. Create a pier on the home page. It gets a random 8-character ID (for example `JkxfzK29`).
2. Send any HTTP request to its capture URL, `/p/JkxfzK29`. Anything after the ID is recorded as the path, so `/p/JkxfzK29/orders/42` works too. Use curl, Postman or a real webhook.
3. Open the pier's page, `/piers/JkxfzK29`, and click **Refresh** to see each captured request with its headers and body.

## Technologies

### Frontend
- React with React Router, built with Vite
- TypeScript
- Custom CSS in an isometric, risograph-inspired style
- Local Storage API for remembering which piers belong to a browser

### Backend
- Node.js 24 with Express 5
- TypeScript
- PostgreSQL for piers and request metadata (method, path, query, headers, time)
- MongoDB for request bodies
- Vitest and Supertest for API tests

### Deployment
- Docker Compose runs the app, PostgreSQL and MongoDB, with the databases on a private network
- NGINX (shared by other apps on the droplet) handles HTTPS and forwards traffic to the app
- Let's Encrypt certificate

## System architecture

HookHarbor stores each request across two databases:

**PostgreSQL stores:**
- Piers (8-character ID, creation time)
- Request metadata (UUID, method, path, query, headers, time received)
- The ID of the MongoDB document that holds the request's body

**MongoDB stores:**
- Request bodies, as text, or as base64 for binary content such as images

The body is saved to MongoDB first, then the metadata to PostgreSQL. If the PostgreSQL insert fails, the MongoDB document is removed so no orphaned bodies are left behind. When a pier's requests are listed, all their bodies are fetched in a single MongoDB query.

## API routes

### Piers

`POST /api/piers` creates a new pier.
- Response: `201 Created` with the new pier, e.g. `{"id":"JkxfzK29","createdAt":"2026-11-05T11:18:10.580Z"}`

`GET /api/piers/:id` gets a pier.
- Response: the pier, or `404` with `{"error":"Pier not found"}`

`GET /api/piers/:id/requests` gets all requests sent to a pier, newest first.
- Response: an array of request objects (see the example below), or `404` if the pier doesn't exist

### Request capture

`ANY /p/:id` and `ANY /p/:id/any/path` capture any HTTP request sent there.
- Any method is accepted (GET, POST, PUT, DELETE and so on)
- The method, path, query, headers and body (up to 1 MB) are stored
- Response: `200 OK` with `{"received":true}`, or `404` with `{"error":"Pier not found"}`

## Example usage

The examples below use a pier with the ID `JkxfzK29`. Real IDs are randomly generated.

### Creating a pier

Click **+ Create pier** on the home page, or:

```sh
curl -X POST https://hookharbor.chasephilpot.com/api/piers
```

Example response:

```json
{ "id": "JkxfzK29", "createdAt": "2026-11-05T11:18:10.580Z" }
```

<img width="1084" height="392" alt="create pier" src="https://github.com/user-attachments/assets/ae63a04f-78b4-466d-bfd7-b57303fcbcc0" />

### Sending requests to a pier

```sh
curl -X POST https://hookharbor.chasephilpot.com/p/JkxfzK29 \
  -H "Content-Type: application/json" \
  -d '{"hello": "POST request from me to you"}'
```

Example response: `{"received":true}`

### Viewing a pier's requests

Open `/piers/JkxfzK29` in the browser, or:

```sh
curl https://hookharbor.chasephilpot.com/api/piers/JkxfzK29/requests
```

<img width="1116" height="402" alt="pier request" src="https://github.com/user-attachments/assets/398a8004-d51c-4fb8-a7c1-e218c7cf20aa" />

Example response (headers shortened):

```json
[
  {
    "id": "3f1c2a9e-8b7d-4e6f-9a01-2b3c4d5e6f70",
    "method": "POST",
    "requestTime": "2026-11-05T11:18:10.580Z",
    "headers": "{\"content-type\":\"application/json\",\"user-agent\":\"curl/8.7.1\"}",
    "body": "{\"hello\": \"POST request from me to you\"}",
    "bodyEncoding": "utf8",
    "path": "/",
    "query": {}
  }
]
```

`headers` is a JSON string. `bodyEncoding` is `utf8` for text bodies and `base64` for binary ones.
