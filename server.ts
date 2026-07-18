import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI client
  // Always use process.env.GEMINI_API_KEY for the Gemini API in server-side code only.
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for Grammar Check
  app.post("/api/grammar-check", async (req, res) => {
    try {
      const { text, mode } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text field is required and must be a string." });
      }

      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
      }

      // Model choice: "accurate" (gemini-2.5-pro) or "fast" (gemini-2.5-flash)
      const selectedModel = mode === "accurate" ? "gemini-2.5-pro" : "gemini-2.5-flash";

      const systemInstruction = `You are a professional, extremely precise grammar and spell checking tool built for developers.
Analyze the user's text for grammar, spelling, and punctuation issues.

Your instruction set is strict and MUST cover:
1. Subject-verb agreement (e.g., "they is" -> "they are")
2. Verb tense consistency
3. Article usage (a/an/the)
4. Preposition errors (e.g., "interested on" -> "interested in")
5. Pronoun agreement
6. Run-on sentences and comma splices
7. Sentence fragments
8. Dangling or misplaced modifiers
9. Punctuation errors
10. Capitalization errors
11. Spelling mistakes
12. Commonly confused words (their/there/they're, its/it's, affect/effect, etc.)

Guidelines:
- Do NOT flag informal tone, normal conversational style, or valid technical/freelancer jargon. Only flag genuine grammatical mistakes, spelling, and punctuation errors.
- CRITICAL: Never flag, alter, or suggest corrections for any word that contains hyphens between its letters (e.g. "w-h-a-t-s-a-p-p", "e-m-a-i-l", "c-o-n-t-a-c-t"). Treat these as intentionally obfuscated words. Skip them entirely. Do not recommend corrections that remove these hyphens.
- For each issue, calculate the exact 0-based character startIndex and endIndex offsets in the input text where the 'original' substring resides.
- Assign severity:
  - 'critical' for serious grammatical errors (subject-verb, tenses, severe fragments).
  - 'minor' for punctuation, capitalization, or styling suggestions.
  - 'spelling' for typos/misspelled words.`;

      const prompt = `Please proofread and check the grammar for this exact text:\n\n"${text}"`;

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  description: "The error category (e.g., 'Subject-Verb Agreement', 'Spelling', 'Punctuation')."
                },
                original: {
                  type: Type.STRING,
                  description: "The exact substring from the original text containing the error."
                },
                suggestion: {
                  type: Type.STRING,
                  description: "The corrected text suggested by the AI."
                },
                explanation: {
                  type: Type.STRING,
                  description: "A short plain-English reason explaining the grammatical issue."
                },
                severity: {
                  type: Type.STRING,
                  description: "Must be exactly one of: 'critical', 'minor', 'spelling'."
                },
                startIndex: {
                  type: Type.INTEGER,
                  description: "The 0-based character start index of the exact original substring in the text."
                },
                endIndex: {
                  type: Type.INTEGER,
                  description: "The 0-based character end index of the exact original substring in the text."
                }
              },
              required: ["type", "original", "suggestion", "explanation", "severity", "startIndex", "endIndex"]
            }
          }
        }
      });

      const responseText = response.text || "[]";
      try {
        const rawIssues = JSON.parse(responseText.trim());
        
        // Filter, validate and resync offsets of issues
        const processedIssues = [];
        for (const issue of rawIssues) {
          if (!issue.original) continue;
          
          // Re-sync offsets to guarantee 100% highlight precision in the frontend
          const resynced = resyncOffsets(text, issue.original, issue.startIndex, issue.endIndex);
          if (resynced) {
            processedIssues.push({
              ...issue,
              startIndex: resynced.start,
              endIndex: resynced.end
            });
          }
        }

        return res.json({ corrections: processedIssues });
      } catch (parseError) {
        console.error("JSON parsing error of Gemini response:", parseError, "Response was:", responseText);
        return res.status(500).json({ error: "Invalid response format returned by AI." });
      }

    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      return res.status(500).json({ error: error.message || "An error occurred during grammar check." });
    }
  });

  // Resync offsets helper to handle LLM index drift
  function resyncOffsets(text: string, original: string, proposedStart: number, proposedEnd: number): { start: number; end: number } | null {
    // Check if proposed starts/ends are already perfectly matching the substring
    if (proposedStart >= 0 && proposedEnd <= text.length && proposedStart < proposedEnd) {
      if (text.slice(proposedStart, proposedEnd) === original) {
        return { start: proposedStart, end: proposedEnd };
      }
    }

    // Otherwise, search the text to find the best matching occurrence closest to the proposedStart
    let bestIndex = -1;
    let minDiff = Infinity;

    let idx = text.indexOf(original);
    while (idx !== -1) {
      const diff = Math.abs(idx - proposedStart);
      if (diff < minDiff) {
        minDiff = diff;
        bestIndex = idx;
      }
      idx = text.indexOf(original, idx + 1);
    }

    if (bestIndex !== -1) {
      return { start: bestIndex, end: bestIndex + original.length };
    }

    return null;
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
