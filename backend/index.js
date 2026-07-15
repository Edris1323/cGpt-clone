import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./DB/db.config.js";
import mainRouter from "./src/api/main.routes.js";
import { errorHandler } from "./src/middleware/error-handler.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
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

    app.listen(3888, () => {
      console.log("Server is running at http://localhost:3888");
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();
