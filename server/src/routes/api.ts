import express from "express";
import { createBucket, getBucket, getRequests } from "../store.js";

const router = express.Router();

router.use(express.json());

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.post("/buckets", (_req, res) => {
  res.status(201).json(createBucket());
});

router.get("/buckets/:id", (req, res) => {
  const bucket = getBucket(req.params.id);
  if (!bucket) {
    res.status(404).json({ error: "Bucket not found" });
    return;
  }
  res.json(bucket);
});

router.get("/buckets/:id/requests", (req, res) => {
  if (!getBucket(req.params.id)) {
    res.status(404).json({ error: "Bucket not found" });
    return;
  }
  res.json(getRequests(req.params.id));
});

export default router;
