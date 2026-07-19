import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./DB/db.config.js";
import mainRouter from "./src/api/main.routes.js";
import { errorHandler } from "./src/middleware/error-handler.js";

const app = express();

// const allowedOrigins = [
//   "http://localhost:5173", // For local testing
//   process.env.FRONTEND_URL,
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "OPTIONS"],
//     credentials: true,
//   }),
// );

// Parse environment variable string into clean array elements
const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map(url => url.trim().replace(/\/$/, "")) // Strips accidental trailing slashes
  : [];

// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:5174",
//   "https://chatgpt-clone-frontend-six.vercel.app",
//   "https://chatgpt-clone-frontend-git-main-gpt-clone.vercel.app",
//   ...envOrigins
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // Stripping trailing slash from incoming browser headers just in case
//       const cleanOrigin = origin ? origin.replace(/\/$/, "") : null;
      
//       if (!cleanOrigin || allowedOrigins.includes(cleanOrigin)) {
//         callback(null, true);
//       } else {
//         callback(new Error(`CORS policy violation: ${origin} not allowed.`));
//       }
//     },
//     methods: ["GET", "POST", "OPTIONS"],
//     credentials: true,
//   }),
// );

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["https://chatgpt-clone-frontend-six.vercel.app/"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
