const express = require("express");
const { extractClaim } = require("../src/services/llmservice");
const router = express.Router();
router.post("/extract", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
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
      message: error.message || "Failed to extract claim information",
    });
  }
});
module.exports = router;
