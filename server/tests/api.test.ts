import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";

// Each test makes its own bucket, since the store keeps data between tests
async function newBucketId(): Promise<string> {
  const res = await request(app).post("/api/buckets");
  return res.body.id;
}

describe("API", () => {
  it("reports health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("creates a bucket with an 8-character id", async () => {
    const res = await request(app).post("/api/buckets");
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^[0-9a-zA-Z\-._~]{8}$/);
    expect(new Date(res.body.createdAt).toString()).not.toBe("Invalid Date");
  });

  it("gets a bucket by id", async () => {
    const id = await newBucketId();
    const res = await request(app).get(`/api/buckets/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it("returns 404 for an unknown bucket", async () => {
    const res = await request(app).get("/api/buckets/nope1234");
    expect(res.status).toBe(404);
    const requests = await request(app).get("/api/buckets/nope1234/requests");
    expect(requests.status).toBe(404);
  });

  it("starts a new bucket with no requests", async () => {
    const id = await newBucketId();
    const res = await request(app).get(`/api/buckets/${id}/requests`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("Capture", () => {
  it("returns 404 for an unknown bucket", async () => {
    const res = await request(app).post("/b/nope1234").send({ a: 1 });
    expect(res.status).toBe(404);
  });

  // /orders/42?status=paid is a made-up example of what a store might send for
  // an order webhook ("order 42 was paid"); any path and query would do. It has
  // both so one request tests the trickiest part of capture.ts, splitting the
  // URL /b/<id>/orders/42?status=paid into:
  //   - path "/orders/42": the bucket id cut off the front and nothing more
  //     (an off-by-one slice would give "rders/42" or "<id>/orders/42")
  //   - query { status: "paid" }: kept separately, not left in the path
  // The X-Test header and JSON body check that headers and bodies are saved too.
  // A request to the bucket root itself is covered by the next test.
  it("captures method, path, query, headers and a JSON body", async () => {
    const id = await newBucketId();
    const res = await request(app)
      .post(`/b/${id}/orders/42?status=paid`)
      .set("X-Test", "hello")
      .send({ amount: 10 });
    expect(res.body).toEqual({ received: true });

    const list = await request(app).get(`/api/buckets/${id}/requests`);
    expect(list.body).toHaveLength(1);
    const captured = list.body[0];
    expect(captured.method).toBe("POST");
    expect(captured.path).toBe("/orders/42");
    expect(captured.query).toEqual({ status: "paid" });
    expect(JSON.parse(captured.headers)["x-test"]).toBe("hello");
    expect(captured.bodyEncoding).toBe("utf8");
    expect(JSON.parse(captured.body)).toEqual({ amount: 10 });
  });

  it("records a request to the bucket root with path /", async () => {
    const id = await newBucketId();
    await request(app).get(`/b/${id}`);
    const list = await request(app).get(`/api/buckets/${id}/requests`);
    expect(list.body[0].method).toBe("GET");
    expect(list.body[0].path).toBe("/");
    expect(list.body[0].body).toBe("");
  });

  // capture.ts stores text content types (JSON, XML, forms, text/*) as text
  // and anything else as base64, since raw bytes forced into a text string get
  // corrupted. The six bytes are made up: 0x89 0x50 0x4e 0x47 is how every PNG
  // file starts, so it looks like an image, and 0x00 and 0xff aren't valid
  // text, so they'd come back changed if the body were wrongly stored as text.
  // application/octet-stream is the generic "raw binary" type, which should
  // pick base64; decoding what was stored must give back the exact same bytes.
  it("stores a binary body as base64", async () => {
    const id = await newBucketId();
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff]);
    await request(app)
      .post(`/b/${id}`)
      .set("Content-Type", "application/octet-stream")
      .send(bytes);

    const list = await request(app).get(`/api/buckets/${id}/requests`);
    expect(list.body[0].bodyEncoding).toBe("base64");
    expect(Buffer.from(list.body[0].body, "base64")).toEqual(bytes);
  });

  it("lists requests newest first", async () => {
    const id = await newBucketId();
    await request(app).post(`/b/${id}/first`);
    // Make sure the second request gets a later timestamp
    await new Promise((resolve) => setTimeout(resolve, 5));
    await request(app).post(`/b/${id}/second`);

    const list = await request(app).get(`/api/buckets/${id}/requests`);
    expect(list.body.map((r: { path: string }) => r.path)).toEqual([
      "/second",
      "/first",
    ]);
  });
});
