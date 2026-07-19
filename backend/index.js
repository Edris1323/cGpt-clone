import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./DB/db.config.js";
import mainRouter from "./src/api/main.routes.js";
import { errorHandler } from "./src/middleware/error-handler.js";

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean); // Removes undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"], // Added standard methods
    credentials: true,
  }),
);

// Middleware to parse JSON request bodies
app.use(express.json());
// Use the main router for all API routes
app.use("/api", mainRouter);

//final middleware for error handling
app.use(errorHandler);

async function startServer() {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log("Database connection successful");

    const PORT = process.env.PORT || 3888; // Fallback to 3888 for local development

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();
