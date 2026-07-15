import db from "../../../../DB/db.config.js";
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash-lite";
const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const getRecentConversationRows = async (limit = 5) => {
  const normalizedLimit = Number.parseInt(limit, 10);
  const safeLimit =
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0
      ? 20
      : normalizedLimit;

  const [rows] = await db.execute(
    `SELECT id, role, content, created_at FROM conversations ORDER BY id DESC LIMIT ${safeLimit}`,
  );

  // Reverse the rows to get oldest history first
  return rows.reverse();
};

const generateAssistantAnswer = async ({ historyRows, question }) => {
  // Format the history correctly for the official SDK
  const formattedHistory = historyRows.map((row) => ({
    role: row.role === "assistant" ? "model" : "user",
    parts: [{ text: row.content }],
  }));

  // Create stateful chat session
  const chat = geminiClient.chats.create({
    model: GEMINI_MODEL,
    config: {
      maxOutputTokens: 1024,
    },
    history: formattedHistory,
  });

  const result = await chat.sendMessage({ message: question });
  return result.text;
};

const getMessageById = async (messageId) => {
  const [rows] = await db.execute(
    `SELECT id, role, content, token_count, created_at FROM conversations WHERE id = ? LIMIT 1`,
    [messageId],
  );
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    role: rows[0].role,
    content: rows[0].content,
    tokenCount: rows[0].token_count,
    createdAt: rows[0].created_at,
  };
};

export async function createConversationService(question) {
  try {
    // Validate input
    if (!question || !question.trim()) {
      const error = new Error("Question is required");
      error.status = 400;
      throw error;
    }

    // Get recent rows before saving the new question to avoid history duplication
    const historyRows = await getRecentConversationRows(5);

    // Save the user question
    const [result] = await db.execute(
      "INSERT INTO conversations (content, role) VALUES (?, 'user')",
      [question],
    );

    // Request Gemini AI response
    const assistantAnswer = await generateAssistantAnswer({
      historyRows,
      question,
    });

    // Save the AI answer
    const [createAssistantMessageResult] = await db.execute(
      "INSERT INTO conversations (role, content, token_count) VALUES (?, ?, ?)",
      ["assistant", assistantAnswer, 0], // Changed 'null' to '0'
    );
    // Fetch fully saved database records
    const userConversation = await getMessageById(result.insertId);
    const assistantConversation = await getMessageById(
      createAssistantMessageResult.insertId,
    );

    return {
      userConversation,
      assistantConversation,
    };
  } catch (error) {
    throw error;
  }
}