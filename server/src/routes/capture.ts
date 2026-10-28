import express from "express";
import { addRequest, getBucket } from "../store.js";

const router = express.Router();

// Content types stored as readable text; everything else is stored as base64
const TEXT_TYPES =
  /^(text\/|application\/(json|xml|x-www-form-urlencoded|.*\+json|.*\+xml))/i;

// Keep the body exactly as sent, whatever its content type
router.use(express.raw({ type: "*/*", limit: "1mb" }));

// Matches /b/:bucketId and anything after it, for any method
router.all("/:bucketId{/*rest}", (req, res) => {
  const { bucketId } = req.params;
  if (!getBucket(bucketId)) {
    res.status(404).json({ error: "Bucket not found" });
    return;
  }

  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  const isText =
    raw.length === 0 || TEXT_TYPES.test(req.get("content-type") ?? "");

  addRequest(bucketId, {
    method: req.method,
    headers: JSON.stringify(req.headers),
    body: raw.toString(isText ? "utf8" : "base64"),
    bodyEncoding: isText ? "utf8" : "base64",
    path: req.path.slice(1 + bucketId.length) || "/",
    query: req.query as Record<string, string | string[]>,
  });

  res.json({ received: true });
});

export default router;
