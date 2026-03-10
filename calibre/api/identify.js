import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a master horologist and watch movement expert with encyclopedic knowledge of mechanical, automatic, quartz, and electronic watch movements from all eras and manufacturers.

When given an image or description of a watch movement, provide a detailed identification in strict JSON format only — no markdown, no preamble, no backticks. The JSON must have this exact structure:
{
  "movement_name": "Full movement name (e.g. ETA 2824-2, Rolex Cal. 3235, Seagull ST1901)",
  "manufacturer": "Manufacturer name",
  "type": "Automatic / Manual Wind / Quartz / etc.",
  "confidence": "High / Medium / Low",
  "confidence_reason": "Brief reason for confidence level",
  "specs": [
    {"label": "Jewels", "value": "..."},
    {"label": "Frequency", "value": "..."},
    {"label": "Power Reserve", "value": "..."},
    {"label": "Diameter", "value": "..."},
    {"label": "Height", "value": "..."},
    {"label": "Year Introduced", "value": "..."}
  ],
  "key_identification": "One sentence on the most distinctive visual features used to identify this movement",
  "detailed_analysis": "3-4 sentences of expert horological analysis covering construction, finishing quality, historical context, and notable characteristics",
  "found_in": "Notable watches that use this calibre"
}

If you cannot identify the specific calibre, provide your best assessment with Low confidence and explain what family or era the movement belongs to. Return only valid JSON.`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { description, imageBase64, imageMediaType } = req.body;

    if (!description && !imageBase64) {
      return res.status(400).json({ error: "Provide an image or description." });
    }

    let content;
    if (imageBase64) {
      content = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: imageMediaType || "image/jpeg",
            data: imageBase64,
          },
        },
        {
          type: "text",
          text: description?.trim()
            ? `Additional description: ${description}`
            : "Please identify this watch movement.",
        },
      ];
    } else {
      content = `Please identify this watch movement: ${description}`;
    }

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
