const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Assistant ID from dashboard
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

// app.get("/chatt", (req, res) => {
//   res.status(200).json({ status: "ok", message: "api is on" });
// });

router.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Create a new thread
    const thread = await client.beta.threads.create();

    // Add user message
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage,
    });

    // Run assistant
    const run = await client.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: ASSISTANT_ID,
    });

    // Get messages
    const messages = await client.beta.threads.messages.list(thread.id);

    // Reply is last assistant message
    const reply = messages.data[0].content[0].text.value;

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;