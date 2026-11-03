import express from "express";
import { createBucket, getBucket, getRequests } from "../store.js";

const router = express.Router();

router.use(express.json());

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.post("/buckets", async (_req, res) => {
  res.status(201).json(await createBucket());
});

router.get("/buckets/:id", async (req, res) => {
  const bucket = await getBucket(req.params.id);
  if (!bucket) {
    res.status(404).json({ error: "Bucket not found" });
    return;
  }
  res.json(bucket);
});

router.get("/buckets/:id/requests", async (req, res) => {
  if (!(await getBucket(req.params.id))) {
    res.status(404).json({ error: "Bucket not found" });
    return;
  }
  res.json(await getRequests(req.params.id));
});

export default router;
