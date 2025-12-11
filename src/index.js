  // Load environment variables FIRST
  import dotenv from "dotenv";
  dotenv.config();

  import express from "express";
  import app from "./app.js";
  import { connectDB } from "./db/index.js";

  // Constants
  const PORT = process.env.PORT || 8000;

  // Start the server only after DB connection
  const startServer = async () => {
    try {
      await connectDB();
      console.log(" Connected to database successfully");

      app.listen(PORT, () => {
        console.log(` Server is running on port ${PORT}`);
      });

    } catch (error) {
      console.error(" Failed to start server:", error);
      process.exit(1); // Exit the process on failure
    }
  };

  startServer();
