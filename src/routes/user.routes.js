import { Router } from "express";
import {registerUser, loggedInUser , logoutUser,refreshAccessToken} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.post("/register", upload, registerUser);

router.post("/login" , upload, loggedInUser);

//secure route
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);

export default router;



