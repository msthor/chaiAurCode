import { Router } from "express";
import {
  registerUser,
  loggedInUser,
  logoutUser,
  refreshAccessToken
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Register → needs avatar + coverImage
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  registerUser
);

// Login → does NOT need images
router.post("/login", loggedInUser);

// Secure routes
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);

export default router;
