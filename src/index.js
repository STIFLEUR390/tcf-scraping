import "dotenv/config";
import express from "express";
import cors from "cors";
import { apiScrapeExpressionEcrite, apiScrapeExpressionOrale } from "./scap.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "../public")));

// Point de terminaison pour le scraping des expressions écrites
app.post("/api/scrape/expression-ecrite", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: "URL requise",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const result = await apiScrapeExpressionEcrite(url);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      url: url,
      timestamp: new Date().toISOString(),
    });
  }
});

// Point de terminaison pour le scraping des expressions orales
app.post("/api/scrape/expression-orale", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: "URL requise",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const result = await apiScrapeExpressionOrale(url);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      url: url,
      timestamp: new Date().toISOString(),
    });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
