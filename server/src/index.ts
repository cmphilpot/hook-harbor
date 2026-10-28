import express from "express";
import morgan from "morgan";
import path from "node:path";
import apiRouter from "./routes/api.js";
import captureRouter from "./routes/capture.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(morgan("dev"));

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
