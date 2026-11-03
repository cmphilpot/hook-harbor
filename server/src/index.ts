import app from "./app.js";
import { initDb } from "./db/schema.js";

const PORT = Number(process.env.PORT) || 3000;

// Tables must exist before the first request comes in
await initDb();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
