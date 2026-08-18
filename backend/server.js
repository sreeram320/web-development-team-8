const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { extractClaim } = require("./src/services/llmService");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Forma AI Backend is running",
  });
});

app.post("/api/extract", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    const result = await extractClaim(text);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("LLM Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Forma AI backend running on port ${PORT}`);
});