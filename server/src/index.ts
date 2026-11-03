import app from "./app.js";
import { initDb } from "./db/schema.js";

const PORT = Number(process.env.PORT) || 3000;

// Tables must exist before the first request comes in
try {
  await initDb();
} catch (error) {
  console.error("Failed to initialize database:", error);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
