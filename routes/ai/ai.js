const express = require("express")
const router = express.Router()

const OpenAI = require("openai")

// Load your API key
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

/**
 *  Global Capacity "Ask Anything" Endpoint
 *  POST /api/ai/ask
 *  Body: { question: "..." }
 */
router.post("/ask", async (req, res) => {
    try {
        const { question } = req.body

        if (!question) {
            return res.status(400).send({ status: "error", msg: "Question cannot be empty" })
        }

        // Send the question to GPT-4o-mini
        const response = await client.responses.create({ model: "gpt-4o-mini", input: question })

        // Extract the model's answer
        const reply = response.output_text || "I couldn't generate a response."

        return res.status(200).send({ status: "ok", msg: 'success', question, answer: reply })

    } catch (err) {
        console.error("AI Error:", err)
        return res.status(500).send({ status: "error", msg: "AI request failed", error: err.message })
    }
})

module.exports = router