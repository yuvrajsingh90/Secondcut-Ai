const express = require("express");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Allow our React frontend to call this server
app.use(
  cors({
   origin: ["https://preeminent-stroopwafel-4f9f02.netlify.app","http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
  })
);

// Store uploaded image temporarily in memory
const upload = multer({
  storage: multer.memoryStorage(),
});

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Second Cut AI backend is running",
  });
});

// Remove background
app.post("/remove-background", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const apiKey = process.env.CLIPDROP_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Clipdrop API key is not configured",
      });
    }

    const formData = new FormData();

    formData.append(
      "image_file",
      new Blob([req.file.buffer], {
        type: req.file.mimetype,
      }),
      req.file.originalname
    );

    const response = await fetch(
      "https://clipdrop-api.co/remove-background/v1",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Clipdrop error:", response.status, errorText);

      return res.status(response.status).json({
        success: false,
        message: "Clipdrop background removal failed",
      });
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());

    res.set({
      "Content-Type": "image/png",
      "Content-Length": resultBuffer.length,
    });

    return res.send(resultBuffer);
  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Second Cut AI backend running at http://localhost:${PORT}`);
});