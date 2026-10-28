import express from "express";
import path from "node:path";
import { createBucket, getBucket } from "./store.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/buckets", (_req, res) => {
  res.status(201).json(createBucket());
});

app.get("/api/buckets/:id", (req, res) => {
  const bucket = getBucket(req.params.id);
  if (!bucket) {
    res.status(404).json({ error: "Bucket not found" });
    return;
  }
  res.json(bucket);
});

// In production, serve the built React app
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(import.meta.dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.use((_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
