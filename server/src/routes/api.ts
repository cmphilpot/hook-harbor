import express from "express";
import { createBucket, getBucket, getRequests } from "../store.js";

const router = express.Router();

router.use(express.json());

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// URLs say "piers" (the user-facing name); the code and database keep "bucket"
router.post("/piers", async (_req, res) => {
  res.status(201).json(await createBucket());
});

router.get("/piers/:id", async (req, res) => {
  const bucket = await getBucket(req.params.id);
  if (!bucket) {
    res.status(404).json({ error: "Pier not found" });
    return;
  }
  res.json(bucket);
});

router.get("/piers/:id/requests", async (req, res) => {
  if (!(await getBucket(req.params.id))) {
    res.status(404).json({ error: "Pier not found" });
    return;
  }
  res.json(await getRequests(req.params.id));
});

export default router;
