import express from "express";
import morgan from "morgan";
import path from "node:path";
import apiRouter from "./routes/api.js";
import captureRouter from "./routes/capture.js";

// Built here and started in index.ts, so tests can use the app without a port
const app = express();

// Request logging, skipped in tests to keep their output readable
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Body parsing is set per router: JSON for the API, raw bytes for captures
app.use("/api", apiRouter);
app.use("/b", captureRouter);

// In production, serve the built React app
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(import.meta.dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.use((_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

export default app;
