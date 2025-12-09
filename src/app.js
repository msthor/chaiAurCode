import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "../src/middlewares/error.middleware.js"

// Middleware
app.use(express.json({limit:'10kb'})); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit:'10kb' })); // To parse URL-encoded request bodies
app.use(cookieParser());// to parse cookies from incoming requests
app.use(express.static('public')); // Serve static files from the 'public' directory


// routes import
import userRoutes from "./routes/user.routes.js";

// routes declaration

app.use("/api/v1/users", userRoutes);

app.use(errorHandler);


// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true
// }));

export default app;