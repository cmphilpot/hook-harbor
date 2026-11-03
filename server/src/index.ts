import app from "./app.js";
import { mongoClient } from "./db/mongo.js";
import { initDb } from "./db/schema.js";

const PORT = Number(process.env.PORT) || 3000;

// Tables must exist, and MongoDB be reachable, before the first request comes in
try {
  await initDb();
  await mongoClient.connect();
} catch (error) {
  console.error("Failed to initialize databases:", error);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
