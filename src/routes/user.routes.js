import { Router } from "express";
import {registerUser, loggedInUser , logoutUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", upload, registerUser);

router.route("/login").post(upload, loggedInUser);
router.route("/me").get(verifyJWT, loggedInUser);
export default router;



// i need to fied route bcoz i change now 