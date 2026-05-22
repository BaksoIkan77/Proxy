const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json({ limit: "10mb" }));

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

app.post("/v1/chat/completions", async (req, res) => {
  const body = {
    ...req.body,
    thinking: { type: "disabled" }, // ← Selalu non-thinking
  };

  // Paksa model ke deepseek-v4-flash jika pakai alias lama
  if (!body.model || body.model === "deepseek-chat") {
    body.model = "deepseek-v4-flash";
  }

  try {
    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );

    // Support streaming
    if (body.stream) {
      res.setHeader("Content-Type", "text/event-stream");
      response.body.pipe(res);
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint list models (dibutuhkan beberapa client)
app.get("/v1/models", (req, res) => {
  res.json({
    data: [{ id: "deepseek-v4-flash", object: "model" }],
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
