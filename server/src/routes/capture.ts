import express from "express";
import { addRequest, getBucket } from "../store.js";

const router = express.Router();

// Keep the body exactly as sent, whatever its content type
router.use(express.raw({ type: "*/*", limit: "1mb" }));

// Matches /b/:bucketId and anything after it, for any method
router.all("/:bucketId{/*rest}", (req, res) => {
  const { bucketId } = req.params;
  if (!getBucket(bucketId)) {
    res.status(404).json({ error: "Bucket not found" });
    return;
  }

  addRequest(bucketId, {
    method: req.method,
    headers: JSON.stringify(req.headers),
    body: Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "",
  });

  res.json({ received: true });
});

export default router;
