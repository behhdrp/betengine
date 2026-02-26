import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import handler from "./handler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Use the handler for API routes
app.use("/api", handler);

// Serve static files from dist
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

export default app;
