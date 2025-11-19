import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";

// Middleware
app.use(express.json({limit:'10kb'})); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit:'10kb' })); // To parse URL-encoded request bodies
app.use(cookieParser());// to parse cookies from incoming requests
app.use(express.static('public')); // Serve static files from the 'public' directory

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));